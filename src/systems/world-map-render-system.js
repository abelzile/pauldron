import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import System from '../system'


export default class WorldMapRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager, hexLayout) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._hexLayout = hexLayout;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const headerComp = EntityFinders.findWorldMapGui(entities).get('ScreenHeaderComponent');
    this._pixiContainer.addChild(headerComp.headerTextComponent.sprite);

    this._drawHeader(headerComp);

    this._initWorld();

    this._initGui(entities);

  }

  processEntities(gameTime, entities) {

    this._drawWorld();

    this._drawGui(entities);

  }

  _initWorld() {

    var worldEnt = this._entityManager.worldEntity;

    for (const layer of worldEnt.get('WorldMapComponent').spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const sprite = this._pixiContainer.addChild(row[x]);
          sprite.anchor.set(.5, .5); // hex calculations are made from center of hex.

        }

      }

    }

  }

  _initGui(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const gui = EntityFinders.findWorldMapGui(entities);

    const pointerComp = gui.get('WorldMapPointerComponent');
    const pointerMc = this._pixiContainer.addChild(pointerComp.AnimatedSprite);
    pointerMc.anchor.set(.5, 1);

    const btnComps = gui.getAllKeyed('TextButtonComponent', 'id');

    const travelBtn = btnComps['travel'];
    travelBtn.initialize(this._pixiContainer);

    const cancelBtn = btnComps['cancel'];
    cancelBtn.initialize(this._pixiContainer);

    travelBtn.setPosition(screenWidth / scale - travelBtn.width - 14 - cancelBtn.width, screenHeight / scale - travelBtn.height - 10);
    cancelBtn.setPosition(screenWidth / scale - 12 - cancelBtn.width, screenHeight / scale - travelBtn.height - 10)

  }

  _drawHeader(headerComp) {

    const screenWidth = this._renderer.width;
    const scale = this._renderer.globalScale;

    const topOffset = 2;

    const headerTextSprite = headerComp.headerTextComponent.sprite;
    headerTextSprite.position.set((screenWidth - (headerTextSprite.textWidth * scale)) / 2 / scale, topOffset);

  }

  _drawWorld() {

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');

    for (const layer of worldMapComp.spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(x, y));

          const sprite = row[x];
          sprite.position.set(point.x, point.y);

        }

      }

    }

  }

  _drawGui(entities) {

    const gui = EntityFinders.findWorldMapGui(entities);

    const pointerComp = gui.get('WorldMapPointerComponent');

    const pointedToHex = this._getPointedToHex(pointerComp);
    const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(pointedToHex.q, pointedToHex.r));

    pointerComp.AnimatedSprite.position.set(point.x, point.y);

    const em = this._entityManager;
    const worldEnt = em.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    const pointedToWorldData = worldMapComp.worldData[pointedToHex.r][pointedToHex.q];

    const btnComps = gui.getAll('TextButtonComponent');
    const travelBtnComp = _.find(btnComps, c => c.id === 'travel');
    travelBtnComp.visible = pointedToWorldData.levelEntityId !== em.currentLevelEntity.id;

  }

  _getPointedToHex(worldMapPointerComp) {

    const em = this._entityManager;
    const currentLevelEnt = em.currentLevelEntity;
    const worldEnt = em.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    let pointedToHex = worldMapPointerComp.pointedToHex;

    if (!pointedToHex) {
      pointedToHex = worldMapComp.getHexWithLevelEntityId(currentLevelEnt.id);
    }

    return pointedToHex;

  }

}