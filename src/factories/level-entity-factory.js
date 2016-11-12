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
import Bsp from '../level-generators/bsp/bsp';



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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function selectWeighted(items) {

  if (!items) { return null; }
  if (items.length === 0) { return null; }
  if (items.length === 1) { return items[0]; }

  let completeWeight = 0;

  for (let i = 0; i < items.length; ++i) {
    completeWeight += items[i].weight;
  }

  let r = Math.random() * completeWeight;
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

function doThingy(srcArray, x, y) {

  const templates = [
    {
      finds: [
        [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1],
        ],
        [
          [-1, 0, 0],
          [-1, 0, 1],
          [-1, 0, 1],
        ],
        [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 0],
        ]
      ],
      replace: 53
    },
    {
      finds: [
        [
          [1, 0, -1],
          [1, 0, -1],
          [1, 0, -1],
        ],
        [
          [0, 0, -1],
          [1, 0, -1],
          [1, 0, -1],
        ],
        [
          [1, 0, -1],
          [1, 0, -1],
          [0, 0, -1],
        ]
      ],
      replace: 52
    },
    {
      finds: [
        [
          [-1, -1, -1],
          [0, 0, 0],
          [1, 1, 1],
        ],
        [
          [-1, -1, -1],
          [0, 0, 0],
          [0, 1, 1],
        ],
        [
          [-1, -1, -1],
          [0, 0, 0],
          [1, 1, 0],
        ],
      ],
      replace: 50
    },
    {
      finds: [
        [
          [1, 1, 1],
          [0, 0, 0],
          [-1, -1, -1],
        ],
        [
          [0, 1, 1],
          [0, 0, 0],
          [-1, -1, -1],
        ],
        [
          [1, 1, 0],
          [0, 0, 0],
          [-1, -1, -1],
        ],
      ],
      replace: 51
    },
    {
      finds: [
        [
          [1, 1, 1],
          [1, 0, 0],
          [1, 0, -1],
        ]
      ],
      replace: 100
    },
    {
      finds: [
        [
          [1, 1, 1],
          [0, 0, 1],
          [-1, 0, 1],
        ]
      ],
      replace: 120
    },
    {
      finds: [
        [
          [1, 0, -1],
          [1, 0, 0],
          [1, 1, 1],
        ]
      ],
      replace: 140
    },
    {
      finds: [
        [
          [-1, 0, 1],
          [0, 0, 1],
          [1, 1, 1],
        ]
      ],
      replace: 160
    },
    {
      finds: [
        [
          [-1, -1, -1],
          [-1, 0, 0],
          [-1, 0, 1],
        ]
      ],
      replace: 200
    },
    {
      finds: [
        [
          [-1, -1, -1],
          [0, 0, -1],
          [1, 0, -1],
        ]
      ],
      replace: 220
    },
    {
      finds: [
        [
          [-1, 0, 1],
          [-1, 0, 0],
          [-1, -1, -1],
        ]
      ],
      replace: 240
    },
    {
      finds: [
        [
          [1, 0, -1],
          [0, 0, -1],
          [-1, -1, -1],
        ]
      ],
      replace: 260
    },
  ];

  for (let i = 0; i < templates.length; ++i) {

    const template = templates[i];
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

export function buildRandomLevel(levelNum, levelResources, imageResources, isFinalLevel) {

  const resourceName = 'woodland'; // choose at random.

  const terrainData = levelResources[resourceName];
  const tileNumFrameMap = terrainData.tileNumFrameMap;
  const tileNumAlternateMap = terrainData.tileNumAlternateMap;

  const imageTexture = imageResources[resourceName].texture;
  const textures = _.map(terrainData.frames, f => {
                      const t = new Pixi.Texture(imageTexture, new Pixi.Rectangle(f.x, f.y, f.width, f.height));
                      t.textureName = f.name;
                      return t;
                    });
  const textureDict = _.keyBy(textures, f => f.textureName);

  var algo = new Bsp();
  algo.generate();

  const collisionLayer = [];
  const visLayer1 = [];
  const visLayer2 = [];

  const height = algo.grid.length;
  const width = algo.grid[0].length;

  for (let y = 0; y < height; ++y) {

    const row = algo.grid[y];
    const collisionRow = [];
    const visRow1 = [];
    const visRow2 = [];

    for (let x = 0; x < width; ++x) {

      const val = row[x];

      collisionRow.push(val);

      switch (val) {

        case 0: {

          // Walking Tile

          const newVal = 1;

          // plain tiles
          visRow1[x] = newVal;

          // decorative tiles
          const alternatives = tileNumAlternateMap[newVal];

          if (alternatives) {
            visRow2[x] = selectWeighted(alternatives).tileNum;
          } else {
            visRow2[x] = newVal;
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

  }

  for (let y = 1; y < height - 1; ++y) {

    for (let x = 1; x < width - 1; ++x) {

      const doThingy2 = doThingy(visLayer1, x, y);

      if (doThingy2) {
        visLayer2[y][x] = doThingy2;
      }


    }

  }

  const entryFromWorldPoint = new Point(7, 7);
  const exitToWorldPoint = new Point(algo.width - 7, algo.height - 7);

  const visualLayers = [];
  visualLayers[0] = visLayer1;
  visualLayers[1] = visLayer2;
  //FIX
  //visualLayers[0][exitToWorldPoint.y][exitToWorldPoint.x] = _.findIndex(textures, f => f.textureName === 'road_sign');

  const spriteLayers = [];

  for (let i = 0; i < visualLayers.length; ++i) {

    const visLayer = visualLayers[i];
    const spriteLayer = [];

    for (let y = 0; y < visLayer.length; ++y) {

      const spriteRow = [];

      for (let x = 0; x < visLayer[y].length; ++x) {

        let tileNum = visLayer[y][x];

        const textureName = tileNumFrameMap[tileNum];

        spriteRow[x] = new Pixi.Sprite(textureDict[textureName]);

      }

      spriteLayer[y] = spriteRow;

    }

    spriteLayers[i] = spriteLayer;

  }

  const exitType = isFinalLevel ? 'victory' : 'world';

  return new Entity()
    .setTags('level')
    .add(new NameComponent('random ' + resourceName + ' ' + levelNum))
    .add(new TileMapComponent(collisionLayer, visualLayers, textures, spriteLayers))
    .add(new GatewayComponent(entryFromWorldPoint, 'world', ''))
    .add(new GatewayComponent(exitToWorldPoint, '', exitType))
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
