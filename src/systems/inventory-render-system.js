import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as StringUtils from '../utils/string-utils';
import DialogRenderSystem from './dialog-render-system';
import InventorySlotComponent from '../components/inventory-slot-component';

export default class InventoryRenderSystem extends DialogRenderSystem {
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
    const gui = EntityFinders.findInventoryGui(entities);

    super.initialize(gui.get('DialogHeaderComponent'));

    const marginX = (screenWidth - ((this.SlotSize + this.SlotMarginH) * this.ColCount - this.SlotMarginH)) / 2;
    const marginY = (screenHeight - ((this.SlotSize + this.SlotMarginV) * this.RowCount - this.SlotMarginV)) / 2;

    for (const inventorySlot of gui.getAll('InventorySlotComponent')) {
      this.pixiContainer.addChild(inventorySlot.labelSprite, inventorySlot.slotGraphics);
    }

    const bitmapTexts = gui.getAll('TextComponent');
    for (const bitmapText of bitmapTexts) {
      this.pixiContainer.addChild(bitmapText.sprite);
    }

    this._drawLayout(gui, marginX, marginY);
    this._initItems(this._entityManager.heroEntity, gui, entities);
  }

  processEntities(gameTime, entities) {
    const gui = EntityFinders.findInventoryGui(entities);
    const hero = this._entityManager.heroEntity;

    this._drawCharacterDetails(hero, gui, entities);
    this._drawCurrentItemDetails(gui, entities);
  }

  unload(entities, levelScreen) {}

  _drawCharacterDetails(heroEnt, gui, entities) {
    const currValueHash = {};
    const maxValueHash = {};

    const stats = heroEnt.getAll('StatisticComponent');

    for (const stat of stats) {
      if (currValueHash[stat.name]) {
        currValueHash[stat.name] += stat.currentValue;
        maxValueHash[stat.name] += stat.maxValue;
      } else {
        currValueHash[stat.name] = stat.currentValue;
        maxValueHash[stat.name] = stat.maxValue;
      }
    }

    const entRefComps = heroEnt.getAll('EntityReferenceComponent');

    for (const entRefComp of entRefComps) {
      if (!_.includes(Const.EquipableInventorySlot, entRefComp.typeId)) {
        continue;
      }

      if (!entRefComp.entityId) {
        continue;
      }

      const equipEnt = EntityFinders.findById(entities, entRefComp.entityId);
      const equipStatComps = equipEnt.getAll('StatisticComponent');

      for (const statComp of equipStatComps) {
        switch (statComp.name) {
          case Const.Statistic.Defense:
          case Const.Statistic.Damage:
            //TODO: any other statistics worth displaying...

            if (currValueHash[statComp.name]) {
              currValueHash[statComp.name] += statComp.currentValue;
              maxValueHash[statComp.name] += statComp.maxValue;
            } else {
              currValueHash[statComp.name] = statComp.currentValue;
              maxValueHash[statComp.name] = statComp.maxValue;
            }

            break;
        }
      }
    }

    let str = '';

    _.forOwn(currValueHash, (val, key) => {
      str += `${StringUtils.formatIdString(key)}: ${StringUtils.formatNumber(val)}/${StringUtils.formatNumber(maxValueHash[key])}\n`;
    });

    gui.get('TextComponent', this._isHeroText).sprite.text = str;
  }

  _drawCurrentItemDetails(gui, entities) {
    const curEntRefComp = gui.get('CurrentEntityReferenceComponent');
    const textComp = gui.get('TextComponent', this._isItemText);

    if (!curEntRefComp.entityId) {
      textComp.sprite.text = '';
      return;
    }

    const curEnt = EntityFinders.findById(entities, curEntRefComp.entityId);

    if (!curEnt) {
      textComp.sprite.text = '';
      return;
    }

    textComp.sprite.text = EntityUtils.getInventoryItemDescription(curEnt);
  }

  _drawLayout(gui, marginX, marginY) {
    const scale = Const.ScreenScale;
    const grid = this._buildLayoutGrid(marginX, marginY);

    gui.get('TextComponent', this._isHeroText).sprite.position.set(grid[0][0].x / scale, grid[3][0].y / scale);
    gui.get('TextComponent', this._isItemText).sprite.position.set(grid[0][10].x / scale, grid[0][10].y / scale);

    const slotComps = gui.getAll('InventorySlotComponent');

    const gridSlotHash = Object.create(null);
    gridSlotHash[Const.InventorySlot.Head] = grid[0][1];
    gridSlotHash[Const.InventorySlot.Hand1] = grid[1][0];
    gridSlotHash[Const.InventorySlot.Body] = grid[1][1];
    gridSlotHash[Const.InventorySlot.Hand2] = grid[1][2];
    gridSlotHash[Const.InventorySlot.Feet] = grid[2][1];
    gridSlotHash[Const.InventorySlot.Use] = grid[0][3];
    gridSlotHash[Const.InventorySlot.Trash] = grid[6][13];

    _.forOwn(gridSlotHash, (val, key) => {
      this._drawSlot(slotComps.find(sc => sc.slotType === key), val);
    });

    const backpackSlots = slotComps.filter(InventorySlotComponent.isBackpackSlot);

    let i = 0;

    for (let y = 0; y < 5; ++y) {
      for (let x = 5; x < 10; ++x) {
        const slot = backpackSlots[i];
        this._drawSlot(slot, grid[y][x]);

        slot.labelSprite.visible = i === 0;

        ++i;
      }
    }

    const hotbarSlots = slotComps.filter(InventorySlotComponent.isHotbarSlot);
    const hotbarLabels = gui.getAll('TextComponent', this._isHotbarLabel);

    i = 0;

    for (let x = 5; x < 10; ++x) {
      const slot = hotbarSlots[i];
      const pos = grid[6][x];
      this._drawSlot(slot, pos);
      slot.labelSprite.visible = i === 0;

      const label = hotbarLabels[i];
      label.position.set(pos.x / Const.ScreenScale, pos.y / Const.ScreenScale);

      ++i;
    }
  }

  _drawSlot(slotComp, pos) {
    this._drawSlotBorder(
      slotComp,
      pos.x / Const.ScreenScale,
      pos.y / Const.ScreenScale,
      this.SlotSize / Const.ScreenScale
    );
    this._drawSlotLabel(slotComp, pos.x / Const.ScreenScale, (pos.y - this.LabelOffset) / Const.ScreenScale);
  }

  _initItems(heroEntity, inventoryEntity, entities) {
    const entityIdSlotCompMap = Object.create(null);
    const slotComps = inventoryEntity.getAll('InventorySlotComponent');
    const heroEntRefComps = heroEntity.getAll('EntityReferenceComponent');
    const invSlotTypes = _.values(Const.InventorySlot);

    for (const slotType of invSlotTypes) {
      if (slotType === Const.InventorySlot.Backpack || slotType === Const.InventorySlot.Hotbar) {
        const multiSlotComps = slotComps.filter(sc => sc.slotType === slotType);
        const invEntRefComps = heroEntRefComps.filter(c => c.typeId === slotType);

        for (let i = 0; i < multiSlotComps.length; ++i) {
          const entityId = invEntRefComps[i].entityId;

          if (!entityId) {
            continue;
          }

          entityIdSlotCompMap[entityId] = multiSlotComps[i];
        }
      } else {
        const entId = heroEntRefComps.find(c => c.typeId === slotType).entityId;

        if (entId) {
          entityIdSlotCompMap[entId] = slotComps.find(sc => sc.slotType === slotType);
        }
      }
    }

    _.forEach(Object.keys(entityIdSlotCompMap), key => {
      this._positionIconInSlot(key, entityIdSlotCompMap[key], entities);
    });
  }

  _positionIconInSlot(refEntId, slotComp, entities) {
    const refEnt = EntityFinders.findById(entities, refEntId);
    const inventoryIconComp = refEnt.get('InventoryIconComponent');

    const sprite = this.pixiContainer.addChild(inventoryIconComp.sprite);
    sprite.anchor.set(0.5);
    sprite.position.x = slotComp.position.x + slotComp.slotGraphics.width / 2;
    sprite.position.y = slotComp.position.y + slotComp.slotGraphics.height / 2;
  }

  _buildLayoutGrid(marginX, marginY) {
    marginY += 5 * this.renderer.globalScale; // add some arbitrary top margin for looks.

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

  _isHotbarLabel(bitmapTextComponent) {
    return bitmapTextComponent && bitmapTextComponent.id && bitmapTextComponent.id.startsWith('hotbar_');
  }

  _isHeroText(bitmapTextComponent) {
    return bitmapTextComponent && bitmapTextComponent.id && bitmapTextComponent.id === 'hero_text';
  }

  _isItemText(bitmapTextComponent) {
    return bitmapTextComponent && bitmapTextComponent.id && bitmapTextComponent.id === 'item_text';
  }
}
