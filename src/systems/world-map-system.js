import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class WorldMapSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();
    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findWorldMapGui(entities);
    this._initWorld(gui);
    this._initHeader(gui);
    this._initButtons(gui);
    this._initPointer(gui);
  }

  unload(entities) {
    const gui = EntityFinders.findWorldMapGui(entities);
    const btns = gui.getAll('TextButtonComponent');
    for (const btn of btns) {
      btn.removeAllListeners();
    }

    const world = this._entityManager.worldEntity;
    const tiles = world.getAll('WorldMapTileComponent');
    for (const tile of tiles) {
      tile.animatedSprite.removeAllListeners();
    }
  }

  processEntities(gameTime, entities) {}

  _initWorld(gui) {
    const world = this._entityManager.worldEntity;
    const worldComp = world.get('WorldMapComponent');
    const tiles = world.getAll('WorldMapTileComponent');
    const scale = Const.ScreenScale;
    const pxSize = Const.TilePixelSize;
    const screenWidth = Const.ScreenWidth;
    const screenHeight = Const.ScreenHeight;
    const xMax = worldComp.width;
    const yMax = worldComp.height;
    const offsetX = (screenWidth / scale - (xMax * 2 - 1) * pxSize * 1.5) / 2;
    const offsetY = (screenHeight / scale - (yMax * 2 - 1) * pxSize * 1.5) / 2;

    for (const tile of tiles) {
      tile.visible = false;
    }

    for (let y = 0; y < yMax; ++y) {
      for (let x = 0; x < xMax; ++x) {
        const i = y * yMax + x;
        const tile = tiles[i];
        const animSprite = tile.animatedSprite;
        animSprite.position.set(
          x * pxSize * 1.5 + x * pxSize * 1.5 + offsetX,
          y * pxSize * 1.5 + y * pxSize * 1.5 + offsetY
        );
        animSprite.scale.set(1.5);

        if (tile.canBeVisited) {
          animSprite.gotoAndStop(1);
          animSprite.visible = true;
        } else {
          animSprite.gotoAndStop(0);
        }

        if (tile.isComplete) {
          const neighbors = [
            _.clamp((y - 1) * yMax + x, 0, tiles.length - 1),
            _.clamp((y + 1) * yMax + x, 0, tiles.length - 1),
            _.clamp(y * yMax + (x - 1), 0, tiles.length - 1),
            _.clamp(y * yMax + (x + 1), 0, tiles.length - 1)
          ];

          for (let j = 0; j < neighbors.length; ++j) {
            if (i !== neighbors[j]) {
              tiles[neighbors[j]].visible = true;
            }
          }
        }

        if (animSprite.visible) {
          animSprite.interactive = true;
          animSprite.buttonMode = true;
          animSprite.on('click', eventData => {
            this._onWorldTileMouseDown(eventData, gui, tile);
          });
        } else {
          animSprite.interactive = false;
          animSprite.buttonMode = false;
          animSprite.removeAllListeners();
        }

        this._pixiContainer.addChild(animSprite);
      }
    }
  }

  _onWorldTileMouseDown(eventData, gui, tile) {
    const pointer = gui.get('WorldMapPointerComponent');
    pointer.pointedToWorldMapTileId = tile.id;

    this._centerPointerOnTile(pointer, tile);

    const btns = gui.getAllKeyed('TextButtonComponent', 'id');
    const travelBtn = btns['travel'];

    const currLevel = this._entityManager.currentLevelEntity;

    if (currLevel) {
      travelBtn.visible = currLevel.id !== tile.levelEntityId;
    } else {
      const world = this._entityManager.worldEntity;
      const tiles = world.getAll('WorldMapTileComponent');
      travelBtn.visible = tile !== tiles[0];
    }
  }

  _centerPointerOnTile(pointer, tile) {
    pointer.position.set(
      tile.position.x - (pointer.width - tile.width) / 2,
      tile.position.y - (pointer.height - tile.height) / 2
    );
  }

  _initHeader(gui) {
    const headerComp = gui.get('ScreenHeaderComponent');
    this._pixiContainer.addChild(headerComp.headerTextComponent.sprite);

    const scale = Const.ScreenScale;
    const topOffset = 2;

    const headerTextSprite = headerComp.headerTextComponent.sprite;
    headerTextSprite.position.set((Const.ScreenWidth - headerTextSprite.textWidth * scale) / 2 / scale, topOffset);
  }

  _initButtons(gui) {
    const screenWidth = Const.ScreenWidth;
    const screenHeight = Const.ScreenHeight;
    const scale = Const.ScreenScale;

    const btnComps = gui.getAllKeyed('TextButtonComponent', 'id');
    const travelBtn = btnComps['travel'];
    travelBtn.initialize(this._pixiContainer);
    travelBtn.interactive = true;
    travelBtn.buttonMode = true;
    travelBtn.once('click', () => {
      const pointer = gui.get('WorldMapPointerComponent');
      const tile = this._getTileByWorldId(pointer.pointedToWorldMapTileId);
      tile.canBeVisited = true;
      this.emit('travel', tile.id);
    });

    const cancelBtn = btnComps['cancel'];
    cancelBtn.initialize(this._pixiContainer);
    cancelBtn.interactive = true;
    cancelBtn.buttonMode = true;
    cancelBtn.once('click', () => {
      this.emit('cancel');
    });

    travelBtn.setPosition(
      screenWidth / scale - travelBtn.width - 14 - cancelBtn.width,
      screenHeight / scale - travelBtn.height - 10
    );
    travelBtn.visible = false;
    cancelBtn.setPosition(screenWidth / scale - 12 - cancelBtn.width, screenHeight / scale - travelBtn.height - 10);
  }

  _getTileByWorldId(id) {
    return this._entityManager.worldEntity.getAll('WorldMapTileComponent').find(tile => tile.id === id);
  }

  _initPointer(gui) {
    const pointer = gui.get('WorldMapPointerComponent');
    pointer.scale.set(1.5);
    this._pixiContainer.addChild(pointer.animatedSprite);
    const world = this._entityManager.worldEntity;
    const currLevel = this._entityManager.currentLevelEntity;
    const tiles = world.getAll('WorldMapTileComponent');
    const tile = currLevel ? tiles.find(tile => tile.levelEntityId === currLevel.id) || tiles[0] : tiles[0];
    pointer.pointedToWorldMapTileId = tile.id;
    this._centerPointerOnTile(pointer, tile);
  }
}
