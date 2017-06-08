import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import DialogRenderSystem from './dialog-render-system';

export default class MerchantShopRenderSystem extends DialogRenderSystem {
  constructor(pixiContainer, renderer, entityManager) {
    super(pixiContainer, renderer);

    this.RowCount = 7;
    this.ColCount = 14;
    this.SlotSize = 70;
    this.SlotMarginH = 16;
    this.SlotMarginV = 18;
    this.LabelOffset = 17;

    this.BorderColor = Const.Color.White;
    this.SlotBackgroundColor = Const.Color.DarkDarkBlueGray;

    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findMerchantShopGui(entities);

    super.initialize(gui.get('DialogHeaderComponent'));

    const marginX = (Const.ScreenWidth - ((this.SlotSize + this.SlotMarginH) * this.ColCount - this.SlotMarginH)) / 2;
    const marginY = (Const.ScreenHeight - ((this.SlotSize + this.SlotMarginV) * this.RowCount - this.SlotMarginV)) / 2;

    const background = gui.getAll('GraphicsComponent', component => component.id === 'background')[0];
    this.pixiContainer.addChild(background.graphics);

    const inventorySlots = gui.getAll('InventorySlotComponent');
    for (let i = 0; i < inventorySlots.length; ++i) {
      const slot = inventorySlots[i];
      this.pixiContainer.addChild(slot.labelSprite, slot.slotGraphics);
    }

    const arbitraryExtraYMargin = 0; //16 * Const.ScreenScale; // add some arbitrary top margin for looks.
    const grid = this._buildLayoutGrid(marginX, marginY + arbitraryExtraYMargin);
    this._drawLayout(gui, grid);

    this.refreshItems(entities, gui);

    const textDisplays = gui.getAllKeyed('LevelTextDisplayComponent', 'id');
    _.forOwn(textDisplays, (value, key) => {
      this.pixiContainer.addChild(value.iconComponent.sprite, value.textComponent.sprite);
    });

    const hero = this._entityManager.heroEntity;
    const money = hero.get('MoneyComponent');
    const moneyPos = grid[5][9];
    const moneyDisplay = textDisplays['money'];
    moneyDisplay.setPosition(moneyPos.x / Const.ScreenScale, moneyPos.y / Const.ScreenScale);
    moneyDisplay.text = money.amount;

    const costDisplay = textDisplays['cost'];
    costDisplay.hide();

    const texts = gui.getAllKeyed('BitmapTextComponent', 'id');

    _.forOwn(texts, (value, key) => {
      const sprite = value.sprite;

      this.pixiContainer.addChild(sprite);

      switch(key) {
        case 'merchant_item': {
          const pos = grid[2][5];
          sprite.position.set(pos.x / Const.ScreenScale, pos.y / Const.ScreenScale);
          //sprite.maxWidth = ((this.SlotSize * 2) + this.SlotMarginH);
          break;
        }
        case 'error': {
          const pos = grid[0][6];
          sprite.anchor.set(0.5, 0);
          sprite.position.set((pos.x - (this.SlotMarginH / 2)) / Const.ScreenScale, pos.y / Const.ScreenScale);
          break;
        }
      }
    });
  }

  processEntities(gameTime, entities, input) {
    const hero = this._entityManager.heroEntity;

    this._drawHeroMoney(hero, entities);
    this._drawCurrentItemDetails(entities);
    this._updateErrorMsg(entities);
  }

  refreshItems(entities, gui = EntityFinders.findMerchantShopGui(entities)) {
    this._initItems(this._entityManager.heroEntity, gui, entities, Const.InventorySlot.Backpack);
    const merchant = EntityFinders.findById(entities, this.pixiContainer.merchantId);
    this._initItems(merchant, gui, entities, Const.MerchantSlot.Stock);
  }

  showErrorMsg(msg) {
    const gui = EntityFinders.findMerchantShopGui(this._entityManager.entities);
    const texts = gui.getAllKeyed('BitmapTextComponent', 'id');

    const errTxt = texts['error'];
    if (errTxt) {
      errTxt.text = msg;
      errTxt.show();
    }
  }

  _updateErrorMsg(entities) {
    const gui = EntityFinders.findMerchantShopGui(entities);
    const texts = gui.getAllKeyed('BitmapTextComponent', 'id');

    const errTxt = texts['error'];
    if (errTxt && errTxt.isVisible) {
      errTxt.alpha -= 0.005;
    }
  }

  _drawLayout(gui, grid) {
    const gridSlotHash = Object.create(null);
    gridSlotHash[Const.MerchantSlot.Buy] = grid[1][4];
    gridSlotHash[Const.MerchantSlot.Sell] = grid[1][7];

    const slotComps = gui.getAll('InventorySlotComponent');

    _.forOwn(gridSlotHash, (val, key) => {
      this._drawSlot(_.find(slotComps, sc => sc.slotType === key), val);
    });

    this._drawGridSlots(_.filter(slotComps, sc => sc.slotType === Const.InventorySlot.Backpack), grid, 9, 0, 5);
    this._drawGridSlots(_.filter(slotComps, sc => sc.slotType === Const.MerchantSlot.Stock), grid, 0, 0, 3);
  }

  _drawGridSlots(slots, grid, xStart, yStart, rowLength) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < slots.length; ++i) {
      const slot = slots[i];
      slot.labelSprite.visible = i === 0;

      this._drawSlot(slot, grid[y + yStart][x + xStart]);

      if ((i + 1) % rowLength === 0) {
        y++;
        x = 0;
      } else {
        x++;
      }
    }
  }

  _buildLayoutGrid(marginX, marginY) {
    let startY = marginY;
    const grid = [];

    for (let y = 0; y < this.RowCount; ++y) {
      const row = [];

      let startX = marginX;

      for (let x = 0; x < this.ColCount; ++x) {
        row.push({ x: startX, y: startY });
        startX += this.SlotSize + this.SlotMarginH;
      }

      grid.push(row);

      startY += this.SlotSize + this.SlotMarginV;
    }

    return grid;
  }

  _drawSlot(slotComp, val) {
    const scale = Const.ScreenScale;
    this._drawSlotBorder(slotComp, val.x / scale, val.y / scale, this.SlotSize / scale);
    this._drawSlotLabel(slotComp, val.x / scale, (val.y - this.LabelOffset) / scale);
  }

  _drawSlotBorder(slotComp, x, y, size) {
    slotComp.slotGraphics
      .lineStyle(1, this.BorderColor)
      .beginFill(this.SlotBackgroundColor, 1)
      .drawRect(x, y, size, size)
      .endFill();

    slotComp.position.set(x, y);
  }

  _drawSlotLabel(slotComp, x, y) {
    slotComp.labelSprite.position.set(x, y);
  }

  _initItems(mob, gui, entities, slotType) {
    const invSlots = _.filter(gui.getAll('InventorySlotComponent'), slot => slot.slotType === slotType);
    const entRefs = _.filter(mob.getAll('EntityReferenceComponent'), entRef => entRef.typeId === slotType);

    for (let i = 0; i < invSlots.length; ++i) {
      const entityId = entRefs[i].entityId;

      if (!entityId) {
        continue;
      }

      this._positionIconInSlot(entityId, invSlots[i], entities);
    }
  }

  _positionIconInSlot(refEntId, slotComp, entities) {
    const refEnt = EntityFinders.findById(entities, refEntId);
    const inventoryIconComp = refEnt.get('InventoryIconComponent');

    const sprite = inventoryIconComp.sprite;
    sprite.anchor.set(0.5);
    sprite.position.set(
      slotComp.position.x + slotComp.slotGraphics.width / 2,
      slotComp.position.y + slotComp.slotGraphics.height / 2
    );
    this.pixiContainer.addChild(sprite);
  }

  _drawHeroMoney(hero, entities) {
    const money = hero.get('MoneyComponent');
    const gui = EntityFinders.findMerchantShopGui(entities);
    const textDisplays = gui.getAllKeyed('LevelTextDisplayComponent', 'id');
    textDisplays['money'].textComponent.sprite.text = money.amount;
  }

  _drawCurrentItemDetails(entities) {
    const gui = EntityFinders.findMerchantShopGui(entities);
    const curEntRef = gui.get('CurrentEntityReferenceComponent');
    const textComps = gui.getAllKeyed('BitmapTextComponent', 'id');
    const textComp = textComps['merchant_item'];
    const textDisplays = gui.getAllKeyed('LevelTextDisplayComponent', 'id');
    const costDisplay = textDisplays['cost'];

    if (!curEntRef.entityId) {
      textComp.sprite.text = '';
      costDisplay.hide();
      return;
    }

    const item = EntityFinders.findById(entities, curEntRef.entityId);

    if (!item) {
      textComp.sprite.text = '';
      costDisplay.hide();
      return;
    }

    const isMerchantDrag = curEntRef.data === 'merchant';
    if (isMerchantDrag) {
      textComp.sprite.text = EntityUtils.getMerchantItemDescription(item, this._entityManager.heroEntity, entities);
    } else {
      textComp.sprite.text = EntityUtils.getInventoryItemDescription(item);
    }

    const cost = item.get('CostComponent');
    if (cost) {
      costDisplay.text = isMerchantDrag ? cost.amount : Math.round(cost.amount * Const.SellPriceMultiplier);
      costDisplay.setPosition(textComp.sprite.x, textComp.sprite.y + textComp.sprite.height + 1);
      costDisplay.show();
    } else {
      costDisplay.hide();
    }
  }
}
