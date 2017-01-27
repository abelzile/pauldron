import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';
import Rectangle from '../rectangle';
import Vector from '../vector';
import * as ArrayUtils from '../utils/array-utils';

export default class LevelMapRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._heroPosition = new Vector();
    this._centerScreen = new Vector(
      Const.ScreenWidth / 2 / Const.ScreenScale,
      Const.ScreenHeight / 2 / Const.ScreenScale
    );

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const levelMapGui = EntityFinders.findLevelMapGui(entities);
    const heroPos = this._entityManager.heroEntity.get('PositionComponent').position;
    const currentLevel = this._entityManager.currentLevelEntity;
    const tileMap = currentLevel.get('TileMapComponent');

    this._heroPosition.x = heroPos.x;
    this._heroPosition.y = heroPos.y;

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

    const g = levelMapGui.get('GraphicsComponent').graphics.clear();
    this._drawRects(g, rooms, Const.Color.LevelMapLightBrown);
    this._drawRects(g, halls, Const.Color.LevelMapLightBrown);
    this._drawPoints(g, doors, Const.Color.LevelMapLightLightBrown, 1);
    this._drawExits(g, exitPositions, Const.Color.LevelMapDarkBrown);
    this._drawMarkers(g, mobPositions, Const.Color.LevelMapMobLightRed, Const.Color.LevelMapMobDarkRed);
    this._drawMarker(g, heroPos, Const.Color.LevelMapHeroLightGreen, Const.Color.LevelMapHeroDarkGreen);
    g.endFill();

    this._pixiContainer.addChild(g);
    
    this.drawDialogHeader(levelMapGui.get('DialogHeaderComponent'));

  }

  processEntities(gameTime, entities, input) {
  }

  _drawRects(g, rects, color) {

    g.beginFill(color);

    const r = new Rectangle();

    for (let i = 0; i < rects.length; ++i) {

      const rect = rects[i];
      this._calculatePxPos(rect.x, rect.y, r);
      r.width = rect.width;
      r.height = rect.height;
      this._drawRect(g, r);

    }

  }

  _drawPoints(g, points, color) {

    g.beginFill(color);

    const r = new Rectangle();

    for (let i = 0; i < points.length; ++i) {

      const point = points[i];
      this._calculatePxPos(point.x, point.y, r);
      this._drawRect(g, r);

    }

  }

  _drawRect(graphics, rect) {

    graphics.drawRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );

  }

  _drawMarker(g, point, lightColor, darkColor) {

    g.beginFill(lightColor);

    const r = new Rectangle();

    this._calculatePxPos(point.x, point.y, r);
    this._drawRect(g, r);

    g.beginFill(darkColor);

    const points = [
      Vector.pnew(point.x - 1, point.y),
      Vector.pnew(point.x + 1, point.y),
      Vector.pnew(point.x, point.y - 1),
      Vector.pnew(point.x, point.y + 1),
    ];

    for (let i = 0; i < points.length; ++i) {
      const p = points[i];
      this._calculatePxPos(p.x, p.y, r);
      this._drawRect(g, r);
      p.pdispose();
    }

    ArrayUtils.clear(points);

  }

  _drawMarkers(g, points, lightColor, darkColor) {
    for (let i = 0; i < points.length; ++i) {
      this._drawMarker(g, points[i], lightColor, darkColor);
    }
  }

  _drawExits(g, exitPositions, color) {

    g.beginFill(color);

    for (let i = 0; i < exitPositions.length; ++i) {
      const position = exitPositions[i];
      this._drawExit(g, position);
    }

  }

  _drawExit(g, position) {

    const points = [
      Vector.pnew(position.x - 1, position.y),
      Vector.pnew(position.x + 1, position.y),
      Vector.pnew(position.x - 1, position.y - 1),
      Vector.pnew(position.x - 2, position.y),
      Vector.pnew(position.x + 2, position.y),
      Vector.pnew(position.x, position.y - 2),
      Vector.pnew(position.x, position.y - 1),
      Vector.pnew(position.x + 1, position.y - 1),
    ];
    const r = new Rectangle();

    for (let i = 0; i < points.length; ++i) {
      const p = points[i];
      this._calculatePxPos(p.x, p.y, r);
      this._drawRect(g, r);
      p.pdispose();
    }

    ArrayUtils.clear(points);

  }

  _calculatePxPos(x, y, outPos) {
    outPos.x = this._centerScreen.x + (x - this._heroPosition.x);
    outPos.y = this._centerScreen.y + (y - this._heroPosition.y);
  }
  
}
