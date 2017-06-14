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
    //TODO: statistic effects on mobs
    this._doStatisticEffects(gameTime, hero, entities);
  }

  _doStatisticEffects(gameTime, hero, entities) {
    //const stats = hero.getAllKeyed('StatisticComponent', 'name');
    const effects = hero.getAll('StatisticEffectComponent');

    for (const effect of effects) {
      if (effect.timeLeft !== Infinity) {
        effect.timeLeft -= gameTime;
      }
      if (effect.timeLeft <= 0) {
        hero.remove(effect);
      }
    }
  }
}
