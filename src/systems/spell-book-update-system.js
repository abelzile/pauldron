import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import Point from '../point';
import Rectangle from '../rectangle';
import System from '../system';


export default class SpellBookUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

    this.RelevantSlotTypes = _.toArray(Const.MagicSpellSlot);

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

    _.chain(this._relevantHeroReferenceComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .filter(e => e && e.has('InventoryIconComponent'))
     .each(e => { e.get('InventoryIconComponent').sprite.removeAllListeners(); })
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
                 /*.on('mouseover', (eventData) => { this._setCurrentItem(e); })
                 .on('mouseout', (eventData) => { this._setCurrentItem(); })*/
                 ;

     })
     .value();

  }

  _onDragStart(eventData, iconSprite) {

    this.emit('spell-book-update-system.start-drag', iconSprite);

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

    const spellBookEnt = EntityFinders.findSpellBook(em.entities);
    const spellBookSlotComps = spellBookEnt.getAll('SpellBookSlotComponent');

    let canDrop = false;
    let canSwap = false;
    let swapComp = undefined;
    let overlappingSlotComp = undefined;

    const overlapSlots = this._getOverlappingSlots(iconSpriteRect, spellBookSlotComps);
    const validDrop = overlapSlots.length > 0;

     if (validDrop) {

      overlappingSlotComp = this._getMostOverlappingSlot(iconSpriteRect, overlapSlots);

      for (const refComp of this._relevantHeroReferenceComps) {

        const spellEntId = refComp.entityId;

        if (!spellEntId) { continue; }

        const spellEnt = EntityFinders.findById(em.entities, spellEntId);
        const spellIconComp = spellEnt.get('InventoryIconComponent');

        if (spellIconComp === iconComp) { continue; }

        const spellIconSpriteRect = Rectangle.fromPixiRect(spellIconComp.sprite.getBounds());
        const overlappingSlotRect = Rectangle.fromPixiRect(overlappingSlotComp.slotGraphics.getBounds());

        if (spellIconSpriteRect.intersectsWith(overlappingSlotRect)) {
          swapComp = spellIconComp;
          break;
        }

      }

      canDrop = _.includes(iconComp.allowedSlotTypes, overlappingSlotComp.slotType) || (overlappingSlotComp.slotType === Const.MagicSpellSlot.Erase);

      if (canDrop && swapComp) {

        // check that swap can fit into dropped item's original slot.
        const startSlotComp = this._getOverlappingSlot(new Point(iconSprite._startPos.x * scale, iconSprite._startPos.y * scale), spellBookSlotComps);

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

  _getOverlappingSlots(iconRect, slotComps) {
    return _.filter(slotComps, c => iconRect.intersectsWith(Rectangle.fromPixiRect(c.slotGraphics.getBounds())));
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
    const spellEnts = _.chain(this._relevantHeroReferenceComps)
                       .map(c => {

                         const ent = EntityFinders.findById(em.entities, c.entityId);

                         c.entityId = '';

                         return ent;

                       })
                       .compact()
                       .value();

    let spellBookCount = 0;

    const spellBookEnt = EntityFinders.findSpellBook(em.entities);
    const spellBookSlotComps = spellBookEnt.getAll('SpellBookSlotComponent');

    for (const spellBookSlotComp of spellBookSlotComps) {

      const slotType = spellBookSlotComp.slotType;
      const isInErase = slotType === Const.MagicSpellSlot.Erase;
      const spellBookSlotRect = Rectangle.fromPixiRect(spellBookSlotComp.slotGraphics.getBounds());

      for (const spellEnt of spellEnts) {

        const iconSprite = spellEnt.get('InventoryIconComponent').sprite;

        if (spellBookSlotRect.intersectsWith(new Point(iconSprite.x * scale, iconSprite.y * scale))) {

          let entRefComp;

          switch (slotType) {
            case Const.MagicSpellSlot.SpellBook:
              entRefComp = _.filter(this._relevantHeroReferenceComps, c => c.typeId === slotType)[spellBookCount];
              break;
            default:
              entRefComp = _.find(this._relevantHeroReferenceComps, c => c.typeId === slotType);
              break;
          }

          if (isInErase) {

            entRefComp.entityId = '';
            //spellBookEnt.get('InventoryCurrentEntityReferenceComponent').entityId = '';

            this._entityManager.remove(spellEnt);

            this.emit('spell-book-update-system.erase-entity', spellEnt);

          } else {

            entRefComp.entityId = spellEnt.id;

          }

          break;

        }

      }

      if (spellBookSlotComp.slotType === Const.MagicSpellSlot.SpellBook) {
        ++spellBookCount;
      }

    }

  }

}