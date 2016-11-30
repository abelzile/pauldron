import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as MathUtils from '../utils/math-utils';
import * as ScreenUtils from '../utils/screen-utils';
import Point from '../point';
import System from '../system';


export default class LevelProjectileRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this.DEBUG = false;

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._drawableComps = [];

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities) {

    const projectiles = EntityFinders.findProjectiles(entities);

    this._drawProjectiles(projectiles);

  }

  _drawProjectiles(projectiles) {

    if (projectiles.length === 0) { return; }

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (let i = 0; i < projectiles.length; ++i) {

      const projectile = projectiles[i];

      const projectilePosition = projectile.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(projectilePosition.position, topLeftPos/*topLeftSprite.position*/);
      const movement = projectile.get('MovementComponent');
      const angle = MathUtils.normalizeAngle(movement.movementAngle + Const.RadiansOf45Degrees, Math.PI);
      const drawableComps = this._ensureProjectileAdded(projectile);

      for (let j = 0; j < drawableComps.length; ++j) {

        const c = drawableComps[j];

        if (c.animatedSprite) {

          const some = Const.TilePixelSize * Const.ScreenScale / 2;

          c.animatedSprite.position.x = (screenPosition.x + some) / Const.ScreenScale;
          c.animatedSprite.position.y = (screenPosition.y + some) / Const.ScreenScale;
          c.anchor.x = .5;
          c.anchor.y = .5;
          c.animatedSprite.rotation = angle;

        }

        if (c.graphics) {

          if (this.DEBUG && c.id === 'debug') {

            const boundingRect = projectile.get('BoundingRectangleComponent');
            const screenPos = ScreenUtils.translateWorldPositionToScreenPosition(new Point(projectilePosition.x + boundingRect.rectangle.x, projectilePosition.y + boundingRect.rectangle.y),
                                                                                 topLeftPos);

            c.graphics
             .clear()
             .lineStyle(1, 0xff0000)
             .drawRect(screenPos.x / Const.ScreenScale,
                       screenPos.y / Const.ScreenScale,
                       boundingRect.rectangle.width * Const.TilePixelSize,
                       boundingRect.rectangle.height * Const.TilePixelSize);

          }

        }

      }

    }

  }

  _ensureProjectileAdded(projectile) {

    ArrayUtils.clear(this._drawableComps);
    ArrayUtils.append(this._drawableComps, projectile.getAll('AnimatedSpriteComponent'), projectile.getAll('GraphicsComponent'));

    for (let i = 0; i < this._drawableComps.length; ++i) {

      const c = this._drawableComps[i];

      if (c.animatedSprite && !c.animatedSprite.parent) {
        this._pixiContainer.addChild(c.animatedSprite);
      }

      if (c.graphics && !c.graphics.parent) {
        this._pixiContainer.addChild(c.graphics);
      }

    }

    return this._drawableComps;

  }

}
