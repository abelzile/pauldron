import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import System from '../system'
import * as EntityFinders from '../entity-finders';


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

    const pointerComp = worldEnt.get('WorldMapPointerComponent');
    const pointerMc = this._pixiContainer.addChild(pointerComp.movieClip);
    pointerMc.anchor.set(.5, 1);

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const buttons = EntityFinders.findWorldMapButtons(entities);

    for (const btn of buttons) {

      const comp = btn.get('WorldMapButtonComponent');

      switch(comp.text) {

        case 'Travel':
        {
          const btn = this._pixiContainer.addChild(comp.sprite);

          const x = screenWidth / scale - btn.width;
          const y = screenHeight / scale - btn.height;

          btn.position.set(x, y);

          break;
        }

      }

    }

  }

  processEntities(gameTime, entities) {

    this._drawWorld();

    this._drawPointer();

  }

  _drawWorld() {

    const worldEnt = this._entityManager.worldEntity;
    const currentLevelEnt = this._entityManager.currentLevelEntity;

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

  _drawPointer() {

    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    const worldMapPointerComp = worldEnt.get('WorldMapPointerComponent');

    let pointedToHex = worldMapPointerComp.pointedToHex;

    if (!pointedToHex) {
      pointedToHex = worldMapComp.getHexWithLevelEntityId(currentLevelEnt.id);
    }

    const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(pointedToHex.q, pointedToHex.r));

    worldMapPointerComp.movieClip.position.set(point.x, point.y);

  }

}