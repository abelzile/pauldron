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

    this._pixiContainer.addChild(inventoryEnt.get('InventoryBackgroundComponent').backgroundGraphics);

    for (const inventorySlotComp of inventoryEnt.getAll('InventorySlotComponent')) {
      this._pixiContainer.addChild(inventorySlotComp.labelSprite, inventorySlotComp.slotGraphics);
    }

    this._drawBackground(inventoryEnt);

    this._initHpBar(entities, this._pixiContainer);

    this._initItems(heroEnt, inventoryEnt, entities);

  }

  processEntities(gameTime, entities) {

    const heroEnt = this._entityManager.heroEntity;

    this._drawHpBar(heroEnt, entities);

  }

  unload(entities, levelScreen) {

    this._initHpBar(entities, levelScreen);

  }

  _initHpBar(entities, pixiContainer) {

    const guiEnt = EntityFinders.findLevelGui(entities);

    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');

    const hpPixiGraphicsObj = pixiContainer.addChild(hpGuiComp.barGraphics);

    const hpPixiIconObj = pixiContainer.addChild(hpGuiComp.barIconSprite);
    hpPixiIconObj.position.set(20, 20);

  }

  _drawHpBar(heroEnt, entities) {

    const heroHpComp = _.find(heroEnt.getAll('StatisticComponent'), c => c.name === 'hit-points');

    const guiEnt = EntityFinders.findLevelGui(entities);
    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');

    const hpG = hpGuiComp.barGraphics;
    hpG.clear();

    // white border around bar
    hpG.lineStyle(1, 0xffffff);
    hpG.drawRect(29.666, 25.333, heroHpComp.maxValue + 1, 5);

    // red hp bar
    hpG.beginFill(0xd40000);
    hpG.lineStyle(0);
    hpG.drawRect(30, 26, heroHpComp.currentValue, 4)

    hpG.endFill();

  }

  _drawBackground(inventoryEnt) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const inventoryBgComp = inventoryEnt.get('InventoryBackgroundComponent');
    const inventoryBgGraphics = inventoryBgComp.backgroundGraphics;

    const bgMargin = 20;

    inventoryBgGraphics.lineStyle(1, 0xffffff);
    inventoryBgGraphics.beginFill(0x000000);
    inventoryBgGraphics.drawRect(bgMargin / scale, bgMargin / scale, (screenWidth - (bgMargin * 2)) / scale, (screenHeight - (bgMargin * 2)) / scale);
    inventoryBgGraphics.endFill();

    const slotDim = 80;
    const paperDollHorizMargin = 40;
    const paperDollSlotHorizMarginDim = 20;
    const paperDollSlotVertMarginDim = 30;

    const middleRowX = (paperDollHorizMargin * 2) + slotDim + paperDollSlotHorizMarginDim;
    const middleRowY = (screenHeight - slotDim) / 2;
    const paperDollHeadY = (middleRowY - slotDim - paperDollSlotVertMarginDim);
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
    const startY = (screenHeight - backpackDim - startOffset) / 2;

    let x = 0, y = 0;

    _(slotComps)
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

      });

    //trash
    const slotTrash = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Trash);
    const trashX = screenWidth - ((paperDollHorizMargin * 2) + slotDim + paperDollSlotHorizMarginDim);
    this._drawSlot(slotTrash, trashX / scale, middleRowY / scale, slotDim / scale);
    this._drawLabel(slotTrash, trashX / scale, (middleRowY - labelOffset) / scale);

    //use
    const slotUse = _.find(slotComps, sc => sc.slotType === Const.InventorySlot.Use);
    const useX = ((startX - paperDollHand2X) / 2) + paperDollHand2X;
    const useY = (screenHeight - backpackDim - startOffset) / 2;
    this._drawSlot(slotUse, useX / scale, useY / scale, slotDim / scale);
    this._drawLabel(slotUse, useX / scale, (useY - labelOffset) / scale);

  }

  _initItems(heroEntity, inventoryEntity, entities) {

    const entityIdSlotCompMap = Object.create(null);

    const slotComps = inventoryEntity.getAll('InventorySlotComponent');
    const heroEntRefComps = heroEntity.getAll('EntityReferenceComponent');

    for (const slotType of _.values(Const.InventorySlot)) {

      if (slotType === Const.InventorySlot.Backpack) {

        const slotBackpackComps = _.filter(slotComps, sc => sc.slotType === slotType);
        const invEntRefComps = _.filter(heroEntRefComps, c => c.typeId === slotType);

        for (let i = 0; i < slotBackpackComps.length; ++i) {

          const entityId = invEntRefComps[i].entityId;

          if (!entityId) { continue; }

          entityIdSlotCompMap[entityId] = slotBackpackComps[i];

        }

      } else {

        const entId = (_.find(heroEntRefComps, c => c.typeId === slotType)).entityId;

        if (entId) {
          entityIdSlotCompMap[entId] = _.find(slotComps, sc => sc.slotType === slotType);
        }

      }

    }

    Object.keys(entityIdSlotCompMap).forEach((key) => this._positionIconInSlot(key, entityIdSlotCompMap[key], entities));

  }

  _positionIconInSlot(refEntId, slotComp, entities) {

    const refEnt = EntityFinders.findById(entities, refEntId);
    const inventoryIconComp = refEnt.get('InventoryIconComponent');
    const iconSprite = inventoryIconComp.iconSprite;
    iconSprite.position.x = slotComp.position.x + (slotComp.slotGraphics.width / 2);
    iconSprite.position.y = slotComp.position.y + (slotComp.slotGraphics.height / 2);

    this._pixiContainer.addChild(iconSprite);

  }

  _drawSlot(slotComp, x, y, size) {

    const g = slotComp.slotGraphics;
    g.lineStyle(1, 0xffffff);
    g.beginFill(0x000000);
    g.drawRect(x, y, size, size);
    g.endFill();

    slotComp.position.set(x, y);

  }

  _drawLabel(slotComp, x, y) {
    slotComp.labelSprite.position.set(x, y);
  }

}
