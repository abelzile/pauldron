import * as Const from '../const';
import LevelScreen from './level-screen';
import LoadingScreen from './loading-screen';
import Screen from '../screen';
import WorldMapSystem from '../systems/world-map-system';

export default class WorldScreen extends Screen {
  constructor() {
    super(true);
    this._worldMapSystem = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(Const.ScreenScale);

    this._worldMapSystem = new WorldMapSystem(this, renderer, entityManager);
    this._worldMapSystem.initialize(entities);
    this._worldMapSystem
      .on('travel', levelName => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen('world', levelName)]);
      })
      .on('cancel', () => {
        this.exitScreen();
      });
  }

  unload(entities) {
    this._worldMapSystem.unload(entities);
    this._worldMapSystem.removeAllListeners();
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);
    this._worldMapSystem.process(gameTime, entities);
  }
}
