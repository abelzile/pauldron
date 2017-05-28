import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import EntityReferenceComponent from '../components/entity-reference-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import System from '../system';

export default class LevelGuiRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._showLevelUpMsg = false;

    this._ensureHotbarIconAdded = (sprite) => {
      if ((sprite && !sprite.parent) || (sprite.parent && sprite.parent !== this._pixiContainer)) {
        this._pixiContainer.addChild(sprite);
      }
    };

    this._ensureHotbarIconRemoved = (sprite) => {
      if (sprite && sprite.parent && sprite.parent === this._pixiContainer) {
        this._pixiContainer.removeChild(sprite);
      }
    };

    this.SlotSize = Const.TilePixelSize + 4;
    this.SpacingSize = 2;
    this.BarData = [
      { statId: Const.Statistic.HitPoints, color: Const.Color.HealthRed },
      { statId: Const.Statistic.MagicPoints, color: Const.Color.MagicBlue }
    ];
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    /*
    then show money amount and maybe exp/level on screen as well*/

    const gui = EntityFinders.findLevelGui(entities);
    const bars = gui.getAll('LevelStatisticBarComponent');

    for (const bar of bars) {
      this._pixiContainer.addChild(bar.barComponent.graphics, bar.iconComponent.sprite);
    }

    this._pixiContainer.addChild(gui.get('HotbarGuiComponent').graphics);

    const bmpTxts = gui.getAll('BitmapTextComponent');

    for (const bmpTxt of bmpTxts) {
      this._pixiContainer.addChild(bmpTxt.sprite);
    }

    const sprites = gui.getAll('LevelTextDisplayComponent');

    for (const sprite of sprites) {
      this._pixiContainer.addChild(sprite.iconComponent.sprite, sprite.textComponent.sprite);
    }

    const scale = Const.ScreenScale;
    const halfScreenWidth = Const.ScreenWidth / 2;

    const lvlUpTxt = _.find(bmpTxts, c => c.id === 'level_up');
    const lvlUpTxtSprite = lvlUpTxt.sprite;
    lvlUpTxtSprite.alpha = 0;
    lvlUpTxtSprite.position.y = Const.ScreenHeight / scale / 5 * 4;
    lvlUpTxtSprite.position.x = (halfScreenWidth - lvlUpTxtSprite.width * scale / 2) / scale + Const.TilePixelSize / 2;

    this._drawHotbarFrames(entities);
  }

  processEntities(gameTime, entities) {
    this._drawBars(entities);
    this._drawHotbarItems(entities);
    this._drawLevelUpMsg(entities);
  }

  showLevelUpMsg() {
    this._showLevelUpMsg = true;
  }

  _drawBars(entities) {
    const hero = this._entityManager.heroEntity;
    const heroStats = hero.getAll('StatisticComponent');
    const gui = EntityFinders.findLevelGui(entities);
    const levelStatBars = gui.getAll('LevelStatisticBarComponent');
    const iconX = 2;
    let iconY = 2;
    const borderX = 9;
    let borderY = 4;
    const fillX = 9;
    let fillY = 4;
    const ySpace = 10;

    for (const bar of this.BarData) {
      const statComp = _.find(heroStats, c => c.name === bar.statId);
      const barComp = _.find(levelStatBars, c => c.statisticTypeId === bar.statId);
      const g = barComp.barComponent.graphics.clear();
      //bar
      g.beginFill(bar.color).lineStyle(1, bar.color).drawRect(fillX, fillY, statComp.currentValue, 5).endFill();
      //border
      g.lineStyle(1, Const.Color.White).drawRect(borderX, borderY, statComp.maxValue + 1, 5);

      barComp.iconComponent.sprite.position.set(iconX, iconY);

      borderY += ySpace;
      fillY += ySpace;
      iconY += ySpace;
    }

    const money = hero.get('MoneyComponent');
    const otherDisplay = gui.getAllKeyed('LevelTextDisplayComponent', 'id');
    const moneyDisplay = otherDisplay['money'];
    moneyDisplay.iconComponent.sprite.position.set(iconX, iconY);
    moneyDisplay.textComponent.sprite.position.set(iconX + 10, iconY);
    moneyDisplay.textComponent.sprite.text = money.amount;
  }

  _drawHotbarFrames(entities) {
    const scale = Const.ScreenScale;
    const slotWidth = this.SlotSize * scale;
    const slotSpacingWidth = this.SpacingSize * scale;
    const arbitraryXOffset = 9 * scale;
    const startX =
      (Const.ScreenWidth - (slotWidth * Const.HotbarSlotCount + slotSpacingWidth * Const.HotbarSlotCount)) / 2 +
      arbitraryXOffset;
    const startY = Const.ScreenHeight - slotWidth - slotSpacingWidth;
    const inventorySlots = EntityFinders.findInventoryGui(entities).getAll('InventorySlotComponent');
    const inventoryHotbarSlots = _.filter(inventorySlots, InventorySlotComponent.isHotbarSlot);
    const hotbarGui = EntityFinders.findLevelGui(entities).get('HotbarGuiComponent');
    const g = hotbarGui.graphics.clear().lineStyle(1, 0xffffff);

    for (let i = 0; i < inventoryHotbarSlots.length; ++i) {
      const x = ((slotWidth + slotSpacingWidth) * i + startX) / scale;
      const y = startY / scale;
      g.drawRect(x, y, this.SlotSize, this.SlotSize);
    }

    g.endFill();
  }

  _drawHotbarItems(entities) {
    const entRefs = this._entityManager.heroEntity.getAll('EntityReferenceComponent');

    this._ensureHotbarIcons(entRefs, entities);
    this._clearNonHotbarIcons(entRefs, entities);

    if (!_.some(entRefs, EntityReferenceComponent.isNotEmpty)) {
      return;
    }

    const hotbarEntRefs = _.filter(entRefs, EntityReferenceComponent.isHotbarSlot);
    const hotbarIcons = _.map(EntityFinders.findReferencedIn(entities, hotbarEntRefs, false), this._getIconOrNull);
    const iconOffset = (this.SlotSize - Const.TilePixelSize) / 2;
    const scale = Const.ScreenScale;
    const slotWidth = this.SlotSize * scale;
    const slotSpacingWidth = this.SpacingSize * scale;
    const arbitraryXOffset = 9 * scale;
    const startX =
      (Const.ScreenWidth - (slotWidth * Const.HotbarSlotCount + slotSpacingWidth * Const.HotbarSlotCount)) / 2 +
      arbitraryXOffset;
    const startY = Const.ScreenHeight - slotWidth - slotSpacingWidth;
    const inventorySlots = EntityFinders.findInventoryGui(entities).getAll('InventorySlotComponent');
    const inventoryHotbarSlots = _.filter(inventorySlots, InventorySlotComponent.isHotbarSlot);

    for (let i = 0; i < inventoryHotbarSlots.length; ++i) {
      const x = ((slotWidth + slotSpacingWidth) * i + startX) / scale;
      const y = startY / scale;
      const icon = hotbarIcons[i];
      icon && icon.sprite.position.set(x + iconOffset, y + iconOffset);
    }
  }

  _getIconOrNull(item) {
    return !item ? null : item.get('LevelIconComponent');
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
      alpha -= 0.005;

      if (alpha < 0) {
        alpha = 0;
      }

      levelUpTxt.sprite.alpha = alpha;
    }
  }

  _ensureHotbarIcons(entRefs, entities) {
    this._hotbarIconAction(entRefs, entities, EntityReferenceComponent.isHotbarSlot, this._ensureHotbarIconAdded);
  }

  _clearNonHotbarIcons(entRefs, entities) {
    this._hotbarIconAction(entRefs, entities, this._isNotHotbarSlot, this._ensureHotbarIconRemoved);
  }

  _isNotHotbarSlot(comp) {
    return !EntityReferenceComponent.isHotbarSlot(comp);
  }

  _hotbarIconAction(entityRefComps, entities, filterFunc, spriteFunc) {
    const entRefs = _.filter(entityRefComps, filterFunc);

    for (let i = 0; i < entRefs.length; ++i) {
      const entRef = entRefs[i];

      if (!entRef.entityId) {
        continue;
      }

      const ent = EntityFinders.findById(entities, entRef.entityId);

      if (!ent) {
        continue;
      }

      const levelIconComponent = ent.get('LevelIconComponent');

      if (!levelIconComponent) {
        continue;
      }

      spriteFunc(levelIconComponent.sprite);
    }
  }
}
