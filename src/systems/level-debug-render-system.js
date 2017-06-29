import EntityReferenceComponent from '../components/entity-reference-component';
import System from '../system';
import * as EntityFinders from '../entity-finders';
import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';

export default class LevelDebugRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();
    this.DEBUG = false;

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return this.DEBUG;
  }

  initialize(entities) {
    const hero = this._entityManager.heroEntity;
    const hand1Slot = hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);
    const weap = EntityFinders.findById(entities, hand1Slot.entityId);

    if (weap) {
      const melee = weap.get('MeleeAttackComponent');
      if (melee) {
        this._pixiContainer.addChild(melee.debugGraphics);
      }
    }
  }

  processEntities(gameTime, entities, input) {

    const hero = this._entityManager.heroEntity;
    const hand1Slot = hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);
    const weap = EntityFinders.findById(entities, hand1Slot.entityId);

    if (weap) {
      const melee = weap.get('MeleeAttackComponent');
      if (melee) {
        if (melee.hasRemainingAttack) {
          const debug = melee.debugGraphics;
          debug.clear();
          const currentLevel = this._entityManager.currentLevelEntity;
          const topLeftPos = currentLevel.get('TileMapComponent').topLeftPos;

          for (const line of melee.lines) {

            const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point1, topLeftPos).divide(Const.ScreenScale);
            const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftPos).divide(
              Const.ScreenScale
            );

            debug.lineStyle(1, 0xffffff);
            debug.moveTo(startPxPos.x, startPxPos.y);
            debug.lineTo(endPxPos.x, endPxPos.y);
          }
        }
      }
    }

  }
}
