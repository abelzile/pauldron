import * as EntityFinders from '../entity-finders';
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import System from '../system'
import * as Const from '../const';


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

    this._initWorld();

    this._initPointer(entities);

    this._initButtons(entities);

  }

  processEntities(gameTime, entities) {

    this._drawWorld();

    this._drawPointer(entities);

    this._drawButtons(entities);

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

  _initPointer(entities) {

    const pointEnt = EntityFinders.findWorldMapPointer(entities);
    const pointerComp = pointEnt.get('WorldMapPointerComponent');
    const pointerMc = this._pixiContainer.addChild(pointerComp.movieClip);
    pointerMc.anchor.set(.5, 1);

  }

  _initButtons(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const btnEnts = EntityFinders.findWorldMapButtons(entities);
    const texts = ['Cancel', 'Travel'];
    let x = screenWidth / scale;
    let y = screenHeight / scale;

    for (const text of texts) {

      const btnEnt = _.find(btnEnts, (b) => b.get('WorldMapButtonComponent').text === text);
      const btnComp = btnEnt.get('WorldMapButtonComponent');
      const sprite = this._pixiContainer.addChild(btnComp.sprite);
      x -= sprite.width;
      y = screenHeight / scale - sprite.height;
      sprite.position.set(x, y);

    }

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

  _drawPointer(entities) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');

    const worldMapPointerEnt = EntityFinders.findWorldMapPointer(entities);
    const worldMapPointerComp = worldMapPointerEnt.get('WorldMapPointerComponent');

    let pointedToHex = worldMapPointerComp.pointedToHex;

    if (!pointedToHex) {
      pointedToHex = worldMapComp.getHexWithLevelEntityId(currentLevelEnt.id);
    }

    const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(pointedToHex.q, pointedToHex.r));

    worldMapPointerComp.movieClip.position.set(point.x, point.y);

  }

  _drawButtons(entities) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');

    const worldMapPointerEnt = EntityFinders.findWorldMapPointer(entities);
    const worldMapPointerComp = worldMapPointerEnt.get('WorldMapPointerComponent');

    let pointedToHex = worldMapPointerComp.pointedToHex;

    if (!pointedToHex) {
      pointedToHex = worldMapComp.getHexWithLevelEntityId(currentLevelEnt.id);
    }

    const worldData = worldMapComp.worldData;
    const pointedToWorldData = worldData[pointedToHex.r][pointedToHex.q];

    const btnEnts = EntityFinders.findWorldMapButtons(entities);
    const travelBtnEnt = _.find(btnEnts, e => e.get('WorldMapButtonComponent').text === Const.WorldButtonText.Travel);
    const travelBtnComp = travelBtnEnt.get('WorldMapButtonComponent');
    
    travelBtnComp.sprite.visible = pointedToWorldData.levelEntityId !== currentLevelEnt.id;

  }

}