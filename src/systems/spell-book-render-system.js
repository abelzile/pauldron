import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import System from '../system';


export default class SpellBookRenderSystem extends System {

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

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const spellBookEnt = EntityFinders.findSpellBook(entities);
    const heroEnt = this._entityManager.heroEntity;

    const marginX = (screenWidth - ((this.SlotSize + this.SlotMarginH) * this.ColCount - this.SlotMarginH)) / 2;
    const marginY = (screenHeight - ((this.SlotSize + this.SlotMarginV) * this.RowCount - this.SlotMarginV)) / 2;

    this._pixiContainer.addChild(spellBookEnt.get('SpellBookBackgroundComponent').graphics);

    const dialogHeaderComp = spellBookEnt.get('DialogHeaderComponent');
    this._pixiContainer.addChild(dialogHeaderComp.headerTextComponent.sprite);
    this._pixiContainer.addChild(dialogHeaderComp.closeButtonMcComponent.movieClip);

    for (const spellBookSlotComp of spellBookEnt.getAll('SpellBookSlotComponent')) {
      this._pixiContainer.addChild(spellBookSlotComp.labelSprite, spellBookSlotComp.slotGraphics);
    }

    this._drawHeader(dialogHeaderComp);

    this._drawLayout(spellBookEnt, marginX, marginY);

    this._initItems(heroEnt, spellBookEnt, entities);

  }

  processEntities(gameTime, entities) {

  }

  unload(entities, levelScreen) {
  }

  _drawHeader(dialogHeaderComp) {

    const screenWidth = this._renderer.width;
    const scale = this._renderer.globalScale;

    const topOffset = 2;

    const headerTextSprite = dialogHeaderComp.headerTextComponent.sprite;
    headerTextSprite.position.set((screenWidth - (headerTextSprite.textWidth * scale)) / 2 / scale, topOffset);

    const closeBtnMc = dialogHeaderComp.closeButtonMcComponent.movieClip;
    closeBtnMc.position.set(((screenWidth - (closeBtnMc.width * scale)) / scale) - 2, topOffset);

  }

  _drawLayout(spellBookEnt, marginX, marginY) {

    const scale = this._renderer.globalScale;

    const grid = this._buildLayoutGrid(marginX, marginY);

    /*spellBookEnt.get('InventoryHeroTextComponent')
                .sprite
                .position.set(grid[0][0].x / scale, grid[3][0].y / scale);

    spellBookEnt.get('InventoryItemTextComponent')
                .sprite
                .position.set(grid[0][10].x / scale, grid[0][10].y / scale);*/

    const slotComps = spellBookEnt.getAll('SpellBookSlotComponent');

    const gridSlotHash = Object.create(null);
    gridSlotHash[Const.MagicSpellSlot.Memory] = grid[1][1];
    gridSlotHash[Const.MagicSpellSlot.Erase] = grid[6][13];

    _.forOwn(gridSlotHash, (val, key) => {
      this._drawSlot(_.find(slotComps, sc => sc.slotType === key), val);
    });

    const spellBookSlots = _.filter(slotComps, sc => sc.slotType === Const.MagicSpellSlot.SpellBook);

    let i = 0;

    for (let y = 0; y < 5; ++y) {

      for (let x = 5; x < 10; ++x) {

        const slot = spellBookSlots[i];
        this._drawSlot(slot, grid[y][x]);

        slot.labelSprite.visible = (i === 0);

        ++i;

      }

    }

    /*const hotbarSlots = _.filter(slotComps, sc => sc.slotType === Const.MagicSpellSlot.Hotbar);

    i = 0;

    for (let x = 5; x < 10; ++x) {

      const slot = hotbarSlots[i];
      this._drawSlot(slot, grid[6][x]);

      slot.labelSprite.visible = (i === 0);

      ++i;

    }*/

  }

  _buildLayoutGrid(marginX, marginY) {

    marginY += 5 * this._renderer.globalScale; // add some arbitrary top margin for looks.

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

    const scale = this._renderer.globalScale;
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

  _initItems(heroEntity, spellBookEntity, entities) {

    const entityIdSlotCompMap = Object.create(null);

    const slotComps = spellBookEntity.getAll('SpellBookSlotComponent');
    const heroEntRefComps = heroEntity.getAll('EntityReferenceComponent');

    for (const slotType of _.values(Const.MagicSpellSlot)) {

      if (slotType === Const.MagicSpellSlot.SpellBook /*|| slotType === Const.InventorySlot.Hotbar*/) {

        const multiSlotComps = _.filter(slotComps, sc => sc.slotType === slotType);
        const sbEntRefComps = _.filter(heroEntRefComps, c => c.typeId === slotType);

        for (let i = 0; i < multiSlotComps.length; ++i) {

          const entId = sbEntRefComps[i].entityId;

          if (!entId) { continue; }

          entityIdSlotCompMap[entId] = multiSlotComps[i];

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
    sprite.anchor.set(0.5);
    sprite.position.x = slotComp.position.x + (slotComp.slotGraphics.width / 2);
    sprite.position.y = slotComp.position.y + (slotComp.slotGraphics.height / 2);

  }

}