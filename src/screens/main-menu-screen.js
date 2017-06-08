import CharacterCreationScreen from './character-creation-screen';
import LoadingScreen from './loading-screen';
import MainMenuInputSystem from '../systems/main-menu-input-system';
import MainMenuRenderSystem from '../systems/main-menu-render-system';
import Screen from '../screen';

export default class MainMenuScreen extends Screen {
  constructor() {
    super();

    this._mainMenuRenderSystem = null;
    this._mainMenuInputSystem = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._mainMenuRenderSystem = new MainMenuRenderSystem(this, renderer).initialize(entities);

    this._mainMenuInputSystem = new MainMenuInputSystem(entityManager)
      .initialize(entities)
      .once('show-new-game', () => {
        LoadingScreen.load(this.screenManager, true, [new CharacterCreationScreen()]);
      });
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    this._mainMenuInputSystem.process(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    this._mainMenuRenderSystem.process(gameTime, entities);
  }
}
