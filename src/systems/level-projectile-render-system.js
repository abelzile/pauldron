import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ScreenUtils from '../utils/screen-utils';
import _ from 'lodash';
import Point from '../point';
import System from '../system';


export default class LevelProjectileRenderSystem extends System {

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
  }

  processEntities(gameTime, entities) {

    const projectiles = EntityFinders.findProjectiles(entities);

    this._drawProjectiles(projectiles);

  }

  _drawProjectiles(projectiles) {

    if (projectiles.length === 0) { return; }

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftSprite = tileMap.spriteLayers[0][0][0];

    for (const projectile of projectiles) {

      const projectilePosition = projectile.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(projectilePosition.position, topLeftSprite.position);
      const drawableComps = this._ensureProjectileAdded(projectile);

      for (const c of drawableComps) {

        if (c.AnimatedSprite) {
          c.AnimatedSprite.position.x = screenPosition.x / Const.ScreenScale;
          c.AnimatedSprite.position.y = screenPosition.y / Const.ScreenScale;
        }

        if (c.graphics) {

          if (c.id === 'debug') {

            const boundingRect = projectile.get('BoundingRectangleComponent');
            const screenPos = ScreenUtils.translateWorldPositionToScreenPosition(new Point(projectilePosition.x + boundingRect.rectangle.x, projectilePosition.y + boundingRect.rectangle.y),
                                                                                 topLeftSprite.position);

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

    const all = [].concat(projectile.getAll('AnimatedSpriteComponent'),
                          projectile.getAll('GraphicsComponent'));

    for (const c of all) {

      if (c.AnimatedSprite && !c.AnimatedSprite.parent) {
        this._pixiContainer.addChild(c.AnimatedSprite);
      }

      if (c.graphics && !c.graphics.parent) {
        this._pixiContainer.addChild(c.graphics);
      }

    }

    return all;

  }

}
