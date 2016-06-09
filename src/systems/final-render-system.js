import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';


export default class FinalRenderSystem extends System {

  constructor(pixiContainer, renderer) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities, endState) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    let continueText;

    switch (endState) {

      case Const.FinalGameState.Victory:
        const victorySplashEnt = EntityFinders.findVictorySplash(entities);
        continueText = this._pixiContainer.addChild(victorySplashEnt.get('VictoryTextComponent').sprite);
        break;

      case Const.FinalGameState.Defeat:
        const defeatSplashEnt = EntityFinders.findDefeatSplash(entities);
        continueText = this._pixiContainer.addChild(defeatSplashEnt.get('DefeatTextComponent').sprite);
        break;

    }

    continueText.anchor.set(0.5, 0.5);
    continueText.position.set(screenWidth / scale / 2, screenHeight / scale / 2);

  }

  processEntities(gameTime, entities) {
  }

}