import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as PixiFilters from 'pixi-filters';
import EntityReferenceComponent from '../components/entity-reference-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import System from '../system';
import * as ScreenUtils from '../utils/screen-utils';

export default class LevelGuiRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this.MoneyGlowStrength = 3;
    this.HotbarBorderGlowStrength = 3;
    this.LevelNameDisplayTimeMax = 2000;
    this.SlotSize = Const.TilePixelSize + 4;
    this.SpacingSize = 2;
    this.BarData = [
      { statId: Const.Statistic.HitPoints, color: Const.Color.HealthRed },
      { statId: Const.Statistic.MagicPoints, color: Const.Color.MagicBlue }
    ];

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._gui = null;
    this._levelNameDisplayTime = 0;

    this._ensureHotbarIconAdded = sprite => {
      if ((sprite && !sprite.parent) || (sprite.parent && sprite.parent !== this._pixiContainer)) {
        this._pixiContainer.addChild(sprite);
      }
    };

    this._ensureHotbarIconRemoved = sprite => {
      if (sprite && sprite.parent && sprite.parent === this._pixiContainer) {
        this._pixiContainer.removeChild(sprite);
      }
    };
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    //TODO: show exp/level on screen as well
    this._gui = EntityFinders.findLevelGui(entities);

    for (const bar of this._gui.getAll('LevelStatisticBarComponent')) {
      this._pixiContainer.addChild(bar.barComponent.graphics, bar.iconComponent.sprite);
    }

    for (const graphicComps of this._gui.getAll('GraphicsComponent')) {
      const graphic = graphicComps.graphics;
      this._pixiContainer.addChild(graphic);
      const glow = new PixiFilters.GlowFilter(
        15,
        this.HotbarBorderGlowStrength,
        this.HotbarBorderGlowStrength,
        Const.Color.White,
        0.5
      );
      graphic.filters = [glow];
      glow.enabled = false;
    }

    for (const spriteComp of this._gui.getAll('LevelTextDisplayComponent')) {
      this._pixiContainer.addChild(spriteComp.iconComponent.sprite, spriteComp.textComponent.sprite);
      if (spriteComp.id === 'money') {
        const glow = new PixiFilters.GlowFilter(15, this.MoneyGlowStrength, 3, Const.Color.White, 0.5);
        spriteComp.textComponent.sprite.filters = [glow];
        glow.enabled = false;
      }
    }

    const bmpTxts = this._gui.getAll('TextComponent');
    for (const bmpTxt of bmpTxts) {
      this._pixiContainer.addChild(bmpTxt.sprite);
    }

    const scaledScreenWidth = Const.ScreenWidth / Const.ScreenScale;
    const scaledHalfScreenWidth = scaledScreenWidth / 2;
    const scaledScreenHeight = Const.ScreenHeight / Const.ScreenScale;

    const lvlUpTxt = bmpTxts.find(c => c.id === 'level_up');
    lvlUpTxt.hide();
    lvlUpTxt.position.y = scaledScreenHeight / 5 * 4;
    lvlUpTxt.position.x = scaledHalfScreenWidth - (lvlUpTxt.width / 2);

    const lvlNameTxt = bmpTxts.find(c => c.id === 'level_name');
    lvlNameTxt.show();
    lvlNameTxt.text = ScreenUtils.buildHeading3Text(this._entityManager.currentLevelEntity.get('NameComponent').description);
    lvlNameTxt.position.y = scaledScreenHeight / 5;
    lvlNameTxt.position.x = scaledHalfScreenWidth - (lvlNameTxt.width / 2);

    this._drawHotbarFrames(entities);
  }

  processEntities(gameTime, entities) {
    this._drawBars(entities);
    this._drawHotbarItems(entities);
    this._drawMsgs(gameTime, entities);

    const moneyDisplay = this._gui.get('LevelTextDisplayComponent', c => c.id === 'money');
    const glow = moneyDisplay.textComponent.sprite.filters[0];
    if (glow.enabled) {
      glow.outerStrength -= 0.25;
      if (glow.outerStrength <= 0) {
        glow.enabled = false;
      }
    }

    for (const graphicComp of this._gui.getAll('GraphicsComponent', this._findHotbarBordersById)) {
      const g = graphicComp.graphics;
      const glow = g.filters[0];
      if (glow.enabled) {
        glow.outerStrength -= 0.25;
        glow.innerStrength -= 0.25;
        if (glow.outerStrength <= 0) {
          glow.enabled = false;
        }
      }
    }
  }

  showLevelUpMsg() {
    const bmpTexts = this._gui.get('TextComponent', c => c.id === 'level_up');
    bmpTexts.show();
  }

  showMoneyIncrease() {
    const moneyDisplay = this._gui.get('LevelTextDisplayComponent', c => c.id === 'money');
    const glow = moneyDisplay.textComponent.sprite.filters[0];
    glow.outerStrength = this.MoneyGlowStrength;
    glow.enabled = true;
  }

  showUseHotbarItem(hotbarSlotIndex) {
    const graphicsComp = this._gui.get('GraphicsComponent', c => c.id === 'hotbar_border_' + hotbarSlotIndex);
    const glow = graphicsComp.graphics.filters[0];
    glow.outerStrength = this.HotbarBorderGlowStrength;
    glow.innerStrength = this.HotbarBorderGlowStrength;
    glow.enabled = true;
  }

  _drawBars(entities) {
    const hero = this._entityManager.heroEntity;
    const heroStats = hero.getAll('StatisticComponent');
    const levelStatBars = this._gui.getAll('LevelStatisticBarComponent');
    const iconX = 2;
    let iconY = 2;
    const borderX = 9;
    let borderY = 4;
    const fillX = 9;
    let fillY = 4;
    const ySpace = 10;

    for (const bar of this.BarData) {
      const statComp = heroStats.find(c => c.name === bar.statId);
      const barComp = levelStatBars.find(c => c.statisticTypeId === bar.statId);
      const g = barComp.barComponent.graphics.clear();
      //bar
      g
        .beginFill(bar.color)
        .lineStyle(1, bar.color)
        .drawRect(fillX, fillY, statComp.currentValue, 5)
        .endFill();
      //border
      g.lineStyle(1, Const.Color.White).drawRect(borderX, borderY, statComp.maxValue + 1, 5);

      barComp.iconComponent.sprite.position.set(iconX, iconY);

      borderY += ySpace;
      fillY += ySpace;
      iconY += ySpace;
    }

    const money = hero.get('MoneyComponent');
    const otherDisplay = this._gui.getAllKeyed('LevelTextDisplayComponent', 'id');
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
    const inventoryHotbarSlots = EntityFinders.findInventoryGui(entities).getAll(
      'InventorySlotComponent',
      InventorySlotComponent.isHotbarSlot
    );
    const hotbarSlotLabels = this._gui.getAll('TextComponent', this._findHotbarLabelsById);
    const hotbarSlotBorders = this._gui.getAll('GraphicsComponent', this._findHotbarBordersById);

    for (let i = 0; i < inventoryHotbarSlots.length; ++i) {
      const x = ((slotWidth + slotSpacingWidth) * i + startX) / scale;
      const y = startY / scale;

      hotbarSlotBorders[i].graphics
        .clear()
        .lineStyle(1, Const.Color.White)
        .drawRect(x, y, this.SlotSize, this.SlotSize)
        .endFill();
      hotbarSlotLabels[i].position.set(x, y);
    }
  }

  _drawHotbarItems(entities) {
    const entRefs = this._entityManager.heroEntity.getAll('EntityReferenceComponent');

    this._ensureHotbarIcons(entRefs, entities);
    this._clearNonHotbarIcons(entRefs, entities);

    if (!entRefs.some(EntityReferenceComponent.isNotEmpty)) {
      return;
    }

    const hotbarEntRefs = entRefs.filter(EntityReferenceComponent.isHotbarSlot);
    const hotbarIcons = EntityFinders.findReferencedIn(entities, hotbarEntRefs, false).map(this._getIconOrNull);
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
    const inventoryHotbarSlots = inventorySlots.filter(InventorySlotComponent.isHotbarSlot);

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

  _drawMsgs(gameTime, entities) {
    const bmpTexts = this._gui.getAllKeyed('TextComponent', 'id');
    const levelUpTxt = bmpTexts['level_up'];

    if (levelUpTxt.isVisible) {
      levelUpTxt.sprite.alpha -= 0.01;
    }

    const levelNameTxt = bmpTexts['level_name'];

    if (levelNameTxt.isVisible) {
      if (this._levelNameDisplayTime > this.LevelNameDisplayTimeMax) {
        levelNameTxt.sprite.alpha -= 0.01;
      }
      this._levelNameDisplayTime += gameTime;
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
    for (const entRef of entityRefComps.filter(filterFunc)) {
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

  _findHotbarLabelsById(label) {
    return label && label.id && label.id.startsWith('hotbar_label_');
  }

  _findHotbarBordersById(border) {
    return border && border.id && border.id.startsWith('hotbar_border_');
  }
}
