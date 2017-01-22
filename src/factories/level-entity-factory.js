'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as ObjectUtils from '../utils/object-utils';
import * as Pixi from 'pixi.js';
import ArrivalComponent from '../components/arrival-component';
import BitmapTextComponent from '../components/bitmap-text-component';
import Bsp from '../level-generators/bsp/bsp';
import ColorComponent from '../components/color-component';
import Entity from '../entity';
import ExitComponent from '../components/exit-component';
import HotbarGuiComponent from '../components/hotbar-gui-component';
import LevelMobComponent from '../components/level-mob-component';
import LevelStatisticBarComponent from '../components/level-statistic-bar-component';
import NameComponent from '../components/name-component';
import Rectangle from '../rectangle';
import TileMapComponent from '../components/tile-map-component';
import Vector from '../vector';

export function buildLevelGui(imageResources) {

  const guiTexture = imageResources['gui'].texture;
  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 20, 10, 9));
  const mpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(10, 20, 10, 9));
  const levelUpStyle = { font: '16px Silkscreen', tint: Const.Color.GoodAlertYellow };
  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;

  return new Entity()
    .add(new BitmapTextComponent(leftDeco + ' Level Up! ' + rightDeco, levelUpStyle, 1, 'level_up'))
    .add(new HotbarGuiComponent())
    .add(new LevelStatisticBarComponent(Const.Statistic.HitPoints, hpIconTexture))
    .add(new LevelStatisticBarComponent(Const.Statistic.MagicPoints, mpIconTexture))
    .setTags('level_gui');

}

export function buildWorldLevel(
  levelName,
  data,
  baseTexture,
  isFirstLevel,
  isFinalLevel,
  levelWidth = 200,
  levelHeight = 200
) {

  const dungeon = new Bsp(levelWidth, levelHeight);
  dungeon.generate();

  const startRoom = dungeon.startRoom;
  const exitRoom = dungeon.bossRoom;

  const startPoint = getRoomCenter(startRoom);
  const exitPoint = getRoomCenter(exitRoom);
  const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);

  const DEBUG_EXIT_VECTOR = exitPoint;//new Vector(startPoint.x, startPoint.y + 2);

  const gateways = [];

  if (isFirstLevel) {
    gateways.push(buildArrivalFromWorld(startPoint));
    gateways.push(buildExitToWorld(/*exitPoint*/DEBUG_EXIT_VECTOR.clone(), true));
  } else if (isFinalLevel) {
    gateways.push(buildArrivalFromWorld(new Vector(startPoint.x + 1, startPoint.y)));
    gateways.push(buildExitToWorld(startPoint));
    gateways.push(buildExitToVictory(/*exitPoint*/DEBUG_EXIT_VECTOR.clone(), true));
  } else {
    gateways.push(buildArrivalFromWorld(new Vector(startPoint.x + 1, startPoint.y)));
    gateways.push(buildExitToWorld(startPoint));
    gateways.push(buildExitToWorld(/*exitPoint*/DEBUG_EXIT_VECTOR.clone(), true));
  }

  const randomRooms = getRandomRooms(data.subLevels.length, startRoom, exitRoom, dungeon);

  buildSubLevelExits(randomRooms, data.subLevels, gateways);

  const mobs = placeMobs(dungeon, [startRoom, exitRoom], data.mobs);

  const collisionLayer = [];
  const visLayer1 = [];
  const visLayer2 = [];
  const fogOfWarLayer = [];

  buildLevelTileLayers(
    dungeon.grid,
    startRoomFogClearRect,
    dungeon,
    data.searchPatterns,
    data.alternateIdMap,
    collisionLayer,
    visLayer1,
    visLayer2,
    fogOfWarLayer
  );

  for (let i = 0; i < gateways.length; ++i) {

    const gateway = gateways[i];

    if (Entity.is(gateway, 'ExitComponent')) {

      switch (gateway.toLevelName) {

        case 'world':
        case 'victory':
          visLayer2[gateway.y][gateway.x] = 1010;
          break;
        default:

          // areas around entrance are impassible.
          collisionLayer[gateway.y - 1][gateway.x - 1] = 1;
          collisionLayer[gateway.y][gateway.x - 1] = 1;
          collisionLayer[gateway.y - 1][gateway.x] = 1;
          collisionLayer[gateway.y - 1][gateway.x + 1] = 1;
          collisionLayer[gateway.y][gateway.x + 1] = 1;

          switch (gateway.toLevelType) {

            case 'dungeon':

              // gateway.
              visLayer2[gateway.y - 1][gateway.x - 1] = 1050;
              visLayer2[gateway.y][gateway.x - 1] = 1051;
              visLayer2[gateway.y - 1][gateway.x] = 1052;
              visLayer2[gateway.y][gateway.x] = 1053;
              visLayer2[gateway.y - 1][gateway.x + 1] = 1054;
              visLayer2[gateway.y][gateway.x + 1] = 1055;

              break;

            case 'cave':

              // gateway.
              visLayer2[gateway.y - 1][gateway.x - 1] = 1060;
              visLayer2[gateway.y][gateway.x - 1] = 1061;
              visLayer2[gateway.y - 1][gateway.x] = 1062;
              visLayer2[gateway.y][gateway.x] = 1063;
              visLayer2[gateway.y - 1][gateway.x + 1] = 1064;
              visLayer2[gateway.y][gateway.x + 1] = 1065;

              break;

          }

          // shadow.
          visLayer2[gateway.y][gateway.x - 2] = 1900;
          visLayer2[gateway.y + 1][gateway.x - 2] = 1901;
          visLayer2[gateway.y + 1][gateway.x - 1] = 1902;
          visLayer2[gateway.y + 1][gateway.x] = 1903;
          visLayer2[gateway.y + 1][gateway.x + 1] = 1904;
          visLayer2[gateway.y + 1][gateway.x + 2] = 1905;
          visLayer2[gateway.y][gateway.x + 2] = 1906;

          break;

      }

    }

  }

  const visualLayers = [visLayer1, visLayer2];
  const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
  const visualLayerSprites = [];

  for (let i = 0; i < visualLayers.length; ++i) {
    visualLayerSprites[i] = buildLayerSprites(spritesPerLayer);
  }

  return new Entity()
    .setTags('level')
    .add(new NameComponent(levelName))
    .add(new ColorComponent(parseInt(data.backgroundColor, 16)))
    .add(
      new TileMapComponent(
        collisionLayer,
        visualLayers,
        fogOfWarLayer,
        buildTextureMap(data.frames, baseTexture),
        visualLayerSprites,
        buildLayerSprites(spritesPerLayer),
        dungeon
      )
    )
    .addRange(mobs)
    .addRange(gateways);
}

export function buildSubLevel(
  levelName,
  fromLevelName,
  data,
  baseTexture,
  levelWidth = 200,
  levelHeight = 200
) {

  const dungeon = new Bsp(levelWidth, levelHeight);
  dungeon.generate();

  const startPoint = findStartPoint(dungeon);
  const exitPoint = findEndPoint(dungeon);
  const startRoom = findRoomContaining(dungeon.rooms, startPoint);
  const exitRoom = findRoomContaining(dungeon.rooms, exitPoint);
  const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);

  const gateways = [];
  gateways.push(buildExitToLevel(startPoint, fromLevelName));
  gateways.push(buildArrivalFromLevel(new Vector(startPoint.x + 1, startPoint.y), fromLevelName));

  const mobs = placeMobs(dungeon, [startRoom], data.mobs);

  const collisionLayer = [];
  const visLayer1 = [];
  const visLayer2 = [];
  const fogOfWarLayer = [];

  buildLevelTileLayers(
    dungeon.grid,
    startRoomFogClearRect,
    dungeon,
    data.searchPatterns,
    data.alternateIdMap,
    collisionLayer,
    visLayer1,
    visLayer2,
    fogOfWarLayer
  );

  for (let i = 0; i < gateways.length; ++i) {

    const gateway = gateways[i];

    if (Entity.is(gateway, 'ExitComponent')) {
      visLayer2[gateway.y][gateway.x] = 1010;
    }

  }

  const visualLayers = [visLayer1, visLayer2];
  const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
  const visualLayerSprites = [];

  for (let i = 0; i < visualLayers.length; ++i) {
    visualLayerSprites[i] = buildLayerSprites(spritesPerLayer);
  }

  return new Entity()
    .setTags('level')
    .add(new NameComponent(levelName))
    .add(new ColorComponent(parseInt(data.backgroundColor, 16)))
    .add(
      new TileMapComponent(
        collisionLayer,
        visualLayers,
        fogOfWarLayer,
        buildTextureMap(data.frames, baseTexture),
        visualLayerSprites,
        buildLayerSprites(spritesPerLayer),
        dungeon
      )
    )
    .addRange(mobs)
    .addRange(gateways);

}

function buildLayerSprites(spritesPerLayer) {

  const fogOfWarSprites = [];

  for (let i = 0; i < spritesPerLayer; ++i) {
    fogOfWarSprites[i] = new Pixi.Sprite();
  }

  return fogOfWarSprites;

}

function getRandomRooms(maxRooms, startRoom, exitRoom, dungeon) {

  const randomRooms = [];
  const usedRooms = [startRoom, exitRoom];

  for (let i = 0; i < maxRooms; ++i) {
    randomRooms[i] = getRandomRoom(dungeon, usedRooms);
    usedRooms.push(randomRooms[i]);
  }

  return randomRooms;

}

function buildTextureMap(frames, baseTexture) {

  const textureMap = Object.create(null);

  for (let i = 0; i < frames.length; ++i) {
    const f = frames[i];
    textureMap[f.id] = new Pixi.Texture(baseTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));
  }

  return textureMap;

}

function buildLevelTileLayers(
  grid,
  startRoomFogClearRect,
  dungeon,
  searchPatterns,
  alternateIdMap,
  outCollisionLayer,
  outVisualLayer1,
  outVisualLayer2,
  outFogOfWarLayer
) {

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

    outCollisionLayer[y] = collisionRow;
    outVisualLayer1[y] = visRow1;
    outVisualLayer2[y] = visRow2;
    outFogOfWarLayer[y] = fogRow;

  }

  replaceTileSearchPatterns(grid, searchPatterns, alternateIdMap, outVisualLayer1, outVisualLayer2);

}

function replaceTileSearchPatterns(grid, searchPatterns, alternateIdMap, outVisualLayer1, outVisualLayer2) {

  const height = grid.length;
  const width = grid[0].length;

  for (let y = 1; y < height - 1; ++y) {

    for (let x = 1; x < width - 1; ++x) {

      const replacementTileId = searchReplaceableTilePatterns(searchPatterns, outVisualLayer1, x, y);

      if (replacementTileId) {
        const alternatives = alternateIdMap[replacementTileId];
        outVisualLayer2[y][x] = alternatives ? selectWeighted(alternatives).id : replacementTileId;
      }

    }

  }

}

function selectWeighted(items) {

  if (!items) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return items[0];
  }

  let completeWeight = 0;

  for (let i = 0; i < items.length; ++i) {
    completeWeight += items[i].weight;
  }

  const r = Math.random() * completeWeight;
  let countWeight = 0;

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

          if (find[tempY][tempX] === -1) {
            continue;
          }
          // -1 indicates the value shouldn't be used in comparison of array equality.
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

function getRoomCenter(room) {
  return new Vector(Math.floor(room.width / 2 + room.x), Math.floor(room.height / 2 + room.y));
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

  return getRoomCenter(tlRoom);
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

  return getRoomCenter(brRoom);
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

function placeMobs(dungeon, prohibitedRooms, mobTypeChoices) {

  const mobs = [];

  for (let i = 0; i < dungeon.rooms.length; ++i) {

    const room = dungeon.rooms[i];

    if (_.includes(prohibitedRooms, room)) {
      continue;
    }

    const minY = room.y + 2;
    const maxY = room.y + room.height - 2;
    const minX = room.x + 2;
    const maxX = room.x + room.width - 2;

    //TODO: determine mob count by room size.
    const mobObj = _.sample(mobTypeChoices);
    const x = _.random(minX, maxX, false);
    const y = _.random(minY, maxY, false);

    mobs.push(new LevelMobComponent(mobObj.typeId, x, y));

  }

  return mobs;
}

function getRandomRoom(dungeon, prohibitedRooms) {

  let possibleRoom = null;
  let good = false;

  let TEMP_DEBUG_IDX = 0;

  do {
    possibleRoom = dungeon.rooms[++TEMP_DEBUG_IDX]//_.sample(dungeon.rooms);
    good = true;

    for (let i = 0; i < prohibitedRooms.length; ++i) {
      if (Rectangle.equals(possibleRoom, prohibitedRooms[i])) {
        good = false;
        break;
      }
    }
  } while (!good);

  return possibleRoom;

}

function buildSubLevelExits(exitRooms, possibleSubLevelTypes, outGateways) {

  let subLevelIdx = 0;

  for (let i = 0; i < exitRooms.length; ++i) {

    const exitRoom = exitRooms[i];
    const toLevelType = possibleSubLevelTypes[subLevelIdx];
    const toLevelName = toLevelType + '_' + ObjectUtils.createUuidV4();

    const roomCenter = getRoomCenter(exitRoom);
    outGateways.push(new ExitComponent(roomCenter, toLevelName, toLevelType));
    outGateways.push(new ArrivalComponent(new Vector(roomCenter.x, roomCenter.y + 1), toLevelName));

    subLevelIdx++;

    if (subLevelIdx >= possibleSubLevelTypes.length) {
      subLevelIdx = 0;
    }

  }

}

function buildExitToWorld(position, isLevelCompletion) {
  return new ExitComponent(position, 'world', undefined, isLevelCompletion);
}

function buildExitToVictory(position) {
  return new ExitComponent(position, 'victory', undefined, true);
}

function buildArrivalFromWorld(position) {
  return buildArrivalFromLevel(position, 'world');
}

function buildArrivalFromLevel(position, fromLevelName) {
  return new ArrivalComponent(position, fromLevelName);
}

function buildExitToLevel(position, toLevelName) {
  return new ExitComponent(position, toLevelName);
}

