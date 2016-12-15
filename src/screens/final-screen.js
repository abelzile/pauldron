import FinalInputSystem from '../systems/final-input-system';
import FinalRenderSystem from '../systems/final-render-system';
import Screen from '../screen';


export default class FinalScreen extends Screen {

  constructor(endState) {

    super();

    this._endState = endState;
    this._renderSystems = undefined;
    this._inputSystem = undefined;

  }

  activate(entities) {

    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [
      new FinalRenderSystem(this, renderer, entityManager)
    ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities, this._endState);
    }

    this._inputSystem = new FinalInputSystem();
    this._inputSystem.on('final-input-system.reset', () => {
      window.jsrpg.reset();
    });

  }

  unload(entities) {
    
    this._inputSystem.removeAllListeners();
    
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

  }

  handleInput(gameTime, entities, input) {

    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input, this._endState);

  }

  draw(gameTime, entities) {

    super.draw(gameTime, entities);

    for (const renderSys of this._renderSystems) {
      renderSys.process(gameTime, entities);
    }

  }


}