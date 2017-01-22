import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';
import Vector from '../vector';
import DialogRenderSystem from './dialog-render-system';

export default class LevelMapRenderSystem extends DialogRenderSystem {

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

    const levelMapGui = EntityFinders.findLevelMapGui(entities);

    this.drawDialogHeader(levelMapGui.get('DialogHeaderComponent'));

    const currentLevel = this._entityManager.currentLevelEntity;
    const tileMap = currentLevel.get('TileMapComponent');
    const collisionLayer = tileMap.collisionLayer;
    const graphics = levelMapGui.get('GraphicsComponent');
    const height = collisionLayer.length;
    const width = collisionLayer[0].length;
    const centerScreen = Vector.pnew(
      (Const.ScreenWidth / Const.ScreenScale - width) / 2,
      (Const.ScreenHeight / Const.ScreenScale - height) / 2
    );

    const rooms = _.filter(tileMap.rooms, r => r.explored);
    const halls = _.filter(tileMap.hallways, r => r.explored);

    const exitPositions = _
      .chain(this._entityManager.currentLevelEntity.getAll('ExitComponent'))
      .map(c => c.position)
      .filter(p => {
        for (let i = 0; i < rooms.length; ++i) {
          if (rooms[i].intersectsWith(p)) {
            return true;
          }
        }
        return false;
      })
      .value();

    const mobPositions = _
      .chain(EntityFinders.findMobs(entities))
      .map(c => c.get('PositionComponent').position)
      .filter(p => {
        for (let i = 0; i < rooms.length; ++i) {
          if (rooms[i].intersectsWith(p)) {
            return true;
          }
        }
        for (let i = 0; i < halls.length; ++i) {
          if (halls[i].intersectsWith(p)) {
            return true;
          }
        }
        return false;
      })
      .value();

    const doors = _
      .chain(tileMap.doors)
      .filter(d => {
        if (d.room.explored || d.hall.explored) {
          return !d.open;
        }
        return false;
      })
      .map(d => d.position)
      .value();

    const heroPos = this._entityManager.heroEntity.get('PositionComponent').position;

    const g = graphics.graphics.clear();
    this._drawRects(g, rooms, centerScreen, Const.Color.LevelMapLightBrown);
    this._drawRects(g, halls, centerScreen, Const.Color.LevelMapLightBrown);
    this._drawPoints(g, doors, centerScreen, Const.Color.LevelMapLightLightBrown, 1);
    this._drawExits(g, exitPositions, centerScreen, Const.Color.LevelMapDarkBrown);
    this._drawMarkers(g, mobPositions, centerScreen, Const.Color.LevelMapMobLightRed, Const.Color.LevelMapMobDarkRed);
    this._drawMarker(g, heroPos, centerScreen, Const.Color.LevelMapHeroLightGreen, Const.Color.LevelMapHeroDarkGreen);
    g.endFill();

    this._pixiContainer.addChild(g);

    centerScreen.pdispose();

  }

  processEntities(gameTime, entities, input) {
  }

  _drawRects(g, rects, centerScreen, color) {

    g.beginFill(color);

    for (let i = 0; i < rects.length; ++i) {
      const room = rects[i];
      g.drawRect(room.x + centerScreen.x, room.y + centerScreen.y, room.width, room.height);
    }

  }

  _drawPoints(g, points, centerScreen, color, size) {

    g.beginFill(color);

    for (let i = 0; i < points.length; ++i) {
      const point = points[i];
      g.drawRect(point.x + centerScreen.x, point.y + centerScreen.y, size, size);
    }

  }

  _drawMarker(g, point, centerScreen, lightColor, darkColor) {
    g
      .beginFill(lightColor)
      .drawRect(point.x + centerScreen.x, point.y + centerScreen.y, 1, 1)
      .beginFill(darkColor)
      .drawRect(point.x - 1 + centerScreen.x, point.y + centerScreen.y, 1, 1)
      .drawRect(point.x + 1 + centerScreen.x, point.y + centerScreen.y, 1, 1)
      .drawRect(point.x + centerScreen.x, point.y - 1 + centerScreen.y, 1, 1)
      .drawRect(point.x + centerScreen.x, point.y + 1 + centerScreen.y, 1, 1);
  }

  _drawMarkers(g, points, centerScreen, lightColor, darkColor) {
    for (let i = 0; i < points.length; ++i) {
      this._drawMarker(g, points[i], centerScreen, lightColor, darkColor);
    }
  }

  _drawExits(g, exitPositions, centerScreen, color) {

    g.beginFill(color);

    for (let i = 0; i < exitPositions.length; ++i) {
      const position = exitPositions[i];
      g
        .drawRect(position.x - 1 + centerScreen.x, position.y + centerScreen.y, 1, 1)
        .drawRect(position.x + 1 + centerScreen.x, position.y + centerScreen.y, 1, 1)
        .drawRect(position.x - 1 + centerScreen.x, position.y - 1 + centerScreen.y, 3, 1)
        .drawRect(position.x - 2 + centerScreen.x, position.y + centerScreen.y, 1, 1)
        .drawRect(position.x + 2 + centerScreen.x, position.y + centerScreen.y, 1, 1)
        .drawRect(position.x + centerScreen.x, position.y - 2 + centerScreen.y, 1, 1);
    }

  }
}
