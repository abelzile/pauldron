import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import System from '../system';


export default class InventoryRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this.RowCount = 7;
    this.ColCount = 14;
    this.SlotSize = 70;
    this.SlotMarginH = 16;
    this.SlotMarginV = 18;
    this.LabelOffset = 17;

    this.BorderColor = Const.Color.White;
    this.SlotBackgroundColor = Const.Color.DarkDarkBlueGray;

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

    const itemTextSprite = this._pixiContainer.addChild(inventoryEnt.get('InventoryItemTextComponent').sprite);
    itemTextSprite.style = { font: '16px "silkscreennormal"', fill: '#ffffff' };
    itemTextSprite.scale.set(0.3333333333333333);

    for (const inventorySlotComp of inventoryEnt.getAll('InventorySlotComponent')) {
      this._pixiContainer.addChild(inventorySlotComp.labelSprite, inventorySlotComp.slotGraphics);
    }

    this._drawLayout(inventoryEnt);

    this._initItems(heroEnt, inventoryEnt, entities);

  }

  processEntities(gameTime, entities) {

    const inventoryEnt = EntityFinders.findInventory(entities);
    const heroEnt = this._entityManager.heroEntity;

    this._drawCharacterDetails(heroEnt, inventoryEnt, entities);

    this._drawCurrentItemDetails(inventoryEnt, entities);

  }

  unload(entities, levelScreen) {
  }

  _drawCharacterDetails(heroEnt, inventoryEnt, entities) {

    const currValueHash = {};
    const maxValueHash = {};

    const statComps = heroEnt.getAll('StatisticComponent');

    for (const statComp of statComps) {

      if (currValueHash[statComp.name]) {
        currValueHash[statComp.name] += statComp.currentValue;
        maxValueHash[statComp.name] += statComp.maxValue;
      } else {
        currValueHash[statComp.name] = statComp.currentValue;
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

    const curEntRefComp = inventoryEnt.get('InventoryCurrentEntityReferenceComponent');
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

  _drawLayout(inventoryEnt) {

    const scale = this._renderer.globalScale;

    const grid = this._buildLayoutGrid();

    inventoryEnt.get('InventoryHeroTextComponent')
                .sprite
                .position.set(grid[0][0].x / scale, grid[3][0].y / scale);

    inventoryEnt.get('InventoryItemTextComponent')
                .sprite
                .position.set(grid[0][10].x / scale, grid[0][10].y / scale);

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

        slot.labelSprite.visible = (i === 0);

        ++i;

      }

    }

    const hotbarSlots = _.filter(slotComps, sc => sc.slotType === Const.InventorySlot.Hotbar);

    i = 0;

    for (let x = 5; x < 10; ++x) {

      const slot = hotbarSlots[i];
      this._drawSlot(slot, grid[6][x]);

      slot.labelSprite.visible = (i === 0);

      ++i;

    }

  }

  _drawSlot(slotComp, val) {

    const scale = this._renderer.globalScale;
    this._drawSlotBorder(slotComp, val.x / scale, val.y / scale, this.SlotSize / scale);
    this._drawSlotLabel(slotComp, val.x / scale, (val.y - this.LabelOffset) / scale);

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

  _buildLayoutGrid() {

    const gridStartX = (this._renderer.width - (((this.SlotSize + this.SlotMarginH) * this.ColCount) - this.SlotMarginH)) / 2;
    const gridStartY = (this._renderer.height - (((this.SlotSize + this.SlotMarginV) * this.RowCount) - this.SlotMarginV)) / 2;

    let startY = gridStartY;
    const grid = [];

    for (let y = 0; y < this.RowCount; ++y) {

      const row = [];

      let startX = gridStartX;

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

    let str = weaponComp.toDisplayString() + '\n';
    str = _.reduce(statComps, (s, c) => s + c.toDisplayString() + '\n', str);

    return str;

  }

  _drawRangedWeaponDetails(weaponEnt) {

    const weaponComp = weaponEnt.get('RangedWeaponComponent');
    const statComps = weaponEnt.getAll('StatisticComponent');

    let str = weaponComp.toDisplayString() + '\n';
    str = _.reduce(statComps, (s, c) => s + c.toDisplayString() + '\n', str);

    return str;
    
  }

  _drawArmorDetails(armorEnt) {

    const armorComp = armorEnt.get('ArmorComponent');
    const statComps = armorEnt.getAll('StatisticComponent');

    let str = armorComp.toDisplayString() + '\n';
    str = _.reduce(statComps, (s, c) => s + c.toDisplayString() + '\n', str);

    return str;

  }

  _drawItemDetails(itemEnt) {

    const itemComp = itemEnt.get('ItemComponent');
    const statEffectComps = itemEnt.getAll('StatisticEffectComponent');

    let str = itemComp.toDisplayString() + '\n';
    str = _.reduce(statEffectComps, (s, c) => s + c.toDisplayString() + '\n', str);

    return str;

  }

}