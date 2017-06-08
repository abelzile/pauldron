import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';

export default class MainMenuRenderSystem extends DialogRenderSystem {
  constructor(pixiContainer, renderer) {
    super(pixiContainer, renderer);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findMainMenu(entities);
    super.initialize(gui.get('DialogHeaderComponent'));

    const scaleScreenWidth = Const.ScreenWidth / Const.ScreenScale;
    const scaleScreenHeight = Const.ScreenHeight / Const.ScreenScale;
    const startBtnY = 0.4;

    const startBtn = gui.get('TextButtonComponent', c => c.id === 'new_game');
    startBtn.initialize(
      this.pixiContainer,
      (scaleScreenWidth - startBtn.sprite.width) / 2,
      scaleScreenHeight * startBtnY
    );

    return this;
  }

  processEntities(gameTime, entities) {}
}
