import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';


export default class LevelGuiRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._showLevelUpMsg = false;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const guiEnt = EntityFinders.findLevelGui(entities);
    const bars = guiEnt.getAll('LevelStatisticBarComponent');

    for (let i = 0; i < bars.length; ++i) {

      const bar = bars[i];

      this._pixiContainer.addChild(bar.barGraphicsComponent.graphics, bar.iconSpriteComponent.sprite);

    }

    this._pixiContainer.addChild(guiEnt.get('HotbarGuiComponent').graphics);

    const bmpTxts = guiEnt.getAll('BitmapTextComponent');

    for (let i = 0; i < bmpTxts.length; ++i) {
      this._pixiContainer.addChild(bmpTxts[i].sprite);
    }

    const screenWidth = Const.ScreenWidth;
    const screenHeight = Const.ScreenHeight;
    const scale = Const.ScreenScale;
    const halfScreenWidth = screenWidth / 2;

    const lvlUpTxt = _.find(bmpTxts, c => c.id === 'level_up');
    const lvlUpTxtSprite = lvlUpTxt.sprite;
    lvlUpTxtSprite.alpha = 0;
    lvlUpTxtSprite.position.y = (screenHeight / scale / 5) * 4;
    lvlUpTxtSprite.position.x = (halfScreenWidth - (lvlUpTxtSprite.width * scale / 2)) / scale + Const.TilePixelSize / 2;

  }

  processEntities(gameTime, entities) {

    this._drawBars(entities);

    this._drawHotbar(entities);

    this._drawLevelUpMsg(entities);

  }

  showLevelUpMsg() {

    this._showLevelUpMsg = true;

  }

  _drawBars(entities) {

    const heroEnt = this._entityManager.heroEntity;
    const heroStatComps = heroEnt.getAll('StatisticComponent');

    const guiEnt = EntityFinders.findLevelGui(entities);
    const statBarComps = guiEnt.getAll('LevelStatisticBarComponent');

    const bars = [
      { statId: Const.Statistic.HitPoints, color: Const.Color.HealthRed },
      { statId: Const.Statistic.MagicPoints, color: Const.Color.MagicBlue }
    ];

    const iconX = 2;
    let iconY = 2;

    const borderX = 9;
    let borderY = 4;

    const fillX = 9;
    let fillY = 4;

    const ySpace = 10;

    for (let i = 0; i < bars.length; ++i) {

      const bar = bars[i];

      const statComp = _.find(heroStatComps, c => c.name === bar.statId);
      const barComp = _.find(statBarComps, c => c.statisticTypeId === bar.statId);

      const g = barComp.barGraphicsComponent.graphics.clear();

      //bar
      g.beginFill(bar.color)
       .lineStyle(1, bar.color)
       .drawRect(fillX, fillY, statComp.currentValue, 5)
       .endFill();

      //border
      g.lineStyle(1, Const.Color.White)
       .drawRect(borderX, borderY, statComp.maxValue + 1, 5);

      barComp.iconSpriteComponent.sprite.position.set(iconX, iconY);

      borderY += ySpace;
      fillY += ySpace;
      iconY += ySpace;

    }

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
    
    const tilePxSize = Const.TilePixelSize;
    const slotSize = tilePxSize + 4;
    const spacingSize = 2;
    const iconOffset = (slotSize - tilePxSize) / 2;

    const screenWidth = Const.ScreenWidth;
    const screenHeight = Const.ScreenHeight;
    const scale = Const.ScreenScale;

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

  _drawLevelUpMsg(entities) {

    const levelGui = EntityFinders.findLevelGui(entities);
    const bmpTexts = levelGui.getAllKeyed('BitmapTextComponent', 'id');
    const levelUpTxt = bmpTexts['level_up'];

    if (this._showLevelUpMsg) {

      levelUpTxt.sprite.alpha = 1;

      this._showLevelUpMsg = false;

    }

    let alpha = levelUpTxt.sprite.alpha;

    if (alpha > 0) {

      alpha -= .005;

      if (alpha < 0) {
        alpha = 0;
      }

      levelUpTxt.sprite.alpha = alpha;

    }

  }

  _ensureHotbarIcons(heroEntityRefComps, entities) {

    this._hotbarIconAction(heroEntityRefComps,
                           entities,
                           comp => comp.typeId === Const.InventorySlot.Hotbar,
                           sprite => {
                             if (sprite && !sprite.parent || (sprite.parent && sprite.parent !== this._pixiContainer)) {
                               this._pixiContainer.addChild(sprite);
                             }
                           });

  }

  _clearNonHotbarIcons(heroEntityRefComps, entities) {

    this._hotbarIconAction(heroEntityRefComps,
                           entities,
                           comp => comp.typeId !== Const.InventorySlot.Hotbar,
                           sprite => {
                             if (sprite && sprite.parent && sprite.parent === this._pixiContainer) {
                               this._pixiContainer.removeChild(sprite);
                             }
                           });

  }

  _hotbarIconAction(heroEntityRefComps, entities, filterFunc, spriteFunc) {

    const comps = _.filter(heroEntityRefComps, c => filterFunc(c));

    for (let i = 0; i < comps.length; ++i) {

      const c = comps[i];

      if (!c.entityId) { continue; }

      const ent = EntityFinders.findById(entities, c.entityId);

      if (!ent) { continue; }

      const levelIconComponent = ent.get('LevelIconComponent');

      if (!levelIconComponent) { continue; }

      spriteFunc(levelIconComponent.sprite);

    }

  }

}
