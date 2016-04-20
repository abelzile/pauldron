import * as Const from '../const';
import Entity from '../entity';
import Pixi from 'pixi.js';
import WorldMapComponent from '../components/world-map-component';
import WorldMapPointerComponent from '../components/world-map-pointer-component';
import WorldMapButtonComponent from '../components/world-map-button-component';


export function buildWorld(width, height, imageResources) {

  const worldTexture = imageResources['world'].texture;

  const tileFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18)), // blank
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(16, 0, 16, 18))
  ];

  const worldData = [];

  for (let y = 0; y < height; ++y) {

    const worldDataRow = [];
    worldData.push(worldDataRow);

    for (let x = 0; x < width; ++x) {

      const difficulty = x + y;

      worldDataRow.push({
                          levelType: 1,
                          difficulty: difficulty,
                          levelEntityId: ''
                        });

    }

  }

  const visualLayers = [];

  const visualLayer1 = [];
  visualLayers.push(visualLayer1);

  for (let y = 0; y < height; ++y) {

    const visualLayerRow = [];
    visualLayer1.push(visualLayerRow);

    for (let x = 0; x < width; ++x) {
      visualLayerRow.push(worldData[y][x].levelType);
    }

  }

  return new Entity().add(new WorldMapComponent(worldData, visualLayers, tileFrames));

}

export function buildWorldTravelButtonEntity() {
  return new Entity().add(new WorldMapButtonComponent('Travel'));
}

export function buildWorldCancelButtonEntity() {
  return new Entity().add(new WorldMapButtonComponent('Cancel'));
}

export function buildWorldMapPointerEntity(imageResources) {

  const worldTexture = imageResources['world'].texture;

  const pointerFrames = [
    new Pixi.Texture(worldTexture, new Pixi.Rectangle(0, 0, 16, 18))
  ];

  return new Entity().add(new WorldMapPointerComponent(pointerFrames));

}