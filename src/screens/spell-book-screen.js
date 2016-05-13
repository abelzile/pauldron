export default class SpellBookScreen extends Screen {

  constructor() {

    super(true);

    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;

  }

  activate(entities) {
    
    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale);

    this._renderSystems = [
      new SpellBookRenderSystem(this, renderer, entityManager)
    ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new SpellBookInputSystem()
      .on('spell-book-input-system.exit', () => {
        this.exitScreen();
      });

    this._updateSystem = new SpellBookUpdateSystem(renderer, entityManager)
    this._updateSystem.initialize(entities);

  }

  unload(entities) {

    this._inputSystem.removeAllListeners();
    this._updateSystem.removeAllListeners();

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