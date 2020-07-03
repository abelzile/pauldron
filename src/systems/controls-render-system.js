import DialogHeaderComponent from '../components/dialog-header-component';
import TextComponent from '../components/text-component';
import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';

export default class ControlsRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer) {
    super(pixiContainer, renderer);

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findControlsGui(entities);
    super.initialize(gui.get(DialogHeaderComponent.name));

    const scaleScreenWidth = this.renderer.width / this.renderer.globalScale;
    const scaleScreenHeight = this.renderer.height / this.renderer.globalScale;

    const gameplayHeader = gui.get(TextComponent.name, c => c.id === 'gameplay_header');
    const screensHeader = gui.get(TextComponent.name, c => c.id === 'screens_header');
    const gameplayTxt = gui.get(TextComponent.name, c => c.id === 'gameplay');
    const screensTxt = gui.get(TextComponent.name, c => c.id === 'screens');

    this._initGameplayHeader(gameplayHeader, scaleScreenWidth, scaleScreenHeight);
    this._initScreensHeader(screensHeader, scaleScreenWidth, scaleScreenHeight);
    this._initGameplayControls(gameplayTxt, scaleScreenWidth, scaleScreenHeight);
    this._initScreensControls(screensTxt, scaleScreenWidth, scaleScreenHeight);

    return this;
  }

  _initGameplayHeader(gameplayHeader, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(gameplayHeader.sprite);
    gameplayHeader.position.set(
      scaleScreenWidth / 10 * 2,
      scaleScreenHeight / 10 * 2);
  }

  _initScreensHeader(screensHeader, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(screensHeader.sprite);
    screensHeader.position.set(
      scaleScreenWidth / 10 * 5,
      scaleScreenHeight / 10 * 2);
  }

  _initGameplayControls(gameplayTxt, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(gameplayTxt.sprite);
    gameplayTxt.position.set(
      scaleScreenWidth / 10 * 2,
      scaleScreenHeight / 10 * 3);
  }

  _initScreensControls(screensTxt, scaleScreenWidth, scaleScreenHeight) {
    this.pixiContainer.addChild(screensTxt.sprite);
    screensTxt.position.set(
      scaleScreenWidth / 10 * 5,
      scaleScreenHeight / 10 * 3);
  }

  processEntities(gameTime, entities) {}

}
