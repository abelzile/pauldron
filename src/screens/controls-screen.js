import Screen from '../screen';
import LoadingScreen from './loading-screen';
import ControlsRenderSystem from '../systems/controls-render-system';

export default class ControlsScreen extends Screen {
  constructor() {
    super();

    this._controlsRenderSystem = null;
    this._controlsInputSystem = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._controlsRenderSystem = new ControlsRenderSystem(this, renderer).initialize(entities);

    /*this._controlsInputSystem = new ControlsInputSystem(entityManager)
      .initialize(entities)
      /!*.once('show-new-game', () => {
        LoadingScreen.load(this.screenManager, true, [new CharacterCreationScreen()]);
      })*!/
    ;*/
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    //this._mainMenuInputSystem.process(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    this._controlsRenderSystem.process(gameTime, entities);
  }
}
