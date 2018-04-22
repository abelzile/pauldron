import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';
import DialogHeaderComponent from '../components/dialog-header-component';
import SpriteComponent from '../components/sprite-component';
import TextButtonComponent from '../components/text-button-component';

export default class MainMenuRenderSystem extends DialogRenderSystem {
  constructor(pixiContainer, renderer) {
    super(pixiContainer, renderer);

    this.LOGO_COMPONENT_ID = 'logo';
    this.NEW_GAME_BUTTON_COMPONENT_ID = 'new_game';
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findMainMenu(entities);
    super.initialize(gui.get(DialogHeaderComponent.name));

    const scaleScreenWidth = this.renderer.width / this.renderer.globalScale;
    const scaleScreenHeight = this.renderer.height / this.renderer.globalScale;

    this._initLogo(
      gui.get(SpriteComponent.name, c => c.id === this.LOGO_COMPONENT_ID),
      scaleScreenWidth,
      scaleScreenHeight
    );
    this._initStartButton(
      gui.get(TextButtonComponent.name, c => c.id === this.NEW_GAME_BUTTON_COMPONENT_ID),
      scaleScreenWidth,
      scaleScreenHeight
    );

    return this;
  }

  _initLogo(logo, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(logo.sprite);
    logo.sprite.scale.set(logo.sprite.scale.x * 1.5);
    logo.sprite.position.set((scaleScreenWidth - logo.sprite.width) / 2, scaleScreenHeight / 10 * 2);
  }

  _initStartButton(startBtn, scaleScreenWidth, scaleScreenHeight) {
    startBtn.initialize(this.pixiContainer, (scaleScreenWidth - startBtn.sprite.width) / 2, scaleScreenHeight / 10 * 7);
  }

  processEntities(gameTime, entities) {}
}
