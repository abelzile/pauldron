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

    const scale = this.renderer.globalScale;
    const screenWidth = this.renderer.width;
    const scaleScreenWidth = screenWidth / scale;
    const screenHeight = this.renderer.height;
    const scaleScreenHeight = screenHeight / scale;
    const fifthScreenHeight = screenHeight / 5;
    const scaleFifthScreenHeight = fifthScreenHeight / scale;

    const startBtn = gui.get('TextButtonComponent', c => c.id === 'new_game');
    startBtn.initialize(
      this.pixiContainer,
      (scaleScreenWidth - startBtn.sprite.width) / 2,
      scaleFifthScreenHeight * 3
    );

    const logo = gui.get('SpriteComponent', c => c.id === 'logo');
    this.pixiContainer.addChild(logo.sprite);

    logo.sprite.scale.set(logo.sprite.scale.x * 2);
    logo.sprite.position.x = (scaleScreenWidth - logo.sprite.width) / 2;
    logo.sprite.position.y = scaleFifthScreenHeight;

    return this;
  }

  processEntities(gameTime, entities) {}
}
