import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from "../const";
import * as Pixi from 'pixi.js';
import BitmapTextComponent from '../components/bitmap-text-component';
import Bsp from '../level-generators/bsp/bsp';
import Entity from '../entity';
import GatewayComponent from '../components/gateway-component';
import HotbarGuiComponent from '../components/hotbar-gui-component';
import LevelContainerComponent from '../components/level-container-component';
import LevelItemComponent from '../components/level-item-component';
import LevelMobComponent from '../components/level-mob-component';
import LevelStatisticBarComponent from '../components/level-statistic-bar-component';
import NameComponent from '../components/name-component';
import Point from '../point';
import RandomCaveGenerator from '../level-generators/random-cave/random-cave-generator';
import RandomDungeonGenerator from '../level-generators/random-dungeon/random-dungeon-generator';
import Rectangle from '../rectangle';
import TileMapComponent from '../components/tile-map-component';
import Vector from '../vector';


export function buildLevelGui(imageResources) {

  const guiTexture = imageResources['gui'].texture;

  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 20, 10, 9));
  const mpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(10, 20, 10, 9));

  const levelUpStyle = {
    font: '16px Silkscreen',
    tint: Const.Color.GoodAlertYellow,
  };

  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;

  return new Entity()
    .add(new BitmapTextComponent(leftDeco + ' Level Up! ' + rightDeco, levelUpStyle, 1, 'level_up'))
    .add(new HotbarGuiComponent())
    .add(new LevelStatisticBarComponent(Const.Statistic.HitPoints, hpIconTexture))
    .add(new LevelStatisticBarComponent(Const.Statistic.MagicPoints, mpIconTexture))
    .setTags('level_gui')
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

function selectWeighted(items) {

  if (!items) { return null; }
  if (items.length === 0) { return null; }
  if (items.length === 1) { return items[0]; }

  let completeWeight = 0;

  for (let i = 0; i < items.length; ++i) {
    completeWeight += items[i].weight;
  }

  const r = Math.random() * completeWeight;
  let countWeight = 0.0;

  for (let i = 0; i < items.length; ++i) {

    const item = items[i];

    countWeight += item.weight;

    if (countWeight >= r) {
      return item;
    }

  }

  return null;

}

function searchReplaceableTilePatterns(searchPatterns, srcArray, x, y) {

  for (let i = 0; i < searchPatterns.length; ++i) {

    const template = searchPatterns[i];
    const finds = template.finds;

    for (let j = 0; j < finds.length; ++j) {

      const find = finds[j];
      let good = true;

      for (let yy = y - 1, tempY = 0; tempY < find.length && good; ++yy, ++tempY) {

        for (let xx = x - 1, tempX = 0; tempX < find[tempY].length && good; ++xx, ++tempX) {

          if (find[tempY][tempX] === -1) { continue; } // -1 indicates the value shouldn't be used in comparison of array equality.

          if (srcArray[yy][xx] !== find[tempY][tempX]) {
            good = false;
          }

        }

      }

      if (good) {
        return template.replace;
      }

    }

  }

  return 0;

}

function findStartPoint(dungeon) {

  let tlRoom;

  for (let i = 0; i < dungeon.rooms.length; ++i) {

    let room = dungeon.rooms[i];

    if (!tlRoom) {
      tlRoom = room;
      continue;
    }

    if (room.x < tlRoom.x && room.y < tlRoom.y) {
      tlRoom = room;
    }

  }

  const x = Math.trunc(tlRoom.width / 2) + tlRoom.x - 1;
  const y = Math.trunc(tlRoom.height / 2) + tlRoom.y - 1;

  return new Point(x, y);

}

function findEndPoint(dungeon) {

  let brRoom;

  for (let i = 0; i < dungeon.rooms.length; ++i) {

    let room = dungeon.rooms[i];

    if (!brRoom) {
      brRoom = room;
      continue;
    }

    if (room.x > brRoom.x && room.y > brRoom.y) {
      brRoom = room;
    }

  }

  const x = Math.trunc(brRoom.width / 2) + brRoom.x - 1;
  const y = Math.trunc(brRoom.height / 2) + brRoom.y - 1;

  return new Point(x, y);

}

function findRoomContaining(rooms, point) {

  for (let i = 0; i < rooms.length; ++i) {

    const room = rooms[i];

    if (room.intersectsWith(point)) {
      return room;
    }

  }

  return null;

}

function placeMobs(dungeon, startRoom, exitRoom, mobTypeChoices) {

  const mobs = [];

  for (let i = 0; i < dungeon.rooms.length; ++i) {

    const room = dungeon.rooms[i];

    if (room === startRoom || room === exitRoom) { continue; }

    const minY = room.y + 2;
    const maxY = room.y + room.height - 2;
    const minX = room.x + 2;
    const maxX = room.x + room.width - 2;

    // determine mob count by room size?

    const mobObj = _.sample(mobTypeChoices);
    const x = _.random(minX, maxX, false);
    const y = _.random(minY, maxY, false);

    mobs.push(new LevelMobComponent(mobObj.typeId, x, y));

  }

  return mobs;

}

export function buildRandomLevel(levelNum, levelResources, imageResources, isFinalLevel) {

  const resourceName = 'woodland'; // pass in. choose randomly.

  const levelTypeData = levelResources[resourceName];
  const alternateIdMap = levelTypeData.alternateIdMap;

  const dungeon = new Bsp();
  dungeon.generate();

  const startPoint = findStartPoint(dungeon);
  const startRoom = findRoomContaining(dungeon.rooms, startPoint);
  const exitPoint = findEndPoint(dungeon);
  const exitRoom = findRoomContaining(dungeon.rooms, exitPoint);
  const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);

  const collisionLayer = [];
  const visLayer1 = [];
  const visLayer2 = [];
  const fogOfWarLayer = [];

  const grid = dungeon.grid;
  const height = grid.length;
  const width = grid[0].length;

  const tempPos = new Vector();

  for (let y = 0; y < height; ++y) {

    const row = grid[y];
    const collisionRow = [];
    const visRow1 = [];
    const visRow2 = [];
    const fogRow = [];

    for (let x = 0; x < width; ++x) {

      tempPos.x = x;
      tempPos.y = y;

      const val = row[x];

      collisionRow[x] = val;

      fogRow[x] = startRoomFogClearRect.intersectsWith(tempPos) ? 0 : 2000;

      switch (val) {

        case 0: {

          const doors = dungeon.doors;

          let isDoor = false;

          for (let i = 0; i < doors.length; ++i) {

            if (y === doors[i].position.y && x === doors[i].position.x) {

              isDoor = true;

              break;

            }

          }

          if (isDoor) {

            collisionRow[x] = 2;

            visRow1[x] = 1;
            visRow2[x] = 1000;

          } else {

            const newVal = 1;
            const alternatives = alternateIdMap[newVal];

            visRow1[x] = newVal;
            visRow2[x] = alternatives ? selectWeighted(alternatives).id : newVal;

          }

          break;

        }
        case 1: {

          // Blank Tile

          visRow1[x] = 0;
          visRow2[x] = 0;

          break;

        }
        default: {

          visRow1[x] = val;
          visRow2[x] = val;

          break;

        }

      }

    }

    collisionLayer[y] = collisionRow;
    visLayer1[y] = visRow1;
    visLayer2[y] = visRow2;
    fogOfWarLayer[y] = fogRow;

  }

  const searchPatterns = levelTypeData.searchPatterns;

  for (let y = 1; y < height - 1; ++y) {

    for (let x = 1; x < width - 1; ++x) {

      const replacementTileId = searchReplaceableTilePatterns(searchPatterns, visLayer1, x, y);

      if (replacementTileId) {

        const alternatives = alternateIdMap[replacementTileId];

        visLayer2[y][x] = alternatives ? selectWeighted(alternatives).id : replacementTileId;

      }

    }

  }

  const mobs = placeMobs(dungeon, startRoom, exitRoom, levelTypeData.mobs);

  const visualLayers = [
    visLayer1,
    visLayer2
  ];

  const baseTexture = imageResources[resourceName].texture;
  const textureMap = Object.create(null);

  for (let i = 0; i < levelTypeData.frames.length; ++i) {

    const f = levelTypeData.frames[i];
    textureMap[f.id] = new Pixi.Texture(baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));

  }

  const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
  const visualLayerSprites = [];

  for (let i = 0; i < visualLayers.length; ++i) {

    const spriteLayer = [];

    for (let j = 0; j < spritesPerLayer; ++j) {
      spriteLayer[j] = new Pixi.Sprite();
    }

    visualLayerSprites[i] = spriteLayer;

  }

  const fogOfWarSprites = [];

  for (let i = 0; i < spritesPerLayer; ++i) {
    fogOfWarSprites[i] = new Pixi.Sprite();
  }

  const exitType = isFinalLevel ? 'victory' : 'world';

  return new Entity()
    .setTags('level')
    .add(new NameComponent('random ' + resourceName + ' ' + levelNum))
    .add(new TileMapComponent(collisionLayer, visualLayers, fogOfWarLayer, textureMap, visualLayerSprites, fogOfWarSprites, dungeon))
    .add(new GatewayComponent(startPoint, 'world', ''))
    .add(new GatewayComponent(exitPoint, '', exitType))
    .addRange(mobs)
    //.add(new LevelMobComponent(Const.Mob.Zombie, Math.ceil(size / 2), Math.ceil(size / 2)))
    //.add(new LevelMobComponent(Const.Mob.BlueSlime, Math.ceil(size / 2), Math.ceil(size / 2)))
    //.add(new LevelMobComponent(Const.Mob.Orc, Math.ceil(size / 2), Math.ceil(size / 2)))
    //.add(new LevelMobComponent(Const.Mob.Skeleton, Math.ceil(size / 2), Math.ceil(size / 2)))
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
