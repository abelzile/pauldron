import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import EntityReferenceComponent from '../components/entity-reference-component';
import Rectangle from '../rectangle';
import System from '../system';
import Vector from '../vector';

export default class MerchantShopUpdateSystem extends System {
  constructor(renderer, entityManager, merchantId) {
    super();

    this.RelevantHeroSlotTypes = [Const.InventorySlot.Backpack];
    this.HideHeroSlotTypesOnUnload = [Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar];
    this.RelevantMerchantSlotTypes = [Const.MerchantSlot.Stock, Const.MerchantSlot.Buy, Const.MerchantSlot.Sell];

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
    this._relevantHeroEntRefs
      .map(entRef => EntityFinders.findById(entities, entRef.entityId))
      .filter(item => item && item.has('InventoryIconComponent'))
      .forEach(this._initHeroItem.bind(this));
  }

  _initMerchantItems(entities) {
    this._relevantMerchantEntRefs
      .map(entRef => EntityFinders.findById(entities, entRef.entityId))
      .filter(item => item && item.has('InventoryIconComponent'))
      .forEach(this._initMerchantItem.bind(this));
  }

  _initHeroItem(item) {
    this._initItem(item)
      .get('InventoryIconComponent')
      .sprite.on('mouseup', eventData => this._onHeroDragEnd(eventData, item))
      .on('mouseupoutside', eventData => this._onHeroDragEnd(eventData, item))
      .on('mouseover', eventData => {
        this._setCurrentItem(item, 'hero');
      })
      .on('mouseout', eventData => {
        this._setCurrentItem();
      });
  }

  _initMerchantItem(item) {
    this._initItem(item)
      .get('InventoryIconComponent')
      .sprite.on('mouseup', eventData => this._onMerchantDragEnd(eventData, item))
      .on('mouseupoutside', eventData => this._onMerchantDragEnd(eventData, item))
      .on('mouseover', eventData => {
        this._setCurrentItem(item, 'merchant');
      })
      .on('mouseout', eventData => {
        this._setCurrentItem();
      });
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
      ;
    return item;
  }

  _setCurrentItem(item, itemType) {
    const gui = EntityFinders.findMerchantShopGui(this._entityManager.entities);
    const currEntRef = gui.get('CurrentEntityReferenceComponent');

    if (item) {
      currEntRef.entityId = item.id;
      currEntRef.data = itemType;
    } else {
      currEntRef.empty();
    }
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

  _onHeroDragEnd(eventData, item) {
    const em = this._entityManager;
    const hero = em.heroEntity;
    const scale = Const.ScreenScale;
    const icon = item.get('InventoryIconComponent');
    const iconSprite = icon.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());
    const gui = EntityFinders.findMerchantShopGui(em.entities);
    const inventorySlots = gui.getAll('InventorySlotComponent');
    let canDrop = false;
    let canSwap = false;
    let canSell = true;
    let swapComp = null;
    let overlappingSlot = null;
    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlots);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {
      overlappingSlot = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const entRef of this._relevantHeroEntRefs) {
        const entId = entRef.entityId;

        if (!entId) {
          continue;
        }

        const item = EntityFinders.findById(em.entities, entId);
        const itemIcon = item.get('InventoryIconComponent');

        if (itemIcon === icon) {
          continue;
        }

        const itemSpriteRect = Rectangle.fromPixiRect(itemIcon.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlot.slotGraphics.getBounds());

        if (itemSpriteRect.intersectsWith(overlappingSlotRect)) {
          swapComp = itemIcon;
          break;
        }
      }

      canDrop =
        _.includes(icon.allowedSlotTypes, overlappingSlot.slotType) ||
        overlappingSlot.slotType === Const.MerchantSlot.Sell;

      if (canDrop && swapComp) {
        // check that swap can fit into dropped item's original slot.
        const vec = Vector.pnew(iconSprite._startPos.x * scale, iconSprite._startPos.y * scale);
        const startSlotComp = this._getOverlappingSlot(vec, inventorySlots);
        vec.pdispose();
        canSwap = _.includes(swapComp.allowedSlotTypes, startSlotComp.slotType);
      }

      if (canDrop && overlappingSlot.slotType === Const.MerchantSlot.Sell) {
        if (this._merchant.getAll('EntityReferenceComponent')) {
          canSell = !_.isEmpty(
            this._merchant.getAll('EntityReferenceComponent', EntityReferenceComponent.isEmptyStockSlot)
          );
        }
      }
    }

    if (!validDrop || !canDrop || (swapComp && !canSwap) || !canSell) {
      iconSprite.position.x = iconSprite._startPos.x;
      iconSprite.position.y = iconSprite._startPos.y;
    } else {
      if (swapComp) {
        const swapSprite = swapComp.sprite;
        swapSprite.position.x = iconSprite._startPos.x;
        swapSprite.position.y = iconSprite._startPos.y;
      }

      const slotBounds = overlappingSlot.slotGraphics.getBounds();
      iconSprite.position.x = (slotBounds.x + slotBounds.width / 2) / scale;
      iconSprite.position.y = (slotBounds.y + slotBounds.height / 2) / scale;

      this._applyHeroChanges();

      if (overlappingSlot.slotType === Const.MerchantSlot.Sell) {
        this._sellItem(item, hero);
      }
    }

    iconSprite._dragging = false;
    iconSprite._data = null;
    iconSprite._startPos.pdispose();
    iconSprite._startPos = null;
  }

  _onMerchantDragEnd(eventData, item) {
    const em = this._entityManager;
    const hero = em.heroEntity;
    const icon = item.get('InventoryIconComponent');
    const iconSprite = icon.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());
    const gui = EntityFinders.findMerchantShopGui(em.entities);
    const inventorySlots = gui.getAll('InventorySlotComponent');
    let canDrop = false;
    let canSwap = false;
    let canBuy = true;
    let swapComp = null;
    let overlappingSlot = null;
    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlots);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {
      overlappingSlot = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const merchantEntRef of this._relevantMerchantEntRefs) {
        const entityId = merchantEntRef.entityId;

        if (!entityId) {
          continue;
        }

        const itm = EntityFinders.findById(em.entities, entityId);
        const itmIcon = itm.get('InventoryIconComponent');

        if (itmIcon === icon) {
          continue;
        }

        const itemSpriteRect = Rectangle.fromPixiRect(itmIcon.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlot.slotGraphics.getBounds());

        if (itemSpriteRect.intersectsWith(overlappingSlotRect)) {
          swapComp = itmIcon;
          break;
        }
      }

      canDrop =
        _.includes(icon.allowedSlotTypes, overlappingSlot.slotType) ||
        overlappingSlot.slotType === Const.MerchantSlot.Buy;

      if (canDrop && swapComp) {
        // check that swap can fit into dropped item's original slot.
        const vec = Vector.pnew(iconSprite._startPos.x * Const.ScreenScale, iconSprite._startPos.y * Const.ScreenScale);
        const startSlotComp = this._getOverlappingSlot(vec, inventorySlots);
        vec.pdispose();
        canSwap = _.includes(swapComp.allowedSlotTypes, startSlotComp.slotType);
      }

      if (canDrop && overlappingSlot.slotType === Const.MerchantSlot.Buy) {
        canBuy = !_.isEmpty(
          hero.getAll(
            'EntityReferenceComponent',
            EntityReferenceComponent.isEmptyBackpackSlot
          )
        );
      }
    }
    const outMsg = { msg: '' };

    if (!validDrop || !canDrop || (swapComp && !canSwap) || !canBuy) {
      this._resetItem(iconSprite);
    } else if (!this._canBuy(item, hero, outMsg)) {
      this.emit('error', outMsg.msg);
      this._resetItem(iconSprite);
    } else {
      if (swapComp) {
        const swapSprite = swapComp.sprite;
        swapSprite.position.x = iconSprite._startPos.x;
        swapSprite.position.y = iconSprite._startPos.y;
      }

      const slotBounds = overlappingSlot.slotGraphics.getBounds();
      iconSprite.position.x = (slotBounds.x + slotBounds.width / 2) / Const.ScreenScale;
      iconSprite.position.y = (slotBounds.y + slotBounds.height / 2) / Const.ScreenScale;

      this._applyMerchantChanges();

      if (overlappingSlot.slotType === Const.MerchantSlot.Buy) {
        this._buyItem(item, hero);
      }
    }

    iconSprite._dragging = false;
    iconSprite._data = null;
    iconSprite._startPos.pdispose();
    iconSprite._startPos = null;
  }

  _resetItem(iconSprite) {
    iconSprite.position.x = iconSprite._startPos.x;
    iconSprite.position.y = iconSprite._startPos.y;
  }

  _canBuy(item, hero, outMsg) {
    const cost = item.get('CostComponent');

    if (!cost) {
      return true;
    }

    const money = hero.get('MoneyComponent');

    if (cost.amount > money.amount) {
      outMsg.msg = "Can't afford this item!";
      return false;
    }

    return true;
  }

  _buyItem(item, hero) {
    const cost = item.get('CostComponent');
    const money = hero.get('MoneyComponent');
    money.amount -= cost.amount;
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
    const backpackSlots = gui.getAll(
      'InventorySlotComponent',
      slot => slot.slotType === Const.InventorySlot.Backpack || slot.slotType === Const.MerchantSlot.Sell
    );
    const vec = Vector.pnew();

    for (const backpackSlot of backpackSlots) {
      const slotType = backpackSlot.slotType;
      const isInSell = slotType === Const.MerchantSlot.Sell;
      const slotRect = Rectangle.fromPixiRect(backpackSlot.slotGraphics.getBounds());

      for (const itemEnt of items) {
        const icon = itemEnt.get('InventoryIconComponent');
        const iconSprite = icon.sprite;
        vec.set(iconSprite.x * scale, iconSprite.y * scale);

        if (slotRect.intersectsWith(vec)) {
          let entRef;

          switch (slotType) {
            case Const.InventorySlot.Backpack:
              entRef = _.filter(this._relevantHeroEntRefs, c => c.typeId === slotType)[backpackCount];
              break;
          }

          if (isInSell) {
            const emptyStockSlots = this._merchant.getAll(
              'EntityReferenceComponent',
              EntityReferenceComponent.isEmptyStockSlot
            );

            if (_.isEmpty(emptyStockSlots)) {
              throw new Error('No empty backpack space.');
            }

            gui.get('CurrentEntityReferenceComponent').entityId = '';
            emptyStockSlots[0].entityId = itemEnt.id;

            for (let i = 0; i < icon.allowedSlotTypes.length; ++i) {
              icon.allowedSlotTypes[i] = '~' + icon.allowedSlotTypes[i];
            }

            icon.allowedSlotTypes.push(Const.MerchantSlot.Stock, Const.MerchantSlot.Buy);

            this._initMerchantItem(itemEnt);

            this.emit('sell');
          } else {
            entRef.entityId = itemEnt.id;
          }

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
              EntityReferenceComponent.isEmptyBackpackSlot
            );

            if (_.isEmpty(emptyBackpackSlots)) {
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

  _sellItem(item, hero) {
    const cost = item.get('CostComponent');
    if (cost) {
      const money = hero.get('MoneyComponent');
      money.amount += Math.round(cost.amount * Const.SellPriceMultiplier);
    }
  }
}
