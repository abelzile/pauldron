import FinalScreen from './final-screen';
import InventoryScreen from './inventory-screen';
import LevelAiRandomWandererSystem from '../systems/level-ai-random-wanderer-system';
import LevelAiSeekerSystem from '../systems/level-ai-seeker-system';
import LevelGuiRenderSystem from '../systems/level-gui-render-system';
import LevelHeroRenderSystem from '../systems/level-hero-render-system';
import LevelInputSystem from '../systems/level-input-system';
import LevelLootRenderSystem from '../systems/level-loot-render-system';
import LevelMapRenderSystem from '../systems/level-map-render-system';
import LevelMobRenderSystem from '../systems/level-mob-render-system';
import LevelProjectileRenderSystem from '../systems/level-projectile-render-system';
import LevelUpdateSystem from '../systems/level-update-system';
import LoadingScreen from './loading-screen';
import Screen from '../screen';
import WorldScreen from './world-screen';


export default class LevelScreen extends Screen {

  constructor() {

    super();

    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;
    this._aiSystems = undefined;

  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [
      new LevelMapRenderSystem(this, renderer, entityManager),
      new LevelLootRenderSystem(this, renderer, entityManager),
      new LevelMobRenderSystem(this, renderer, entityManager),
      new LevelHeroRenderSystem(this, renderer, entityManager),
      new LevelProjectileRenderSystem(this, renderer, entityManager),
      new LevelGuiRenderSystem(this, renderer, entityManager)
    ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new LevelInputSystem(entityManager)
      .on('level-input-system.show-inventory-screen', () => {
        this.screenManager.add(new InventoryScreen(this));
      });

    this._updateSystem = new LevelUpdateSystem(renderer, entityManager)
      .on('level-update-system.enter-level-gateway', () => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen()]);
      })
      .on('level-update-system.enter-world-gateway', () => {
        LoadingScreen.load(this.screenManager, true, [new WorldScreen()]);
      })
      .on('level-update-system.enter-victory-gateway', () => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('victory')]);
      })
      .on('level-update-system.pick-up-item', e => {
        this.removeChild(e.get('MovieClipComponent').movieClip);
      })
      .on('level-update-system.defeat', e => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('defeat')]);
      });
    this._updateSystem.initialize(entities);

    this._aiSystems = [
      new LevelAiRandomWandererSystem(renderer, entityManager),
      new LevelAiSeekerSystem(renderer, entityManager)
    ];

    for (const aiSys of this._aiSystems) {
      aiSys.initialize(entities);
    }

  }

  unload(entities) {

    this._inputSystem.removeAllListeners('level-input-system.show-inventory-screen');
    this._updateSystem.removeAllListeners('level-update-system.enter-gateway');
    this._updateSystem.removeAllListeners('level-update-system.pick-up-item');

  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) { return; }

    for (const aiSys of this._aiSystems) {
      aiSys.process(gameTime, entities);
    }

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
