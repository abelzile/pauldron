import Screen from '../screen';
import AbilitiesRenderSystem from '../systems/abilities-render-system';
import AbilitiesInputSystem from '../systems/abilities-input-system';
import AbilitiesUpdateSystem from '../systems/abilities-update-system';


export default class AbilitiesScreen extends Screen {

  constructor(levelScreen) {

    super(true);

    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;

    this._levelScreen = levelScreen;

  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale);

    const rendererSys = new AbilitiesRenderSystem(this, renderer, entityManager);

    this._renderSystems = [ rendererSys ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new AbilitiesInputSystem(entityManager);
    this._inputSystem.on('close', () => this.exitScreen());

    this._updateSystem = new AbilitiesUpdateSystem(renderer, entityManager);

    rendererSys
      .on('abilities-render-system.learn-skill', (skillId) => this._updateSystem.learnSkill(skillId))
      .on('abilities-render-system.set-current-skill', (skillId) => this._updateSystem.setCurrentSkill(skillId))
      .on('abilities-render-system.set-memorized-skill', (skillId) => this._updateSystem.setMemorizedSkill(skillId))
      ;

    this._updateSystem.initialize(entities);

  }

  unload(entities) {

    for (const renderSys of this._renderSystems) {
      renderSys.unload(entities, this._levelScreen);
    }

    this._inputSystem.removeAllListeners();

    this._updateSystem.removeAllListeners();
    this._updateSystem.unload(entities, this._levelScreen);

  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) { return; }

    this._updateSystem.process(gameTime, entities);

  }

  handleInput(gameTime, entities, input) {

    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);

  }

  draw(gameTime, entities) {

    super.draw(gameTime, entities);

    if (!this.isActive) { return; }

    for (const renderSys of this._renderSystems) {
      renderSys.process(gameTime, entities);
    }

  }

}