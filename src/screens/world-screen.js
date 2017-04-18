import * as Const from '../const';
import LevelScreen from './level-screen';
import LoadingScreen from './loading-screen';
import Screen from '../screen';
import WorldMapRenderSystem from '../systems/world-map-render-system';

export default class WorldScreen extends Screen {
  constructor() {
    super(true);
    this._worldMapRenderSystem = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(Const.ScreenScale);

    this._worldMapRenderSystem = new WorldMapRenderSystem(this, renderer, entityManager);
    this._worldMapRenderSystem.initialize(entities);
    this._worldMapRenderSystem
      .on('travel', levelName => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen('world', levelName)]);
      })
      .on('cancel', () => {
        this.exitScreen();
      });
  }

  unload(entities) {
    this._worldMapRenderSystem.unload(entities);
    this._worldMapRenderSystem.removeAllListeners();
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);
    this._worldMapRenderSystem.process(gameTime, entities);
  }
}
