import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';

export default class FinalRenderSystem extends DialogRenderSystem {
  constructor(pixiContainer, renderer) {
    super(pixiContainer, renderer);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities, endState) {
    let gui;
    let continueText;

    switch (endState) {
      case Const.FinalGameState.Victory:
        gui = EntityFinders.findVictorySplash(entities);
        continueText = gui.get('TextButtonComponent', c => c.id === 'victory');
        break;
      case Const.FinalGameState.Defeat:
        gui = EntityFinders.findDefeatSplash(entities);
        continueText = gui.get('TextButtonComponent', c => c.id === 'defeat');
        break;
    }

    const decorations = gui.get('DialogHeaderComponent');

    super.initialize(decorations);

    const scaleScreenWidth = Const.ScreenWidth / Const.ScreenScale;
    const scaleScreenHeight = Const.ScreenHeight / Const.ScreenScale;

    continueText.initialize(
      this.pixiContainer,
      (scaleScreenWidth - continueText.sprite.width) / 2,
      (scaleScreenHeight - continueText.sprite.height) / 2
    );
  }

  processEntities(gameTime, entities) {}
}
