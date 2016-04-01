import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import _ from 'lodash';
import Point from '../point';
import System from '../system';


export default class LevelGuiRenderSystem extends System {

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

    const guiEnt = EntityFinders.findLevelGui(entities);

    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');

    const hpPixiGraphicsObj = this._pixiContainer.addChild(hpGuiComp.barGraphics);

    const hpPixiIconObj = this._pixiContainer.addChild(hpGuiComp.barIconSprite);
    hpPixiIconObj.position.set(0, 0);

  }

  processEntities(gameTime, entities) {

    const heroEnt = this._entityManager.heroEntity;
    const heroHpComp = _.find(heroEnt.getAll('StatisticComponent'), c => c.name === 'hit-points');

    const guiEnt = EntityFinders.findLevelGui(entities);
    const hpGuiComp = guiEnt.get('HitPointsGuiComponent');

    const hpG = hpGuiComp.barGraphics;
    hpG.clear();

    // white border around bar
    hpG.lineStyle(1, 0xffffff);
    hpG.drawRect(9.666, 5.333, heroHpComp.maxValue + 1, 5);

    // red hp bar
    hpG.beginFill(0xd40000);
    hpG.lineStyle(0);
    hpG.drawRect(10, 6, heroHpComp.currentValue, 4)

    hpG.endFill();

  }

}
