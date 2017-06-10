import System from '../system';
import * as Const from '../const';

export default class LevelStatisticEffectSystem extends System {
  constructor(renderer, entityManager) {
    super();
    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
    const hero = this._entityManager.heroEntity;
    //TODO: statistic effects on mobs?
    this._doStatisticEffects(gameTime, hero, entities);
  }

  _doStatisticEffects(gameTime, hero, entities) {
    const stats = hero.getAllKeyed('StatisticComponent', 'name');
    const effects = hero.getAll('StatisticEffectComponent');

    for (const effect of effects) {
      if (effect.timeLeft <= 0) {
        hero.remove(effect);
      } else {
        // this won't work for currentValue, it is pinned to max value.
        // may make sense to get rid of EffectTimeType and just stick with timeLeft
        // maybe set a super high value (like infinity) for permanent effect.

        if (effect.effectTimeType === Const.EffectTimeType.Permanent) {
          stats[effect.name].currentValue += effect.value;
        }
      }

      effect.timeLeft -= gameTime;
    }
  }
}
