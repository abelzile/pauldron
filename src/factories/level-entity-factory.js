'use strict';
import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as ObjectUtils from '../utils/object-utils';
import * as Pixi from 'pixi.js';
import ArrivalComponent from '../components/arrival-component';
import BitmapTextComponent from '../components/bitmap-text-component';
import BossLevelGenerator from '../level-generators/boss-level-generator';
import BspLevelGenerator from '../level-generators/bsp-level-generator';
import ColorComponent from '../components/color-component';
import DoorsComponent from '../components/doors-component';
import Entity from '../entity';
import ExitComponent from '../components/exit-component';
import ExitDoorLock from '../level-generators/exit-door-lock';
import Factory from './factory';
import HallsComponent from '../components/halls-component';
import HotbarGuiComponent from '../components/hotbar-gui-component';
import LevelContainerComponent from '../components/level-container-component';
import LevelMobComponent from '../components/level-mob-component';
import LevelStatisticBarComponent from '../components/level-statistic-bar-component';
import LevelTextDisplayComponent from '../components/level-text-display-component';
import NameComponent from '../components/name-component';
import Rectangle from '../rectangle';
import RoomsComponent from '../components/rooms-component';
import TierComponent from '../components/tier-component';
import TileMapComponent from '../components/tile-map-component';
import ToBossExitComponent from '../components/to-boss-exit-component';
import ToVictoryExitComponent from '../components/to-victory-exit-component';
import ToWorldExitComponent from '../components/to-world-exit-component';
import Vector from '../vector';

export function buildLevelGui(imageResources) {
  const guiTexture = imageResources['gui'].texture;
  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 20, 10, 9));
  const mpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(10, 20, 10, 9));
  const moneyIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(20, 20, 10, 9));
  const levelUpStyle = { font: '16px Silkscreen', tint: Const.Color.GoodAlertYellow };
  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;

  return new Entity(Const.EntityId.LevelGui)
    .add(new BitmapTextComponent(leftDeco + ' Level Up! ' + rightDeco, levelUpStyle, 1, 'level_up'))
    .add(new BitmapTextComponent('1', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_1'))
    .add(new BitmapTextComponent('2', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_2'))
    .add(new BitmapTextComponent('3', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_3'))
    .add(new BitmapTextComponent('4', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_4'))
    .add(new BitmapTextComponent('5', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_5'))
    .add(new HotbarGuiComponent())
    .add(new LevelStatisticBarComponent(Const.Statistic.HitPoints, hpIconTexture))
    .add(new LevelStatisticBarComponent(Const.Statistic.MagicPoints, mpIconTexture))
    .add(new LevelTextDisplayComponent(moneyIconTexture, '', Const.HeaderTextStyle, 'money'));
}

export default class LevelEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildWorldLevel(worldTileData, mobTemplates, isFirstLevel, isFinalLevel, levelWidth = 100, levelHeight = 100) {
    const levelType = worldTileData.levelType;
    const tier = worldTileData.tier;
    const levelData = this.entityDict[levelType];
    const baseTexture = this.textureDict[levelType].texture;

    const dungeon = new BspLevelGenerator(levelWidth, levelHeight);
    dungeon.generate();

    const startRoom = dungeon.topLeftRoom;
    const exitRoom = dungeon.bottomRightRoom;
    const startPoint = this.getRoomCenter(startRoom);
    const exitPoint = this.getRoomCenter(exitRoom);

    const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);

    const gateways = [];

    if (isFirstLevel) {
      gateways.push(this.buildArrivalFromWorld(startPoint));
      gateways.push(this.buildExitToBoss(exitPoint, levelData.resourceName));
    } else if (isFinalLevel) {
      gateways.push(this.buildArrivalFromWorld(new Vector(startPoint.x + 1, startPoint.y)));
      gateways.push(this.buildExitToWorld(startPoint));
      gateways.push(this.buildExitToBoss(exitPoint, levelData.resourceName, true));
    } else {
      gateways.push(this.buildArrivalFromWorld(new Vector(startPoint.x + 1, startPoint.y)));
      gateways.push(this.buildExitToWorld(startPoint));
      gateways.push(this.buildExitToBoss(exitPoint, levelData.resourceName));
    }

    const prohibitedRooms = [startRoom, exitRoom];
    const sublevelExitRooms = this.getRandomRooms(levelData.subLevels.length, prohibitedRooms, dungeon);

    this.buildSubLevelExits(sublevelExitRooms, levelData.subLevels, gateways);

    const collisionLayer = [];
    const visLayer1 = [];
    const visLayer2 = [];
    const fogOfWarLayer = [];

    this.buildLevelTileLayers(
      dungeon.grid,
      startRoomFogClearRect,
      dungeon,
      levelData.searchPatterns,
      levelData.alternateIdMap,
      collisionLayer,
      visLayer1,
      visLayer2,
      fogOfWarLayer
    );

    for (const gateway of gateways) {
      if (Entity.is(gateway, 'ExitComponent')) {
        if (Entity.is(gateway, 'ToBossExitComponent')) {
          this.buildBossGateway(gateway, collisionLayer, visLayer2);
        } else {
          switch (gateway.toLevelName) {
            case 'world':
            case 'victory':
              visLayer2[gateway.y][gateway.x] = 1010;

              break;

            default:
              this.buildSublevelGateway(gateway, collisionLayer, visLayer2);

              break;
          }
        }
      }
    }

    const hostileMobs = this.placeMobs(dungeon, prohibitedRooms, collisionLayer, levelData.mobs, mobTemplates);
    const merchantMobs = [];
    merchantMobs.push(new LevelMobComponent(Const.Mob.WeaponMerchant, startPoint.x - 2, startPoint.y));
    merchantMobs.push(new LevelMobComponent(Const.Mob.ArmorMerchant, startPoint.x, startPoint.y - 2));

    ArrayUtils.append(prohibitedRooms, sublevelExitRooms);

    //continue here. determine max rooms from size of map (1% of rooms, maybe more)?
    const containers = [];
    /*for (let i = 0; i < dungeon.rooms.length; ++i) {
     const room = dungeon.rooms[i];
     if (_.includes(prohibitedRooms, room)) {
     continue;
     }
     }*/
    containers.push(
      new LevelContainerComponent(
        Const.Container.WoodChest,
        startPoint.x + 2,
        startPoint.y,
        Const.ContainerDropType.Common
      )
    );

    const visualLayers = [visLayer1, visLayer2];
    const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
    const visualLayerSprites = visualLayers.map(c => this.buildLayerSprites(spritesPerLayer));

    startRoom.explored = true;

    const roomsComp = new RoomsComponent(dungeon.rooms, startRoom, exitRoom);
    const doorsComp = new DoorsComponent(dungeon.doors);
    const hallsComp = new HallsComponent(dungeon.halls);

    return new Entity()
      .setTags('level')
      .add(new NameComponent(worldTileData.id))
      .add(new TierComponent(tier))
      .add(new ColorComponent(parseInt(levelData.backgroundColor, 16)))
      .add(
        new TileMapComponent(
          collisionLayer,
          visualLayers,
          fogOfWarLayer,
          this.buildTextureMap(levelData.frames, baseTexture),
          visualLayerSprites,
          this.buildLayerSprites(spritesPerLayer)
        )
      )
      .add(roomsComp)
      .add(doorsComp)
      .add(hallsComp)
      .addRange(hostileMobs)
      .addRange(merchantMobs)
      .addRange(gateways)
      .addRange(containers);
  }

  buildBossLevel(levelName, levelType, fromLevelName, mobTemplates, isFinalLevel) {
    const data = this.entityDict[levelType];
    const baseTexture = this.textureDict[levelType].texture;

    const dungeon = new BossLevelGenerator();
    dungeon.generate();

    const startRoom = dungeon.bottomLeftRoom;
    const startPoint = this.getRoomCenter(startRoom);
    const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);
    const exitRoom = dungeon.topLeftRoom;
    const exitPoint = this.getRoomCenter(exitRoom);

    const gateways = [];
    if (isFinalLevel) {
      gateways.push(this.buildExitToVictory(exitPoint));
    } else {
      gateways.push(this.buildExitToWorld(exitPoint, fromLevelName));
    }
    gateways.push(this.buildArrivalFromLevel(new Vector(startPoint.x, startRoom.bottom - 2), fromLevelName));

    const collisionLayer = [];
    const visLayer1 = [];
    const visLayer2 = [];
    const fogOfWarLayer = [];

    this.buildLevelTileLayers(
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

    for (const gateway of gateways) {
      if (Entity.is(gateway, 'ExitComponent')) {
        visLayer2[gateway.y][gateway.x] = 1010;
      }
    }

    const boss = this.placeBoss(startRoom, data.bossMobs);

    const visualLayers = [visLayer1, visLayer2];
    const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
    const visualLayerSprites = visualLayers.map(c => this.buildLayerSprites(spritesPerLayer));

    startRoom.explored = true;

    const roomsComp = new RoomsComponent(dungeon.rooms, startRoom, startRoom, exitRoom);
    const doorsComp = new DoorsComponent(dungeon.doors);
    const hallsComp = new HallsComponent(dungeon.halls);

    return new Entity()
      .setTags('level')
      .add(new NameComponent(levelName))
      .add(new ColorComponent(parseInt(data.backgroundColor, 16)))
      .add(
        new TileMapComponent(
          collisionLayer,
          visualLayers,
          fogOfWarLayer,
          this.buildTextureMap(data.frames, baseTexture),
          visualLayerSprites,
          this.buildLayerSprites(spritesPerLayer)
        )
      )
      .add(roomsComp)
      .add(doorsComp)
      .add(hallsComp)
      .add(boss)
      .addRange(gateways);
  }

  buildSubLevel(levelName, levelType, fromLevelName, mobTemplates, levelWidth = 200, levelHeight = 200) {
    const data = this.entityDict[levelType];
    const baseTexture = this.textureDict[levelType].texture;

    const dungeon = new BspLevelGenerator(levelWidth, levelHeight, true, false);
    dungeon.generate();

    const startRoom = dungeon.topLeftRoom;
    const startPoint = this.getRoomCenter(startRoom);
    const startRoomFogClearRect = Rectangle.inflate(startRoom, 1);

    const gateways = [];
    gateways.push(this.buildExitToLevel(startPoint, fromLevelName));
    gateways.push(this.buildArrivalFromLevel(new Vector(startPoint.x + 1, startPoint.y), fromLevelName));

    const collisionLayer = [];
    const visLayer1 = [];
    const visLayer2 = [];
    const fogOfWarLayer = [];

    this.buildLevelTileLayers(
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

    const mobs = this.placeMobs(dungeon, [startRoom], collisionLayer, data.mobs, mobTemplates);

    for (const gateway of gateways) {
      if (Entity.is(gateway, 'ExitComponent')) {
        visLayer2[gateway.y][gateway.x] = 1010;
      }
    }

    const visualLayers = [visLayer1, visLayer2];
    const spritesPerLayer = Const.ViewPortTileWidth * Const.ViewPortTileHeight;
    const visualLayerSprites = visualLayers.map(c => this.buildLayerSprites(spritesPerLayer));

    startRoom.explored = true;

    const roomsComp = new RoomsComponent(dungeon.rooms, startRoom);
    const doorsComp = new DoorsComponent(dungeon.doors);
    const hallsComp = new HallsComponent(dungeon.halls);

    return new Entity()
      .setTags('level')
      .add(new NameComponent(levelName))
      .add(new ColorComponent(parseInt(data.backgroundColor, 16)))
      .add(
        new TileMapComponent(
          collisionLayer,
          visualLayers,
          fogOfWarLayer,
          this.buildTextureMap(data.frames, baseTexture),
          visualLayerSprites,
          this.buildLayerSprites(spritesPerLayer)
        )
      )
      .add(roomsComp)
      .add(doorsComp)
      .add(hallsComp)
      .addRange(mobs)
      .addRange(gateways);
  }

  buildLayerSprites(spritesPerLayer) {
    const fogOfWarSprites = [];

    for (let i = 0; i < spritesPerLayer; ++i) {
      fogOfWarSprites[i] = new Pixi.Sprite();
    }

    return fogOfWarSprites;
  }

  getRandomRooms(maxRooms, prohibitedRooms, dungeon) {
    const randomRooms = [];
    const usedRooms = prohibitedRooms.map(room => room);

    for (let i = 0; i < maxRooms; ++i) {
      randomRooms[i] = this.getRandomRoom(dungeon, usedRooms);
      usedRooms.push(randomRooms[i]);
    }

    return randomRooms;
  }

  buildTextureMap(frames, baseTexture) {
    const textureMap = Object.create(null);

    for (const frame of frames) {
      textureMap[frame.id] = new Pixi.Texture(baseTexture, new Pixi.Rectangle(frame.x, frame.y, frame.width, frame.height));
    }

    return textureMap;
  }

  buildLevelTileLayers(
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
            const door = dungeon.doors.find(d => y === d.position.y && x === d.position.x);

            if (door) {
              collisionRow[x] = 2;
              visRow1[x] = 1;

              if (door.lock) {
                visRow2[x] = this.getLockId(door.lock);
              } else {
                visRow2[x] = 1000;
              }
            } else {
              const newVal = 1;
              const alternatives = alternateIdMap[newVal];

              visRow1[x] = newVal;
              visRow2[x] = alternatives ? ArrayUtils.selectWeighted(alternatives).id : newVal;
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

    this.replaceTileSearchPatterns(grid, searchPatterns, alternateIdMap, outVisualLayer1, outVisualLayer2);
  }

  getLockId(lock) {
    const lockType = ObjectUtils.getTypeName(lock);

    switch (lockType) {
      case 'BossDoorLock':
        return 1002;
      case 'ExitDoorLock':
        return 1003;
      default:
        throw new Error('Door lock typeName "' + lockType + '" not found.');
    }
  }

  replaceTileSearchPatterns(grid, searchPatterns, alternateIdMap, outVisualLayer1, outVisualLayer2) {
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 1; y < height - 1; ++y) {
      for (let x = 1; x < width - 1; ++x) {
        const replacementTileId = this.searchReplaceableTilePatterns(searchPatterns, outVisualLayer1, x, y);

        if (replacementTileId) {
          const alternatives = alternateIdMap[replacementTileId];
          outVisualLayer2[y][x] = alternatives ? ArrayUtils.selectWeighted(alternatives).id : replacementTileId;
        }
      }
    }
  }

  searchReplaceableTilePatterns(searchPatterns, srcArray, x0, y0) {
    for (const template of searchPatterns) {
      for (const find of template.finds) {
        let good = true;

        for (let y = y0 - 1, tempY = 0; tempY < find.length && good; ++y, ++tempY) {
          for (let x = x0 - 1, tempX = 0; tempX < find[tempY].length && good; ++x, ++tempX) {
            if (find[tempY][tempX] === -1) {
              continue;
            }
            // -1 indicates the value shouldn't be used in comparison of array equality.
            if (srcArray[y][x] !== find[tempY][tempX]) {
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

  getRoomCenter(room) {
    return new Vector(Math.floor(room.width / 2 + room.x), Math.floor(room.height / 2 + room.y));
  }

  buildSublevelGateway(gateway, outCollisionLayer, outVisualLayer) {
    this.makeGatewayAreaImpassible(gateway, outCollisionLayer);

    switch (gateway.toLevelType) {
      case 'dungeon':
        outVisualLayer[gateway.y - 1][gateway.x - 1] = 1050;
        outVisualLayer[gateway.y][gateway.x - 1] = 1051;
        outVisualLayer[gateway.y - 1][gateway.x] = 1052;
        outVisualLayer[gateway.y][gateway.x] = 1053;
        outVisualLayer[gateway.y - 1][gateway.x + 1] = 1054;
        outVisualLayer[gateway.y][gateway.x + 1] = 1055;

        break;

      case 'cave':
        outVisualLayer[gateway.y - 1][gateway.x - 1] = 1060;
        outVisualLayer[gateway.y][gateway.x - 1] = 1061;
        outVisualLayer[gateway.y - 1][gateway.x] = 1062;
        outVisualLayer[gateway.y][gateway.x] = 1063;
        outVisualLayer[gateway.y - 1][gateway.x + 1] = 1064;
        outVisualLayer[gateway.y][gateway.x + 1] = 1065;

        break;
    }

    this.buildGatewayShadow(gateway, outVisualLayer);
  }

  buildBossGateway(gateway, outCollisionLayer, outVisualLayer) {
    this.makeGatewayAreaImpassible(gateway, outCollisionLayer);

    outVisualLayer[gateway.y - 1][gateway.x - 1] = 1070;
    outVisualLayer[gateway.y][gateway.x - 1] = 1071;
    outVisualLayer[gateway.y - 1][gateway.x] = 1072;
    outVisualLayer[gateway.y][gateway.x] = 1073;
    outVisualLayer[gateway.y - 1][gateway.x + 1] = 1074;
    outVisualLayer[gateway.y][gateway.x + 1] = 1075;

    this.buildGatewayShadow(gateway, outVisualLayer);
  }

  buildGatewayShadow(gateway, outVisualLayer) {
    outVisualLayer[gateway.y][gateway.x - 2] = 1900;
    outVisualLayer[gateway.y + 1][gateway.x - 2] = 1901;
    outVisualLayer[gateway.y + 1][gateway.x - 1] = 1902;
    outVisualLayer[gateway.y + 1][gateway.x] = 1903;
    outVisualLayer[gateway.y + 1][gateway.x + 1] = 1904;
    outVisualLayer[gateway.y + 1][gateway.x + 2] = 1905;
    outVisualLayer[gateway.y][gateway.x + 2] = 1906;
  }

  makeGatewayAreaImpassible(gateway, outCollisionLayer) {
    outCollisionLayer[gateway.y - 1][gateway.x - 1] = 1;
    outCollisionLayer[gateway.y][gateway.x - 1] = 1;
    outCollisionLayer[gateway.y - 1][gateway.x] = 1;
    outCollisionLayer[gateway.y - 1][gateway.x + 1] = 1;
    outCollisionLayer[gateway.y][gateway.x + 1] = 1;
  }

  isMobPositionValid(mobTemplate, mobPosition, collisionLayer) {
    const boundingRect = Rectangle.offsetBy(mobTemplate.get('BoundingRectangleComponent').rectangle, mobPosition);
    const minX = Math.floor(boundingRect.x);
    const maxX = _.clamp(minX + Math.ceil(boundingRect.width), 0, collisionLayer[0].length - 1);
    const minY = Math.floor(boundingRect.y);
    const maxY = _.clamp(minY + Math.ceil(boundingRect.height), 0, collisionLayer.length - 1);

    let good = true;
    for (let y = minY; y <= maxY && good; ++y) {
      for (let x = minX; x <= maxX && good; ++x) {
        if (collisionLayer[y][x] !== 0) {
          good = false;
        }
      }
    }

    return good;
  }

  placeMobs(dungeon, prohibitedRooms, collisionLayer, mobTypeChoices, mobTemplates) {
    //TODO: determine mob count by room size.
    const mobs = [];
    const pos = Vector.pnew();
    let mobTemplate = null;

    for (let i = 0; i < dungeon.rooms.length; ++i) {
      const room = dungeon.rooms[i];

      if (_.includes(prohibitedRooms, room)) {
        continue;
      }

      const minY = room.y + 2;
      const maxY = room.y + room.height - 2;
      const minX = room.x + 2;
      const maxX = room.x + room.width - 2;
      let mobTypeId = null;

      do {
        mobTypeId = _.sample(mobTypeChoices).typeId;
        pos.set(_.random(minX, maxX, false), _.random(minY, maxY, false));
        mobTemplate = mobTemplates[mobTypeId];
      } while (!this.isMobPositionValid(mobTemplate, pos, collisionLayer));

      //mobs.push(new LevelMobComponent(mobTypeId, pos.x, pos.y));
      mobs.push(new LevelMobComponent(Const.Mob.BlueSlime, pos.x, pos.y));

      if (i > 1) {
        break; // JUST PLACE A FEW MOBS FOR TESTING
      }
    }

    pos.pdispose();

    return mobs;
  }

  placeBoss(bossRoom, bossMobTypeChoices) {
    if (!bossRoom) {
      throw new Error('bossRoom required.');
    }

    if (!bossMobTypeChoices || bossMobTypeChoices.length === 0) {
      throw new Error('bossMobTypeChoices array required.');
    }

    return new LevelMobComponent(
      _.sample(bossMobTypeChoices).typeId,
      bossRoom.x + bossRoom.width / 2,
      bossRoom.y + bossRoom.height / 2,
      true
    );
  }

  getRandomRoom(dungeon, prohibitedRooms) {
    let possibleRoom = null;
    let good = false;

    let TEMP_DEBUG_IDX = 0;

    do {
      possibleRoom = dungeon.rooms[++TEMP_DEBUG_IDX]; //_.sample(dungeon.rooms);
      good = true;

      for (const prohibitedRoom of prohibitedRooms) {
        if (Rectangle.equals(possibleRoom, prohibitedRoom)) {
          good = false;
          break;
        }
      }
    } while (!good);

    return possibleRoom;
  }

  buildSubLevelExits(exitRooms, possibleSubLevelTypes, outGateways) {
    let subLevelIdx = 0;

    for (const exitRoom of exitRooms) {
      const toLevelType = possibleSubLevelTypes[subLevelIdx];
      const toLevelName = toLevelType + '_' + ObjectUtils.createUuidV4();

      const roomCenter = this.getRoomCenter(exitRoom);
      outGateways.push(new ExitComponent(roomCenter, toLevelName, toLevelType));
      outGateways.push(new ArrivalComponent(new Vector(roomCenter.x, roomCenter.y + 1), toLevelName));

      subLevelIdx++;

      if (subLevelIdx >= possibleSubLevelTypes.length) {
        subLevelIdx = 0;
      }
    }
  }

  buildExitToWorld(position, levelToCompleteName = '') {
    return new ToWorldExitComponent(position, levelToCompleteName);
  }

  buildExitToVictory(position) {
    return new ToVictoryExitComponent(position);
  }

  buildExitToBoss(position, toLevelType, isFinalLevel = false) {
    const toLevelName = toLevelType + '_boss_' + ObjectUtils.createUuidV4();
    return new ToBossExitComponent(position, toLevelName, toLevelType, isFinalLevel);
  }

  buildArrivalFromWorld(position) {
    return this.buildArrivalFromLevel(position, 'world');
  }

  buildArrivalFromLevel(position, fromLevelName) {
    return new ArrivalComponent(position, fromLevelName);
  }

  buildExitToLevel(position, toLevelName) {
    return new ExitComponent(position, toLevelName);
  }
}
