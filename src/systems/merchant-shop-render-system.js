import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
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
    const screenWidth = Const.ScreenWidth;
    const screenHeight = Const.ScreenHeight;
    const gui = EntityFinders.findMerchantShopGui(entities);

    this.drawDialogHeader(gui.get('DialogHeaderComponent'));

    const marginX = (screenWidth - ((this.SlotSize + this.SlotMarginH) * this.ColCount - this.SlotMarginH)) / 2;
    const marginY = (screenHeight - ((this.SlotSize + this.SlotMarginV) * this.RowCount - this.SlotMarginV)) / 2;

    const background = gui.getAll('GraphicsComponent', component => component.id === 'background')[0];
    this.pixiContainer.addChild(background.graphics);

    const inventorySlots = gui.getAll('InventorySlotComponent');
    for (let i = 0; i < inventorySlots.length; ++i) {
      const inventorySlot = inventorySlots[i];
      this.pixiContainer.addChild(inventorySlot.labelSprite, inventorySlot.slotGraphics);
    }

    this._drawLayout(gui, marginX, marginY);
    this._initItems(this._entityManager.heroEntity, gui, entities, Const.InventorySlot.Backpack);

    const merchant = EntityFinders.findById(entities, this.pixiContainer.merchantId);
    this._initItems(merchant, gui, entities, Const.MerchantSlot.Stock);
  }

  processEntities(gameTime, entities, input) {}

  refreshBackpack(entities) {
    const gui = EntityFinders.findMerchantShopGui(entities);
    this._initItems(this._entityManager.heroEntity, gui, entities, Const.InventorySlot.Backpack);

    const merchant = EntityFinders.findById(entities, this.pixiContainer.merchantId);
    this._initItems(merchant, gui, entities, Const.MerchantSlot.Stock);
  }

  _drawLayout(gui, marginX, marginY) {
    const grid = this._buildLayoutGrid(marginX, marginY);

    //const scale = Const.ScreenScale;
    //gui.get('InventoryHeroTextComponent').sprite.position.set(grid[0][0].x / scale, grid[3][0].y / scale);
    //gui.get('InventoryItemTextComponent').sprite.position.set(grid[0][10].x / scale, grid[0][10].y / scale);

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
    marginY += 5 * Const.ScreenScale; // add some arbitrary top margin for looks.

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
}
