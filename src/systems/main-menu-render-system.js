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

    const scaleScreenWidth = this.renderer.width / this.renderer.globalScale;
    const scaleScreenHeight = this.renderer.height / this.renderer.globalScale;

    this._initLogo(gui.get('SpriteComponent', c => c.id === 'logo'), scaleScreenWidth, scaleScreenHeight);
    this._initStartButton(
      gui.get('TextButtonComponent', c => c.id === 'new_game'),
      scaleScreenWidth,
      scaleScreenHeight
    );

    return this;
  }

  _initLogo(logo, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(logo.sprite);
    logo.sprite.scale.set(logo.sprite.scale.x * 2);
    logo.sprite.position.x = (scaleScreenWidth - logo.sprite.width) / 2;
    logo.sprite.position.y = scaleScreenHeight / 5;
  }

  _initStartButton(startBtn, scaleScreenWidth, scaleScreenHeight) {
    startBtn.initialize(this.pixiContainer, (scaleScreenWidth - startBtn.sprite.width) / 2, scaleScreenHeight / 5 * 3);
  }

  processEntities(gameTime, entities) {}
}
