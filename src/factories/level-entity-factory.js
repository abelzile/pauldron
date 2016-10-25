import * as ArrayUtils from '../utils/array-utils';
import * as Const from "../const";
import _ from 'lodash';
import Entity from '../entity';
import GatewayComponent from '../components/gateway-component';
import HotbarGuiComponent from '../components/hotbar-gui-component';
import LevelContainerComponent from '../components/level-container-component';
import LevelItemComponent from '../components/level-item-component';
import LevelMobComponent from '../components/level-mob-component';
import LevelStatisticBarComponent from '../components/level-statistic-bar-component';
import NameComponent from '../components/name-component';
import Pixi from 'pixi.js';
import Point from '../point';
import RandomCaveGenerator from '../level-generators/random-cave/random-cave-generator';
import RandomDungeonGenerator from '../level-generators/random-dungeon/random-dungeon-generator';
import TileMapComponent from '../components/tile-map-component';


export function buildLevelGui(imageResources) {

  const guiTexture = imageResources['gui'].texture;

  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 20, 10, 9));
  const mpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(10, 20, 10, 9));

  return new Entity()
    .add(new LevelStatisticBarComponent(Const.Statistic.HitPoints, hpIconTexture))
    .add(new LevelStatisticBarComponent(Const.Statistic.MagicPoints, mpIconTexture))
    .add(new HotbarGuiComponent())
    ;

}

export function buildLevelEntity(levelNum, levelResources, imageResources) {

  const levelData = levelResources['level_' + levelNum];

  const resourceName = levelData['resourceName'].replace('-', '_');

  const terrainData = levelResources[resourceName];
  const imageTexture = imageResources[resourceName].texture;

  const collisionLayer = levelData.collisionLayer;
  const visualLayers = _.map(levelData['visualLayers'], (visualLayer) => visualLayer);
  const frames = _.map(terrainData.frames,
                       (frame) => {
                         return new Pixi.Texture(imageTexture, new Pixi.Rectangle(frame.x, frame.y, frame.width, frame.height));
                       });

  const levelEntity = new Entity()
    .setTags('level')
    .add(new NameComponent(levelData.name))
    .add(new TileMapComponent(collisionLayer, visualLayers, frames))
    ;

  if (levelData['gateways']) {
    for (const gateway of levelData['gateways']) {
      levelEntity.add(new GatewayComponent(new Point(gateway.x, gateway.y), gateway.fromLevelName, gateway.toLevelName));
    }
  }

  if (levelData['mobs']) {
    for (const mob of levelData['mobs']) {
      levelEntity.add(new LevelMobComponent(mob.typeId, mob.x, mob.y));
    }
  }

  if (levelData['containers']) {
    for (const container of levelData['containers']) {
      levelEntity.add(new LevelContainerComponent(container.typeId, container.x, container.y));
    }
  }

  if (levelData['items']) {
    for (const item of levelData['items']) {
      levelEntity.add(new LevelItemComponent(item.typeId, item.x, item.y));
    }
  }

  return levelEntity;

}

export function buildRandomLevel(levelNum, levelResources, imageResources, isFinalLevel) {

  const resourceName = 'woodland'; // choose at random.

  const terrainData = levelResources[resourceName];
  const imageTexture = imageResources[resourceName].texture;
  const frames = _.map(terrainData.frames,
                       f => {
                         const t = new Pixi.Texture(imageTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));
                         t.textureName = f.name;
                         return t;
                       });

  const size = _.random(64, 80);
  const entryFromWorldPoint = new Point(2, 2);
  const exitToWorldPoint = new Point(size - 2, size - 2);

  const collisionLayer = ArrayUtils.create2d(size, size, 0);

  const visualLayers = [
    ArrayUtils.create2d(size, size, 1),
    ArrayUtils.create2d(size, size, 0)
  ];

  visualLayers[1][exitToWorldPoint.y][exitToWorldPoint.x] = _.findIndex(frames, f => f.textureName === 'road_sign');

  const exitType = isFinalLevel ? 'victory' : 'world';

  return new Entity()
    .setTags('level')
    .add(new NameComponent('random ' + resourceName + ' ' + levelNum))
    .add(new TileMapComponent(collisionLayer, visualLayers, frames))
    .add(new GatewayComponent(entryFromWorldPoint, 'world', ''))
    .add(new GatewayComponent(exitToWorldPoint, '', exitType))
    //.add(new LevelMobComponent(Const.Mob.Zombie, Math.ceil(size / 2), Math.ceil(size / 2)))
    //.add(new LevelMobComponent(Const.Mob.BlueSlime, Math.ceil(size / 2), Math.ceil(size / 2)))
    //.add(new LevelMobComponent(Const.Mob.Orc, Math.ceil(size / 2), Math.ceil(size / 2)))
    .add(new LevelMobComponent(Const.Mob.Skeleton, Math.ceil(size / 2), Math.ceil(size / 2)))
    ;

}

export function buildDungeonEntity(gatewayComponent, levelResources, imageResources) {

  const levelData = levelResources['dungeon_level'];

  const dungeon = new RandomDungeonGenerator();
  dungeon.generate();

  const dungeonEntity = new Entity()
          .setTags('level')
    .add(new NameComponent(gatewayComponent.toLevelName))
    .add(TileMapComponent.buildFromRandomDungeonGenerator(dungeon, gatewayComponent.toLevelName, levelResources, imageResources))
    .add(new GatewayComponent(dungeon.entrancePos, gatewayComponent.fromLevelName, gatewayComponent.fromLevelName))
    ;

  const possibleRandomMobTypeIds = levelData['randomMobTypeIds'];

  for (const room of dungeon.rooms) {

    if (room === dungeon.entranceRoom) { continue; }

    const mobCount = 1; //TODO:determine based on room size.

    for (let i = 0; i < mobCount; ++i) {

      const startX = _.random(room.left, room.right - 1, false);
      const startY = _.random(room.top, room.bottom - 1, false);
      const mobTypeId = possibleRandomMobTypeIds[_.random(0, possibleRandomMobTypeIds.length - 1, false)];

      dungeonEntity.add(new LevelMobComponent(mobTypeId, startX, startY));

    }

  }

  return dungeonEntity;

}

export function buildCaveEntity(gatewayComponent, levelResources, imageResources) {

  const levelData = levelResources['cave_level'];

  const cave = new RandomCaveGenerator();
  cave.generate();

  //TODO: generate random mobs from list of allowed.
  // - use cave size to determine count.
  // - probably use hero level to determine types.

  return new Entity()
    .setTags('level')
    .add(new NameComponent(gatewayComponent.toLevelName))
    .add(TileMapComponent.buildFromRandomCaveGenerator(cave, gatewayComponent.toLevelName, levelResources, imageResources))
    .add(new GatewayComponent(cave.entrancePos, gatewayComponent.fromLevelName, gatewayComponent.fromLevelName))
    ;

}
