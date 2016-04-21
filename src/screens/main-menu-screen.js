import Screen from '../screen';
import LevelScreen from './level-screen';
import LoadingScreen from './loading-screen';
import MainMenuRenderSystem from '../systems/main-menu-render-system';
import MainMenuInputSystem from '../systems/main-menu-input-system';


export default class MainMenuScreen extends Screen {

  constructor() {

    super();

    this._mainMenuRenderSystem = undefined;
    this._mainMenuInputSystem = undefined;

  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._mainMenuRenderSystem = new MainMenuRenderSystem(this, renderer);
    this._mainMenuRenderSystem.initialize(entities);

    this._mainMenuInputSystem = new MainMenuInputSystem(entityManager);
    this._mainMenuInputSystem.on('main-menu-input-system.show-new-game', () => {
      LoadingScreen.load(this.screenManager, true, [ new LevelScreen() ]);
    });

  }

  unload(entities) {

    this._mainMenuInputSystem.removeAllListeners();

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
