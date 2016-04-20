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

    this._renderer = renderer;
    this._entityManager = entityManager;
    this._invisibleSlotTypes = [Const.InventorySlot.Backpack, Const.InventorySlot.Hotbar];

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const heroEnt = this._entityManager.heroEntity;

    this._initItems(heroEnt, entities);

  }

  processEntities(gameTime, entities) {
  }

  unload(entities, levelPixiContainer) {

    //TODO:break out out into appropriate classes.
    
    const heroEnt = this._entityManager.heroEntity;
    const entRefComps = heroEnt.getAll('EntityReferenceComponent');
    const ents = _(heroEnt.getAll('EntityReferenceComponent'))
                  .map(c => EntityFinders.findById(entities, c.entityId))
                  .compact();

    _(ents)
      .filter(ents, e => e.has('InventoryIconComponent'))
      .each(e => { e.get('InventoryIconComponent')
                    .iconSprite
                    .removeAllListeners('mousedown')
                    .removeAllListeners('mousemove')
                    .removeAllListeners('mouseup')
                    .removeAllListeners('mouseupoutside'); });

    ents.sort(EntitySorters.sortInventory);

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    for (const ent of ents) {

      const isVisible = !_.includes(this._invisibleSlotTypes, (_.find(entRefComps, c => c.entityId === ent.id)).typeId);

      if (ent.has('MovieClipComponent')) {

        const mc = ent.get('MovieClipComponent').movieClip;

        levelPixiContainer.removeChild(mc);

        const pixiObj = levelPixiContainer.addChild(mc);
        pixiObj.visible = isVisible;
        pixiObj.position.set(centerScreenX, centerScreenY);

      }

      if (ent.has('MeleeAttackComponent')) {

        const g = ent.get('MeleeAttackComponent').graphics;

        levelPixiContainer.removeChild(g);

        const pixiObj = levelPixiContainer.addChild(g);
        pixiObj.visible = isVisible;

      }

    }

  }

  _initItems(heroEntity, entities) {

    _(heroEntity.getAll('EntityReferenceComponent'))
      .map(c => EntityFinders.findById(entities, c.entityId))
      .filter(e => e && e.has('InventoryIconComponent'))
      .each(e => { this._wireUpDrag(e.get('InventoryIconComponent')); });

  }

  _wireUpDrag(iconComp) {

    const iconSprite = iconComp.sprite;
    iconSprite.interactive = true;
    iconSprite.buttonMode = true;
    iconSprite.anchor.set(0.5);
    iconSprite.on('mousedown', (eventData) => this._onDragStart(eventData, iconSprite))
              .on('mousemove', (eventData) => this._onDrag(eventData, iconSprite))
              .on('mouseup', (eventData) => this._onDragEnd(eventData, this._entityManager, iconComp))
              .on('mouseupoutside', (eventData) => this._onDragEnd(eventData, this._entityManager, iconComp));

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

  _onDragEnd(eventData, entityManager, iconComp) {

    const scale = this._renderer.globalScale;

    const iconSprite = iconComp.sprite;
    const iconSpriteRect = Rectangle.fromPixiRect(iconSprite.getBounds());

    const inventoryEnt = EntityFinders.findInventory(entityManager.entities);
    const inventorySlotComps = inventoryEnt.getAll('InventorySlotComponent');

    let canDrop = false;
    let canSwap = false;
    let swapComp = undefined;
    let overlappingSlotComp = undefined;

    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, inventorySlotComps);
    const validDrop = overlapSlots.length > 0;

    if (validDrop) {

      overlappingSlotComp = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);
      const heroEquipRefComps = entityManager.heroEntity.getAll('EntityReferenceComponent');

      for (const heroEquipRefComp of heroEquipRefComps) {

        const heroEquipEntId = heroEquipRefComp.entityId;

        if (!heroEquipEntId) { continue; }

        const heroEquipEnt = EntityFinders.findById(entityManager.entities, heroEquipEntId);
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
    const entRefComps = heroEnt.getAll('EntityReferenceComponent');
    const itemEnts = _(entRefComps).map(c => EntityFinders.findById(em.entities, c.entityId)).compact().value();
    const inventorySlotComps = EntityFinders.findInventory(em.entities).getAll('InventorySlotComponent');

    _.each(entRefComps, c => { c.entityId = ''; });

    let backpackCount = 0;
    let hotbarCount = 0;

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
              entRefComp = _.filter(entRefComps, c => c.typeId === slotType)[backpackCount];
              break;
            case Const.InventorySlot.Hotbar:
              entRefComp = _.filter(entRefComps, c => c.typeId === slotType)[hotbarCount];
              break;
            default:
              entRefComp = _.find(entRefComps, c => c.typeId === slotType);
              break;
          }

          if (isInTrash || isInUse) {

            entRefComp.entityId = '';

            if (isInUse) {

              console.log('use ' + itemEnt);

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