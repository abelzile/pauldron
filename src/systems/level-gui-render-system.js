import * as Const from "../const";
import * as EntityFinders from "../entity-finders";
import _ from "lodash";
import System from "../system";


export default class LevelGuiRenderSystem extends System {

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

    const guiEnt = EntityFinders.findLevelGui(entities);

    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');
    const hpGraphicsObj = this._pixiContainer.addChild(hpGuiComp.barGraphics);
    const hpIconObj = this._pixiContainer.addChild(hpGuiComp.barIconSprite);
    hpIconObj.position.set(0, 0);

    const hotbarGuiComp = guiEnt.get('HotbarGuiComponent');
    const hotbarGraphicsObj = this._pixiContainer.addChild(hotbarGuiComp.graphics);

  }

  processEntities(gameTime, entities) {

    this._drawBars(entities);

    this._drawHotbar(entities);

  }

  _drawBars(entities) {

    const heroEnt = this._entityManager.heroEntity;
    const heroHpComp = _.find(heroEnt.getAll('StatisticComponent'), c => c.name === 'hit-points');

    const guiEnt = EntityFinders.findLevelGui(entities);
    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');

    hpGuiComp.barGraphics
             .clear()
             // white border around bar
             .lineStyle(1, 0xffffff)
             .drawRect(9.666, 5.333, heroHpComp.maxValue + 1, 5)
             // red hp bar
             .beginFill(0xd40000)
             .lineStyle(0)
             .drawRect(10, 6, heroHpComp.currentValue, 4)
             .endFill();

    hpGuiComp.barIconSprite.position.set(0, 0);

  }

  _drawHotbar(entities) {

    const heroEnt = this._entityManager.heroEntity;
    const heroEntityRefComps = heroEnt.getAll('EntityReferenceComponent');

    this._ensureHotbarIcons(heroEntityRefComps, entities);
    this._clearNonHotbarIcons(heroEntityRefComps, entities);

    const hotbarIconComps = _.chain(heroEntityRefComps)
                             .filter(c => c.typeId === Const.InventorySlot.Hotbar)
                             .map(c => {

                               if (!c.entityId) { return undefined; }

                               const ent = EntityFinders.findById(entities, c.entityId);

                               if (!ent) { return undefined; }

                               return ent.get('LevelIconComponent');

                             })
                             .value();

    const inventoryEnt = EntityFinders.findInventory(entities);

    const guiEnt = EntityFinders.findLevelGui(entities);
    const hotbarGuiComp = guiEnt.get('HotbarGuiComponent');
    
    const tilePxSize = this._renderer.tilePxSize;
    const slotSize = tilePxSize + 4;
    const spacingSize = 2;
    const iconOffset = (slotSize - tilePxSize) / 2;

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const slotWidth = slotSize * scale;
    const slotSpacingWidth = spacingSize * scale;
    const arbitraryXOffset = 9 * scale;

    const startX = (screenWidth - (slotWidth * Const.HotbarSlotCount + slotSpacingWidth * Const.HotbarSlotCount)) / 2 + arbitraryXOffset;
    const startY = screenHeight - slotWidth - slotSpacingWidth;

    const g = hotbarGuiComp.graphics
                           .clear()
                           .lineStyle(1, 0xffffff);

    _.chain(inventoryEnt.getAll('InventorySlotComponent'))
     .filter(c => c.slotType === Const.InventorySlot.Hotbar)
     .each((c, i) => {

       const x = (((slotWidth + slotSpacingWidth) * i) + startX) / scale;
       const y = startY / scale;

       g.drawRect(x, y, slotSize, slotSize);

       const comp = hotbarIconComps[i];

       if (comp) {
         comp.sprite.position.set(x + iconOffset, y + iconOffset);
       }

     })
     .value();

    g.endFill();

  }

  _ensureHotbarIcons(heroEntityRefComps, entities) {

    this._hotbarIconAction(heroEntityRefComps,
                           entities,
                           comp => comp.typeId === Const.InventorySlot.Hotbar,
                           sprite => {
                             if (!sprite.parent || (sprite.parent && sprite.parent !== this._pixiContainer)) {
                               this._pixiContainer.addChild(sprite);
                             }
                           });

  }

  _clearNonHotbarIcons(heroEntityRefComps, entities) {

    this._hotbarIconAction(heroEntityRefComps,
                           entities,
                           comp => comp.typeId !== Const.InventorySlot.Hotbar,
                           sprite => {
                             if (sprite.parent && sprite.parent === this._pixiContainer) {
                               this._pixiContainer.removeChild(sprite);
                             }
                           });

  }

  _hotbarIconAction(heroEntityRefComps, entities, filterFunc, spriteFunc) {

    _.chain(heroEntityRefComps)
     .filter(c => filterFunc(c))
     .each(c => {

       if (!c.entityId) { return; }

       const ent = EntityFinders.findById(entities, c.entityId);

       if (!ent) { return; }

       spriteFunc(ent.get('LevelIconComponent').sprite);

     })
     .value();

  }

}
