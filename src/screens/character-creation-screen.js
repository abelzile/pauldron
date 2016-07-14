import CharacterCreationInputSystem from '../systems/character-creation-input-system';
import CharacterCreationRenderSystem from '../systems/character-creation-render-system';
import CharacterCreationUpdateSystem from '../systems/character-creation-update-system';
import Screen from '../screen';
import LevelScreen from './level-screen';
import LoadingScreen from './loading-screen';

export default class CharacterCreationScreen extends Screen {

  constructor() {

    super();

    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;

  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [
      new CharacterCreationRenderSystem(this, renderer, entityManager)
    ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new CharacterCreationInputSystem(entityManager.heroEntity)
      .on('character-creation-input-system.start', () => {

        LoadingScreen.load(this.screenManager, true, [ new LevelScreen() ]);

      });

    this._updateSystem = new CharacterCreationUpdateSystem(renderer, entityManager);
    this._updateSystem.initialize(entities);

  }

  unload(entities) {

    //_.each(this._renderSystems, s => { s.unload(entities, this._levelScreen); });

    //this._inputSystem.removeAllListeners();

    //this._updateSystem.removeAllListeners();
    //this._updateSystem.unload(entities, this._levelScreen);

  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    this._updateSystem.process(gameTime, entities);

  }

  handleInput(gameTime, entities, input) {

    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);

  }

  draw(gameTime, entities) {

    super.draw(gameTime, entities);

    for (const renderSys of this._renderSystems) {
      renderSys.process(gameTime, entities);
    }

  }

}