import * as Const from '../const';
import LevelMapInputSystem from '../systems/level-map-input-system';
import LevelMapRenderSystem from '../systems/level-map-render-system';
import LevelMapUpdateSystem from '../systems/level-map-update-system';
import Screen from '../screen';

export default class LevelMapScreen extends Screen {
  constructor() {
    super(true, Const.Color.LevelMapDarkBrown);
    this._inputSystem = null;
    this._updateSystem = null;
    this._renderSystems = null;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale);

    const rendererSys = new LevelMapRenderSystem(this, renderer, entityManager);

    this._renderSystems = [rendererSys];

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].initialize(entities);
    }

    this._inputSystem = new LevelMapInputSystem(entityManager);
    this._inputSystem.initialize(entities);
    this._inputSystem.on('close', () => {
      this.exitScreen();
    });

    this._updateSystem = new LevelMapUpdateSystem(renderer, entityManager);
    this._updateSystem.initialize(entities);
  }

  unload(entities) {
    this._inputSystem.removeAllListeners();
    this._inputSystem.unload(entities);

    this._updateSystem.removeAllListeners();
    this._updateSystem.unload(entities);

    for (let i = 0; i < this._renderSystems.length; ++i) {
      const renderSystem = this._renderSystems[i];
      renderSystem.removeAllListeners();
      renderSystem.unload(entities);
    }
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) {
      return;
    }

    this._updateSystem.process(gameTime, entities);
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    if (!this.isActive) {
      return;
    }

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].process(gameTime, entities);
    }
  }
}
