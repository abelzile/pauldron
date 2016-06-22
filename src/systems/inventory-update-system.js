import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import _ from 'lodash';
import Point from '../point';
import Rectangle from '../rectangle';
import System from '../system';


export default class InventoryUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this.RelevantSlotTypes = _.toArray(Const.InventorySlot);
    this.InvisibleSlotTypes = [ Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar ];

    this._renderer = renderer;
    this._entityManager = entityManager;
    
    this._relevantHeroReferenceComps = _.filter(this._entityManager.heroEntity.getAll('EntityReferenceComponent'),
                                                c => _.includes(this.RelevantSlotTypes, c.typeId));

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._initItems(entities);
    
    return this;

  }

  processEntities(gameTime, entities) {
  }

  unload(entities, levelPixiContainer) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    _.chain(this._relevantHeroReferenceComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .filter(e => e && e.has('InventoryIconComponent'))
     .tap(ents => { ents.sort(EntitySorters.sortInventory); })
     .each(e => {

       const iconSprite = e.get('InventoryIconComponent').sprite;

       iconSprite.removeAllListeners();
       
       iconSprite._dragging = false;
       iconSprite._data = null;

       if (iconSprite._startPos) {
         iconSprite.position.x = iconSprite._startPos.x;
         iconSprite.position.y = iconSprite._startPos.y;
       }

       iconSprite._startPos = null;

       const isVisible = !_.includes(this.InvisibleSlotTypes, (_.find(this._relevantHeroReferenceComps, c => c.entityId === e.id)).typeId);

       if (e.has('MovieClipComponent')) {

         const mc = e.get('MovieClipComponent').movieClip;

         levelPixiContainer.removeChild(mc);

         const pixiObj = levelPixiContainer.addChild(mc);
         pixiObj.visible = isVisible;
         pixiObj.position.set(centerScreenX, centerScreenY);

       }

       if (e.has('MeleeAttackComponent')) {

         const g = e.get('MeleeAttackComponent').graphics;

         levelPixiContainer.removeChild(g);

         const pixiObj = levelPixiContainer.addChild(g);
         pixiObj.visible = isVisible;

       }

     })
     .value();

  }

  _initItems(entities) {

    _.chain(this._relevantHeroReferenceComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .filter(e => e && e.has('InventoryIconComponent'))
     .each(e => {

       const inventoryIconComp = e.get('InventoryIconComponent');
       const iconSprite = inventoryIconComp.sprite;
       iconSprite.interactive = true;
       iconSprite.buttonMode = true;
       iconSprite.on('mousedown', (eventData) => this._onDragStart(eventData, iconSprite))
                 .on('mousemove', (eventData) => this._onDrag(eventData, iconSprite))
                 .on('mouseup', (eventData) => this._onDragEnd(eventData, inventoryIconComp))
                 .on('mouseupoutside', (eventData) => this._onDragEnd(eventData, inventoryIconComp))
                 .on('mouseover', (eventData) => { this._setCurrentItem(e); })
                 .on('mouseout', (eventData) => { this._setCurrentItem(); })
                 ;

     })
     .value();

  }

  _setCurrentItem(entity) {
    EntityFinders.findInventory(this._entityManager.entities).get('CurrentEntityReferenceComponent').entityId = (entity) ? entity.id : '';
  }

  _onDragStart(eventData, iconSprite) {

    this.emit('inventory-update-system.start-drag', iconSprite);

    iconSprite._data = eventData.data;
    iconSprite._dragging = true;
    iconSprite._startPos = new Point(eventData.target.position.x, eventData.target.position.y);

  }

  _onDrag(eventData, iconSprite) {

    if (iconSprite._dragging) {

      const newPosition = iconSprite._data.getLocalPosition(iconSprite.parent);
      iconSprite.position.x = newPosition.x;
      iconSprite.position.y = newPosition.y;

    }

  }

  _onDragEnd(eventData, iconComp) {

    const em = this._entityManager;
    const scale = this._renderer.globalScale;

    const iconSprite = iconComp.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());

    const inventoryEnt = EntityFinders.findInventory(em.entities);
    const inventorySlotComps = inventoryEnt.getAll('InventorySlotComponent');

    let canDrop = false;
    let canSwap = false;
    let swapComp = undefined;
    let overlappingSlotComp = undefined;

    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlotComps);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {

      overlappingSlotComp = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const heroEquipRefComp of this._relevantHeroReferenceComps) {

        const heroEquipEntId = heroEquipRefComp.entityId;

        if (!heroEquipEntId) { continue; }

        const heroEquipEnt = EntityFinders.findById(em.entities, heroEquipEntId);
        const heroEquipIconComp = heroEquipEnt.get('InventoryIconComponent');

        if (heroEquipIconComp === iconComp) { continue; }

        const heroEquipIconSpriteRect = Rectangle.fromPixiRect(heroEquipIconComp.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlotComp.slotGraphics.getBounds());

        if (heroEquipIconSpriteRect.intersectsWith(overlappingSlotRect)) {
          swapComp = heroEquipIconComp;
          break;
        }

      }

      canDrop = _.includes(iconComp.allowedSlotTypes, overlappingSlotComp.slotType) || (overlappingSlotComp.slotType === Const.InventorySlot.Trash);

      if (canDrop) {

        if (overlappingSlotComp.slotType === Const.InventorySlot.Hand1 ||
            overlappingSlotComp.slotType === Const.InventorySlot.Hand2) {

          const hand1EntRefComp = _.find(this._relevantHeroReferenceComps, c => c.typeId === Const.InventorySlot.Hand1);
          const hand1EquipEnt = EntityFinders.findById(em.entities, hand1EntRefComp.entityId);
          let hand1EquipHandedness = '';
          if (hand1EquipEnt) {
            hand1EquipHandedness = hand1EquipEnt.get('WeaponComponent').handedness;
          }

          // don't allow drop into hand2 if hand1 is two handed weapon.
          canDrop = !(hand1EquipEnt &&
                      overlappingSlotComp.slotType === Const.InventorySlot.Hand2 &&
                      hand1EquipHandedness === Const.Handedness.TwoHanded);

          if (canDrop) {

            // don't allow drop of two handed weapon if hand2 is occupied.

            const draggedEnt = this._getDraggedEntity(iconComp, this._relevantHeroReferenceComps, em);

            let draggedEquipHandedness = '';
            const draggedWeaponComp = draggedEnt.get('WeaponComponent');
            if (draggedWeaponComp) {
              draggedEquipHandedness = draggedWeaponComp.handedness;
            }

            const hand2EntRefComp = _.find(this._relevantHeroReferenceComps, c => c.typeId === Const.InventorySlot.Hand2);
            const hand2EquipEnt = EntityFinders.findById(em.entities, hand2EntRefComp.entityId);

            canDrop = !(hand2EquipEnt &&
                        overlappingSlotComp.slotType === Const.InventorySlot.Hand1 &&
                        draggedEquipHandedness === Const.Handedness.TwoHanded);

          }

        }

      }

      if (canDrop && swapComp) {

        // check that swap can fit into dropped item's original slot.
        const startSlotComp = this._getOverlappingSlot(new Point(iconSprite._startPos.x * scale, iconSprite._startPos.y * scale), inventorySlotComps);

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
      iconSprite.position.x = (slotBounds.x + (slotBounds.width / 2)) / scale;
      iconSprite.position.y = (slotBounds.y + (slotBounds.height / 2)) / scale;

      this._applyChanges();

    }

    iconSprite._dragging = false;
    iconSprite._data = null;
    iconSprite._startPos = null;

  }

  _getDraggedEntity(iconComp, heroEquipRefComps, entityManager) {

    for (const heroEquipRefComp of heroEquipRefComps) {

      const heroEquipEntId = heroEquipRefComp.entityId;

      if (!heroEquipEntId) { continue; }

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
    return _.filter(inventorySlotComps, c => iconRect.intersectsWith(Rectangle.fromPixiRect(c.slotGraphics.getBounds())));
  }

  _getMostOverlappingSlot(itemSpriteRect, overlapSlotComps) {

    overlapSlotComps.sort((a, b) => {

      const aOverlap = Rectangle.intersection(Rectangle.fromPixiRect(a.slotGraphics.getBounds()), itemSpriteRect);
      const bOverlap = Rectangle.intersection(Rectangle.fromPixiRect(b.slotGraphics.getBounds()), itemSpriteRect);

      if (aOverlap.area < bOverlap.area) { return 1; }
      if (aOverlap.area > bOverlap.area) { return -1; }
      return 0;

    });

    return overlapSlotComps[0];

  }

  _applyChanges() {

    const scale = this._renderer.globalScale;
    const em = this._entityManager;
    const heroEnt = em.heroEntity;
    const itemEnts = _.chain(this._relevantHeroReferenceComps)
                      .map(c => {

                        const ent = EntityFinders.findById(em.entities, c.entityId);

                        c.entityId = '';

                        return ent;

                      })
                      .compact()
                      .value();

    let backpackCount = 0;
    let hotbarCount = 0;

    const inventoryEnt = EntityFinders.findInventory(em.entities);
    const inventorySlotComps = inventoryEnt.getAll('InventorySlotComponent');

    for (const inventorySlotComp of inventorySlotComps) {

      const slotType = inventorySlotComp.slotType;
      const isInTrash = slotType === Const.InventorySlot.Trash;
      const isInUse = slotType === Const.InventorySlot.Use;
      const inventorySlotRect = Rectangle.fromPixiRect(inventorySlotComp.slotGraphics.getBounds());

      for (const itemEnt of itemEnts) {

        const iconSprite = itemEnt.get('InventoryIconComponent').sprite;

        if (inventorySlotRect.intersectsWith(new Point(iconSprite.x * scale, iconSprite.y * scale))) {

          let entRefComp;

          switch (slotType) {
            case Const.InventorySlot.Backpack:
              entRefComp = _.filter(this._relevantHeroReferenceComps, c => c.typeId === slotType)[backpackCount];
              break;
            case Const.InventorySlot.Hotbar:
              entRefComp = _.filter(this._relevantHeroReferenceComps, c => c.typeId === slotType)[hotbarCount];
              break;
            default:
              entRefComp = _.find(this._relevantHeroReferenceComps, c => c.typeId === slotType);
              break;
          }

          if (isInTrash || isInUse) {

            entRefComp.entityId = '';
            inventoryEnt.get('CurrentEntityReferenceComponent').entityId = '';

            if (isInUse) {
              this._useItem(heroEnt, itemEnt);
            }

            this._entityManager.remove(itemEnt);

            this.emit('inventory-update-system.trash-entity', itemEnt);

          } else {

            entRefComp.entityId = itemEnt.id;

          }

          break;

        }

      }

      switch (inventorySlotComp.slotType) {
        case Const.InventorySlot.Backpack:
          ++backpackCount;
          break;
        case Const.InventorySlot.Hotbar:
          ++hotbarCount;
          break;
      }

    }

  }

  _useItem(heroEnt, itemEnt) {

    const statisticComps = heroEnt.getAll('StatisticComponent');

    for (const effectComp of itemEnt.getAll('StatisticEffectComponent')) {

      for (const statisticComp of statisticComps) {

        if (statisticComp.apply(effectComp)) { break; }

      }

    }

  }

}