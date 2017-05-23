import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as StringUtils from '../utils/string-utils';
import DialogRenderSystem from './dialog-render-system';

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
    const inventoryEnt = EntityFinders.findInventoryGui(entities);

    this.drawDialogHeader(inventoryEnt.get('DialogHeaderComponent'));

    const marginX = (screenWidth - ((this.SlotSize + this.SlotMarginH) * this.ColCount - this.SlotMarginH)) / 2;
    const marginY = (screenHeight - ((this.SlotSize + this.SlotMarginV) * this.RowCount - this.SlotMarginV)) / 2;

    this.pixiContainer.addChild(
      inventoryEnt.get('InventoryBackgroundComponent').graphics,
      inventoryEnt.get('InventoryHeroTextComponent').sprite,
      inventoryEnt.get('InventoryItemTextComponent').sprite
    );

    const inventorySlots = inventoryEnt.getAll('InventorySlotComponent');
    for (let i = 0; i < inventorySlots.length; ++i) {
      const inventorySlot = inventorySlots[i];
      this.pixiContainer.addChild(inventorySlot.labelSprite, inventorySlot.slotGraphics);
    }

    this._drawLayout(inventoryEnt, marginX, marginY);
    this._initItems(this._entityManager.heroEntity, inventoryEnt, entities);
  }

  processEntities(gameTime, entities) {
    const inventoryEnt = EntityFinders.findInventoryGui(entities);
    const hero = this._entityManager.heroEntity;

    this._drawCharacterDetails(hero, inventoryEnt, entities);
    this._drawCurrentItemDetails(inventoryEnt, entities);
  }

  unload(entities, levelScreen) {}

  _drawCharacterDetails(heroEnt, inventoryEnt, entities) {
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

    inventoryEnt.get('InventoryHeroTextComponent').sprite.text = str;
  }

  _drawCurrentItemDetails(inventoryEnt, entities) {
    const curEntRefComp = inventoryEnt.get('CurrentEntityReferenceComponent');
    const textComp = inventoryEnt.get('InventoryItemTextComponent');

    if (!curEntRefComp.entityId) {
      textComp.sprite.text = '';
      return;
    }

    const curEnt = EntityFinders.findById(entities, curEntRefComp.entityId);

    if (!curEnt) {
      textComp.sprite.text = '';
      return;
    }

    let desc = '';

    if (EntityFinders.isWeapon(curEnt)) {
      if (curEnt.has('MeleeWeaponComponent')) {
        desc = this._drawMeleeWeaponDetails(curEnt);
      } else {
        desc = this._drawRangedWeaponDetails(curEnt, textComp);
      }
    } else if (EntityFinders.isArmor(curEnt)) {
      desc = this._drawArmorDetails(curEnt);
    } else if (EntityFinders.isItem(curEnt)) {
      desc = this._drawItemDetails(curEnt, textComp);
    } else {
      desc = '';
    }

    textComp.sprite.text = desc;
  }

  _drawLayout(inventoryEnt, marginX, marginY) {
    const scale = Const.ScreenScale;
    const grid = this._buildLayoutGrid(marginX, marginY);

    inventoryEnt.get('InventoryHeroTextComponent').sprite.position.set(grid[0][0].x / scale, grid[3][0].y / scale);
    inventoryEnt.get('InventoryItemTextComponent').sprite.position.set(grid[0][10].x / scale, grid[0][10].y / scale);

    const slotComps = inventoryEnt.getAll('InventorySlotComponent');

    const gridSlotHash = Object.create(null);
    gridSlotHash[Const.InventorySlot.Head] = grid[0][1];
    gridSlotHash[Const.InventorySlot.Hand1] = grid[1][0];
    gridSlotHash[Const.InventorySlot.Body] = grid[1][1];
    gridSlotHash[Const.InventorySlot.Hand2] = grid[1][2];
    gridSlotHash[Const.InventorySlot.Feet] = grid[2][1];
    gridSlotHash[Const.InventorySlot.Use] = grid[0][3];
    gridSlotHash[Const.InventorySlot.Trash] = grid[6][13];

    _.forOwn(gridSlotHash, (val, key) => {
      this._drawSlot(_.find(slotComps, sc => sc.slotType === key), val);
    });

    const backpackSlots = _.filter(slotComps, sc => sc.slotType === Const.InventorySlot.Backpack);

    let i = 0;

    for (let y = 0; y < 5; ++y) {
      for (let x = 5; x < 10; ++x) {
        const slot = backpackSlots[i];
        this._drawSlot(slot, grid[y][x]);

        slot.labelSprite.visible = i === 0;

        ++i;
      }
    }

    const hotbarSlots = _.filter(slotComps, sc => sc.slotType === Const.InventorySlot.Hotbar);

    i = 0;

    for (let x = 5; x < 10; ++x) {
      const slot = hotbarSlots[i];
      this._drawSlot(slot, grid[6][x]);

      slot.labelSprite.visible = i === 0;

      ++i;
    }
  }

  _drawSlot(slotComp, val) {
    const scale = this.renderer.globalScale;
    this._drawSlotBorder(slotComp, val.x / scale, val.y / scale, this.SlotSize / scale);
    this._drawSlotLabel(slotComp, val.x / scale, (val.y - this.LabelOffset) / scale);
  }

  _initItems(heroEntity, inventoryEntity, entities) {
    const entityIdSlotCompMap = Object.create(null);

    const slotComps = inventoryEntity.getAll('InventorySlotComponent');
    const heroEntRefComps = heroEntity.getAll('EntityReferenceComponent');

    const invSlotTypes = _.values(Const.InventorySlot);

    for (let i = 0; i < invSlotTypes.length; ++i) {
      const slotType = invSlotTypes[i];

      if (slotType === Const.InventorySlot.Backpack || slotType === Const.InventorySlot.Hotbar) {
        const multiSlotComps = _.filter(slotComps, sc => sc.slotType === slotType);
        const invEntRefComps = _.filter(heroEntRefComps, c => c.typeId === slotType);

        for (let i = 0; i < multiSlotComps.length; ++i) {
          const entityId = invEntRefComps[i].entityId;

          if (!entityId) {
            continue;
          }

          entityIdSlotCompMap[entityId] = multiSlotComps[i];
        }
      } else {
        const entId = _.find(heroEntRefComps, c => c.typeId === slotType).entityId;

        if (entId) {
          entityIdSlotCompMap[entId] = _.find(slotComps, sc => sc.slotType === slotType);
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

  _drawMeleeWeaponDetails(weaponEnt) {
    const weaponComp = weaponEnt.get('MeleeWeaponComponent');
    const statComps = weaponEnt.getAll('StatisticComponent');

    let str = weaponComp.toInventoryDisplayString() + Const.Char.LF;

    return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
  }

  _drawRangedWeaponDetails(weaponEnt) {
    const weaponComp = weaponEnt.get('RangedWeaponComponent');
    const statComps = weaponEnt.getAll('StatisticComponent');

    let str = weaponComp.toInventoryDisplayString() + Const.Char.LF;

    return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
  }

  _drawArmorDetails(armorEnt) {
    const armorComp = armorEnt.get('ArmorComponent');
    const statComps = armorEnt.getAll('StatisticComponent');

    let str = armorComp.toInventoryDisplayString() + Const.Char.LF;

    return _.reduce(statComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
  }

  _drawItemDetails(itemEnt) {
    const itemComp = itemEnt.get('ItemComponent');
    const statEffectComps = itemEnt.getAll('StatisticEffectComponent');

    let str = itemComp.toInventoryDisplayString() + Const.Char.LF;

    return _.reduce(statEffectComps, (s, c) => s + c.toInventoryDisplayString() + Const.Char.LF, str);
  }
}
