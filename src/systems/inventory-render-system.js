import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import System from '../system';


export default class InventoryRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const inventoryEnt = EntityFinders.findInventory(entities);
    const heroEnt = this._entityManager.heroEntity;

    this._pixiContainer.addChild(inventoryEnt.get('InventoryBackgroundComponent').graphics);
    const heroTextSprite = this._pixiContainer.addChild(inventoryEnt.get('InventoryHeroTextComponent').sprite);
    heroTextSprite.style = { font: '16px "silkscreennormal"', fill: '#ffffff' };
    heroTextSprite.scale.set(0.3333333333333333);

    for (const inventorySlotComp of inventoryEnt.getAll('InventorySlotComponent')) {
      this._pixiContainer.addChild(inventorySlotComp.labelSprite, inventorySlotComp.slotGraphics);
    }

    this._drawBackground(inventoryEnt);

    this._initItems(heroEnt, inventoryEnt, entities);

  }

  processEntities(gameTime, entities) {

    const inventoryEnt = EntityFinders.findInventory(entities);
    const heroEnt = this._entityManager.heroEntity;

    this._drawCharacterDetails(heroEnt, inventoryEnt, entities);

  }

  unload(entities, levelScreen) {
  }

  _drawCharacterDetails(heroEnt, inventoryEnt, entities) {

    const currentValueHash = {};
    const maxValueHash = {};

    const statComps = heroEnt.getAll('StatisticComponent');

    for (const statComp of statComps) {

      if (currentValueHash[statComp.name]) {
        currentValueHash[statComp.name] += statComp.currentValue;
      } else {
        currentValueHash[statComp.name] = statComp.currentValue;
      }

      if (maxValueHash[statComp.name]) {
        maxValueHash[statComp.name] += statComp.maxValue;
      } else {
        maxValueHash[statComp.name] = statComp.maxValue;
      }

    }


    const entRefComps = heroEnt.getAll('EntityReferenceComponent');

    for (const entRefComp of entRefComps) {

      if (!_.includes(Const.EquipableInventorySlot, entRefComp.typeId)) { continue; }

      if (!entRefComp.entityId) { continue; }

      const equipEnt = EntityFinders.findById(entities, entRefComp.entityId);

      const equipStatComps = equipEnt.getAll('StatisticComponent');

      for (const statComp of equipStatComps) {

        switch (statComp.name) {

          case Const.Statistic.Defense:
            //case WhateverElseWeShouldShow:

            if (currentValueHash[statComp.name]) {
              currentValueHash[statComp.name] += statComp.currentValue;
            } else {
              currentValueHash[statComp.name] = statComp.currentValue;
            }

            if (maxValueHash[statComp.name]) {
              maxValueHash[statComp.name] += statComp.maxValue;
            } else {
              maxValueHash[statComp.name] = statComp.maxValue;
            }

            break;


        }

      }

    }

    let str = '';

    _.forOwn(currentValueHash, (val, key) => {

      let cur = Number.isInteger(val) ? val.toString() : val.toFixed(2);

      const maxVal = maxValueHash[key];
      let max = Number.isInteger(maxVal) ? maxVal.toString() : maxVal.toFixed(2);

      str += key + ': ' + cur + '/' + max + '\n';

    });
    
    inventoryEnt.get('InventoryHeroTextComponent').sprite.text = str;
    
  }

  _drawBackground(inventoryEnt) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const bgMargin = 20;
    const white = 0xffffff;
    const black = 0x000000;

    inventoryEnt.get('InventoryBackgroundComponent')
                .graphics
                .lineStyle(1, white)
                .beginFill(black, 1)
                .drawRect(bgMargin / scale,
                          bgMargin / scale,
                          (screenWidth - (bgMargin * 2)) / scale,
                          (screenHeight - (bgMargin * 2)) / scale)
                .endFill();

    const slotDim = 70;
    const paperDollHorizMargin = 20;
    const paperDollSlotHorizMarginDim = 20;
    const paperDollSlotVertMarginDim = 30;

    const paperDollHeadY = (bgMargin + paperDollSlotVertMarginDim);

    const middleRowX = (paperDollHorizMargin * 2) + slotDim + paperDollSlotHorizMarginDim;
    const middleRowY = (paperDollHeadY + paperDollSlotVertMarginDim + slotDim);

    const paperDollHand1X = (paperDollHorizMargin * 2);

    const paperDollHand2X = ((middleRowX - paperDollHorizMargin) * 2);

    const paperDollFeetY = (middleRowY + slotDim + paperDollSlotVertMarginDim);

    const labelOffset = 18;

    const slotComps = inventoryEnt.getAll('InventorySlotComponent');

    const slotHead = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Head);
    this._drawSlot(slotHead, middleRowX / scale, paperDollHeadY / scale, slotDim / scale);
    this._drawLabel(slotHead, middleRowX / scale, (paperDollHeadY - labelOffset) / scale);

    const slotHand1 = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Hand1);
    this._drawSlot(slotHand1, paperDollHand1X / scale, middleRowY / scale, slotDim / scale);
    this._drawLabel(slotHand1, paperDollHand1X / scale, (middleRowY - labelOffset) / scale);

    const slotBody = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Body);
    this._drawSlot(slotBody, middleRowX / scale, middleRowY / scale, slotDim / scale);
    this._drawLabel(slotBody, middleRowX / scale, (middleRowY - labelOffset) / scale);

    const slotHand2 = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Hand2);
    this._drawSlot(slotHand2, paperDollHand2X / scale, middleRowY / scale, slotDim / scale);
    this._drawLabel(slotHand2, paperDollHand2X / scale, (middleRowY - labelOffset) / scale);

    const slotFeet = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Feet);
    this._drawSlot(slotFeet, middleRowX / scale, paperDollFeetY / scale, slotDim / scale);
    this._drawLabel(slotFeet, middleRowX / scale, (paperDollFeetY - labelOffset) / scale);

    // backpack
    const backpackRowColCount = 5;
    const backpackSlotMargin = 10;
    const backpackDim = slotDim * backpackRowColCount;
    const startOffset = (backpackRowColCount * backpackSlotMargin) - backpackSlotMargin;
    const startX = (screenWidth - startOffset) / 2.2;
    const startY = paperDollHeadY; /*(screenHeight - backpackDim - startOffset) / 3;*/

    let x = 0, y = 0;

    _.chain(slotComps)
     .filter(c => c.slotType === Const.InventorySlot.Backpack)
     .each(c => {

       const offset = slotDim + backpackSlotMargin;
       const slotX = (offset * x + startX) / scale;
       const slotY = (offset * y + startY) / scale;

       this._drawSlot(c, slotX, slotY, slotDim / scale);

       if (x === 0 && y === 0) {
         this._drawLabel(c, slotX, slotY - (labelOffset / scale));
       } else {
         c.labelSprite.visible = false;
       }

       ++x;

       if (x === 5) {
         x = 0;
         ++y;
       }

     })
     .value();

    //hotbar
    const hotbarX = startX;
    const hotbarY = startY + (backpackSlotMargin * 3);

    _.chain(slotComps)
     .filter(c => c.slotType === Const.InventorySlot.Hotbar)
     .each(c => {

       const offset = slotDim + backpackSlotMargin;
       const slotX = (offset * x + hotbarX) / scale;
       const slotY = (offset * y + hotbarY) / scale;
       this._drawSlot(c, slotX, slotY, slotDim / scale);
       this._drawLabel(c, slotX, slotY - (labelOffset / scale));

       ++x;

     })
     .value();

    //trash
    const slotTrash = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Trash);
    const trashX = screenWidth - ((paperDollHorizMargin * 2) + slotDim + paperDollSlotHorizMarginDim);
    const trashY = startY;
    this._drawSlot(slotTrash, trashX / scale, trashY / scale, slotDim / scale);
    this._drawLabel(slotTrash, trashX / scale, (trashY - labelOffset) / scale);

    //use
    const slotUse = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Use);
    const useX = ((paperDollHand2X + slotDim + paperDollSlotHorizMarginDim));
    const useY = startY;
    this._drawSlot(slotUse, useX / scale, useY / scale, slotDim / scale);
    this._drawLabel(slotUse, useX / scale, (useY - labelOffset) / scale);

    //character details
    inventoryEnt.get('InventoryHeroTextComponent')
                .sprite
                .position.set(paperDollHand1X / scale, (paperDollFeetY + slotDim + paperDollSlotVertMarginDim) / scale);

  }

  _initItems(heroEntity, inventoryEntity, entities) {

    const entityIdSlotCompMap = Object.create(null);

    const slotComps = inventoryEntity.getAll('InventorySlotComponent');
    const heroEntRefComps = heroEntity.getAll('EntityReferenceComponent');

    for (const slotType of _.values(Const.InventorySlot)) {

      if (slotType === Const.InventorySlot.Backpack || slotType === Const.InventorySlot.Hotbar) {

        const multiSlotComps = _.filter(slotComps, sc => sc.slotType === slotType);
        const invEntRefComps = _.filter(heroEntRefComps, c => c.typeId === slotType);

        for (let i = 0; i < multiSlotComps.length; ++i) {

          const entityId = invEntRefComps[i].entityId;

          if (!entityId) { continue; }

          entityIdSlotCompMap[entityId] = multiSlotComps[i];

        }

      } else {

        const entId = (_.find(heroEntRefComps, c => c.typeId === slotType)).entityId;

        if (entId) {
          entityIdSlotCompMap[entId] = _.find(slotComps, sc => sc.slotType === slotType);
        }

      }

    }

    _.each(Object.keys(entityIdSlotCompMap), (key) => {
      this._positionIconInSlot(key, entityIdSlotCompMap[key], entities);
    });

  }

  _positionIconInSlot(refEntId, slotComp, entities) {

    const refEnt = EntityFinders.findById(entities, refEntId);
    const inventoryIconComp = refEnt.get('InventoryIconComponent');
    const sprite = this._pixiContainer.addChild(inventoryIconComp.sprite);
    sprite.position.x = slotComp.position.x + (slotComp.slotGraphics.width / 2);
    sprite.position.y = slotComp.position.y + (slotComp.slotGraphics.height / 2);

  }

  _drawSlot(slotComp, x, y, size) {

    slotComp.slotGraphics
            .lineStyle(1, 0xffffff)
            .beginFill(0x000000, 1)
            .drawRect(x, y, size, size)
            .endFill();

    slotComp.position.set(x, y);

  }

  _drawLabel(slotComp, x, y) {
    slotComp.labelSprite.position.set(x, y);
  }

}
