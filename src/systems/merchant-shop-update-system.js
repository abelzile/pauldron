import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import Rectangle from '../rectangle';
import System from '../system';
import Vector from '../vector';

export default class MerchantShopUpdateSystem extends System {
  constructor(renderer, entityManager, merchantId) {
    super();

    this.RelevantHeroSlotTypes = [Const.InventorySlot.Backpack];
    this.HideHeroSlotTypesOnUnload = [Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar];
    this.RelevantMerchantSlotTypes = [Const.MerchantSlot.Stock, Const.MerchantSlot.Buy];
    this.HideMerchantSlotTypesOnUnload = [Const.MerchantSlot.Stock];

    this._renderer = renderer;
    this._entityManager = entityManager;
    this._merchantId = merchantId;
    this._merchant = EntityFinders.findById(this._entityManager.entities, this._merchantId);

    this._relevantHeroEntRefs = this._entityManager.heroEntity.getAll('EntityReferenceComponent', entRef =>
      _.includes(this.RelevantHeroSlotTypes, entRef.typeId)
    );
    this._relevantMerchantEntRefs = this._merchant.getAll('EntityReferenceComponent', entRef =>
      _.includes(this.RelevantMerchantSlotTypes, entRef.typeId)
    );
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._initHeroItems(entities);
    this._initMerchantItems(entities);

    return this;
  }

  processEntities(gameTime, entities, input) {}

  unload(entities, levelScreen) {
    _(this._relevantHeroEntRefs)
      .map(c => EntityFinders.findById(entities, c.entityId))
      .filter(e => e && e.has('InventoryIconComponent'))
      .tap(ents => {
        ents.sort(EntitySorters.sortInventory);
      })
      .forEach(e => {
        const iconSprite = e.get('InventoryIconComponent').sprite;
        iconSprite.removeAllListeners();
        iconSprite._dragging = false;
        iconSprite._data = null;
        if (iconSprite._startPos) {
          iconSprite.position.x = iconSprite._startPos.x;
          iconSprite.position.y = iconSprite._startPos.y;
          iconSprite._startPos.pdispose();
        }
        iconSprite._startPos = null;

        const isVisible = !_.includes(
          this.HideHeroSlotTypesOnUnload,
          _.find(this._relevantHeroEntRefs, c => c.entityId === e.id).typeId
        );

        if (e.has('AnimatedSpriteComponent')) {
          const mc = e.get('AnimatedSpriteComponent');
          mc.visible = isVisible;

          levelScreen.removeChild(mc.animatedSprite);
          levelScreen.addChild(mc.animatedSprite);
        }

        if (e.has('MeleeAttackComponent')) {
          const g = e.get('MeleeAttackComponent').graphics;
          g.visible = isVisible;

          levelScreen.removeChild(g);
          levelScreen.addChild(g);
        }
      });
  }

  _initHeroItems(entities) {
    _(this._relevantHeroEntRefs)
      .map(entRef => EntityFinders.findById(entities, entRef.entityId))
      .filter(item => item && item.has('InventoryIconComponent'))
      .forEach(this._initHeroItem.bind(this));
  }

  _initMerchantItems(entities) {
    _(this._relevantMerchantEntRefs)
      .map(entRef => EntityFinders.findById(entities, entRef.entityId))
      .filter(item => item && item.has('InventoryIconComponent'))
      .forEach(this._initMerchantItem.bind(this));
  }

  _initHeroItem(item) {
    this._initItem(item);
    item
      .get('InventoryIconComponent')
      .sprite.on('mouseup', eventData => this._onHeroDragEnd(eventData, item.get('InventoryIconComponent')))
      .on('mouseupoutside', eventData => this._onHeroDragEnd(eventData, item.get('InventoryIconComponent')));
  }

  _initMerchantItem(item) {
    this._initItem(item);
    item
      .get('InventoryIconComponent')
      .sprite.on('mouseup', eventData => this._onMerchantDragEnd(eventData, item.get('InventoryIconComponent')))
      .on('mouseupoutside', eventData => this._onMerchantDragEnd(eventData, item.get('InventoryIconComponent')));
  }

  _initItem(item) {
    const inventoryIcon = item.get('InventoryIconComponent');
    const sprite = inventoryIcon.sprite;
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite
      .removeAllListeners()
      .on('mousedown', eventData => this._onStartDrag(eventData, sprite))
      .on('mousemove', eventData => this._onDrag(eventData, sprite))
      .on('mouseover', eventData => {
        this._setCurrentItem(item);
      })
      .on('mouseout', eventData => {
        this._setCurrentItem();
      });
  }

  _setCurrentItem(entity) {
    EntityFinders.findMerchantShopGui(this._entityManager.entities).get(
      'CurrentEntityReferenceComponent'
    ).entityId = entity ? entity.id : '';
  }

  _onStartDrag(eventData, iconSprite) {
    this.emit('start-drag', iconSprite);

    iconSprite._data = eventData.data;
    iconSprite._dragging = true;
    iconSprite._startPos = Vector.pnew(eventData.target.position.x, eventData.target.position.y);
  }

  _onDrag(eventData, iconSprite) {
    if (iconSprite._dragging) {
      const newPosition = iconSprite._data.getLocalPosition(iconSprite.parent);
      iconSprite.position.x = newPosition.x;
      iconSprite.position.y = newPosition.y;
    }
  }

  _onHeroDragEnd(eventData, iconComp) {
    const em = this._entityManager;
    const scale = Const.ScreenScale;
    const iconSprite = iconComp.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());
    const inventoryEnt = EntityFinders.findMerchantShopGui(em.entities);
    const inventorySlots = inventoryEnt.getAll('InventorySlotComponent');
    let canDrop = false;
    let canSwap = false;
    let swapComp = null;
    let overlappingSlotComp = null;
    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlots);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {
      overlappingSlotComp = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const heroEquipRefComp of this._relevantHeroEntRefs) {
        const heroEquipEntId = heroEquipRefComp.entityId;

        if (!heroEquipEntId) {
          continue;
        }

        const heroEquipEnt = EntityFinders.findById(em.entities, heroEquipEntId);
        const heroEquipIconComp = heroEquipEnt.get('InventoryIconComponent');

        if (heroEquipIconComp === iconComp) {
          continue;
        }

        const heroEquipIconSpriteRect = Rectangle.fromPixiRect(heroEquipIconComp.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlotComp.slotGraphics.getBounds());

        if (heroEquipIconSpriteRect.intersectsWith(overlappingSlotRect)) {
          swapComp = heroEquipIconComp;
          break;
        }
      }

      canDrop =
        _.includes(iconComp.allowedSlotTypes, overlappingSlotComp.slotType) ||
        overlappingSlotComp.slotType === Const.InventorySlot.Trash;

      if (canDrop && swapComp) {
        // check that swap can fit into dropped item's original slot.
        const vec = Vector.pnew(iconSprite._startPos.x * scale, iconSprite._startPos.y * scale);
        const startSlotComp = this._getOverlappingSlot(vec, inventorySlots);
        vec.pdispose();
        canSwap = _.includes(swapComp.allowedSlotTypes, startSlotComp.slotType);
      }
    }

    if (!validDrop || !canDrop || (swapComp && !canSwap)) {
      iconSprite.position.x = iconSprite._startPos.x;
      iconSprite.position.y = iconSprite._startPos.y;
    } else {
      if (swapComp) {
        const swapSprite = swapComp.sprite;
        swapSprite.position.x = iconSprite._startPos.x;
        swapSprite.position.y = iconSprite._startPos.y;
      }

      const slotBounds = overlappingSlotComp.slotGraphics.getBounds();
      iconSprite.position.x = (slotBounds.x + slotBounds.width / 2) / scale;
      iconSprite.position.y = (slotBounds.y + slotBounds.height / 2) / scale;

      this._applyHeroChanges();
    }

    iconSprite._dragging = false;
    iconSprite._data = null;
    iconSprite._startPos.pdispose();
    iconSprite._startPos = null;
  }

  _onMerchantDragEnd(eventData, iconComp) {
    /*continue here, ensure that items dragged from merchant stock can't be dropped in hero inventory
      and idea for that might be to append ~ (or other character) to each of the merchant's item's slot ids and add 'stock'.
      then, when the item is bought, remove the 'stock' slot and remove the ~ from the other slot ids.
      this could also be used as conditions for the buy and sell slots. if an item only has the 'stock' slot and all
    of it's other slots start with ~, it can be dropped in buy. If it doesn't have 'stock', it can be dropped on 'sell'.*/

    const em = this._entityManager;
    const scale = Const.ScreenScale;
    const iconSprite = iconComp.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());
    const gui = EntityFinders.findMerchantShopGui(em.entities);
    const inventorySlots = gui.getAll('InventorySlotComponent');
    let canDrop = false;
    let canSwap = false;
    let swapComp = null;
    let overlappingSlotComp = null;
    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlots);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {
      overlappingSlotComp = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const merchantEntRefs of this._relevantMerchantEntRefs) {
        const entityId = merchantEntRefs.entityId;

        if (!entityId) {
          continue;
        }

        const item = EntityFinders.findById(em.entities, entityId);
        const icon = item.get('InventoryIconComponent');

        if (icon === iconComp) {
          continue;
        }

        const iconRect = Rectangle.fromPixiRect(icon.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlotComp.slotGraphics.getBounds());

        if (iconRect.intersectsWith(overlappingSlotRect)) {
          swapComp = icon;
          break;
        }
      }

      canDrop =
        _.includes(iconComp.allowedSlotTypes, overlappingSlotComp.slotType) ||
        overlappingSlotComp.slotType === Const.MerchantSlot.Buy;

      if (canDrop && swapComp) {
        // check that swap can fit into dropped item's original slot.
        const vec = Vector.pnew(iconSprite._startPos.x * scale, iconSprite._startPos.y * scale);
        const startSlotComp = this._getOverlappingSlot(vec, inventorySlots);
        vec.pdispose();
        canSwap = _.includes(swapComp.allowedSlotTypes, startSlotComp.slotType);
      }
    }

    if (!validDrop || !canDrop || (swapComp && !canSwap)) {
      iconSprite.position.x = iconSprite._startPos.x;
      iconSprite.position.y = iconSprite._startPos.y;
    } else {
      if (swapComp) {
        const swapSprite = swapComp.sprite;
        swapSprite.position.x = iconSprite._startPos.x;
        swapSprite.position.y = iconSprite._startPos.y;
      }

      const slotBounds = overlappingSlotComp.slotGraphics.getBounds();
      iconSprite.position.x = (slotBounds.x + slotBounds.width / 2) / scale;
      iconSprite.position.y = (slotBounds.y + slotBounds.height / 2) / scale;

      this._applyMerchantChanges();
    }

    iconSprite._dragging = false;
    iconSprite._data = null;
    iconSprite._startPos.pdispose();
    iconSprite._startPos = null;
  }

  _getDraggedEntity(iconComp, heroEquipRefComps, entityManager) {
    for (const heroEquipRefComp of heroEquipRefComps) {
      const heroEquipEntId = heroEquipRefComp.entityId;

      if (!heroEquipEntId) {
        continue;
      }

      const heroEquipEnt = EntityFinders.findById(entityManager.entities, heroEquipEntId);
      const heroEquipIconComp = heroEquipEnt.get('InventoryIconComponent');

      if (heroEquipIconComp === iconComp) {
        return heroEquipEnt;
      }
    }

    return undefined;
  }

  _getOverlappingSlot(iconPos, inventorySlotComps) {
    return _.find(inventorySlotComps, c => Rectangle.fromPixiRect(c.slotGraphics.getBounds()).intersectsWith(iconPos));
  }

  _getOverlappingSlots(iconRect, inventorySlotComps) {
    return _.filter(inventorySlotComps, c =>
      iconRect.intersectsWith(Rectangle.fromPixiRect(c.slotGraphics.getBounds()))
    );
  }

  _getMostOverlappingSlot(itemSpriteRect, overlapSlotComps) {
    overlapSlotComps.sort((a, b) => {
      const aOverlap = Rectangle.intersection(Rectangle.fromPixiRect(a.slotGraphics.getBounds()), itemSpriteRect);
      const bOverlap = Rectangle.intersection(Rectangle.fromPixiRect(b.slotGraphics.getBounds()), itemSpriteRect);

      if (aOverlap.area < bOverlap.area) {
        return 1;
      }
      if (aOverlap.area > bOverlap.area) {
        return -1;
      }
      return 0;
    });

    return overlapSlotComps[0];
  }

  _applyHeroChanges() {
    const scale = Const.ScreenScale;
    const em = this._entityManager;
    const hero = em.heroEntity;
    const items = _.chain(this._relevantHeroEntRefs)
      .map(c => {
        const ent = EntityFinders.findById(em.entities, c.entityId);
        c.entityId = '';
        return ent;
      })
      .compact()
      .value();

    let backpackCount = 0;
    const gui = EntityFinders.findMerchantShopGui(em.entities);
    const backpackSlots = gui.getAll('InventorySlotComponent', slot => slot.slotType === Const.InventorySlot.Backpack);
    const vec = Vector.pnew();

    for (const backpackSlot of backpackSlots) {
      const slotType = backpackSlot.slotType;
      const slotRect = Rectangle.fromPixiRect(backpackSlot.slotGraphics.getBounds());

      for (const itemEnt of items) {
        const iconSprite = itemEnt.get('InventoryIconComponent').sprite;
        vec.set(iconSprite.x * scale, iconSprite.y * scale);

        if (slotRect.intersectsWith(vec)) {
          let entRefComp;

          switch (slotType) {
            case Const.InventorySlot.Backpack:
              entRefComp = _.filter(this._relevantHeroEntRefs, c => c.typeId === slotType)[backpackCount];
              break;
          }

          //TODO use for sell
          /*if (isInTrash || isInUse) {
            entRefComp.entityId = '';
            gui.get('CurrentEntityReferenceComponent').entityId = '';

            if (isInUse) {
              this._useItem(hero, itemEnt);
            }

            this._entityManager.remove(itemEnt);

            this.emit('inventory-update-system.trash-entity', itemEnt);
          } else {*/
          entRefComp.entityId = itemEnt.id;
          /*}*/

          break;
        }
      }

      switch (backpackSlot.slotType) {
        case Const.InventorySlot.Backpack:
          ++backpackCount;
          break;
      }
    }

    vec.pdispose();
  }

  _applyMerchantChanges() {
    const scale = Const.ScreenScale;
    const em = this._entityManager;
    const items = _.chain(this._relevantMerchantEntRefs)
      .map(c => {
        const ent = EntityFinders.findById(em.entities, c.entityId);
        c.entityId = '';
        return ent;
      })
      .compact()
      .value();
    const gui = EntityFinders.findMerchantShopGui(em.entities);
    const merchantSlots = gui.getAll(
      'InventorySlotComponent',
      slot => slot.slotType === Const.MerchantSlot.Stock || slot.slotType === Const.MerchantSlot.Buy
    );
    const vec = Vector.pnew();
    let stockCount = 0;

    for (const merchantSlot of merchantSlots) {
      const slotType = merchantSlot.slotType;
      const isInBuy = slotType === Const.MerchantSlot.Buy;
      const slotRect = Rectangle.fromPixiRect(merchantSlot.slotGraphics.getBounds());

      for (const itemEnt of items) {
        const icon = itemEnt.get('InventoryIconComponent');
        const iconSprite = icon.sprite;
        vec.set(iconSprite.x * scale, iconSprite.y * scale);

        if (slotRect.intersectsWith(vec)) {
          let entRef;

          switch (slotType) {
            case Const.MerchantSlot.Stock:
              entRef = _.filter(this._relevantMerchantEntRefs, c => c.typeId === slotType)[stockCount];
              break;
            default:
              entRef = _.find(this._relevantMerchantEntRefs, c => c.typeId === slotType);
              break;
          }

          if (isInBuy) {
            const hero = this._entityManager.heroEntity;
            const emptyBackpackSlots = hero.getAll(
              'EntityReferenceComponent',
              e => e.typeId === Const.InventorySlot.Backpack && !e.entityId
            );

            if (emptyBackpackSlots.length === 0) {
              throw new Error('No empty backpack space.');
            }

            entRef.entityId = '';
            gui.get('CurrentEntityReferenceComponent').entityId = '';
            emptyBackpackSlots[0].entityId = itemEnt.id;

            for (let i = icon.allowedSlotTypes.length; i-- > 0; ) {
              const slotType = icon.allowedSlotTypes[i];
              if (
                slotType === Const.MerchantSlot.Stock ||
                slotType === Const.MerchantSlot.Buy ||
                slotType === Const.MerchantSlot.Sell
              ) {
                ArrayUtils.removeAt(icon.allowedSlotTypes, i);
              }
            }

            for (let i = 0; i < icon.allowedSlotTypes.length; ++i) {
              icon.allowedSlotTypes[i] = _.trimStart(icon.allowedSlotTypes[i], '~');
            }

            this._initHeroItem(itemEnt);

            this.emit('buy');
          } else {
            entRef.entityId = itemEnt.id;
          }

          break;
        }
      }

      switch (merchantSlot.slotType) {
        case Const.MerchantSlot.Stock:
          ++stockCount;
          break;
      }
    }

    vec.pdispose();
  }
}
