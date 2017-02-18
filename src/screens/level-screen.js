import * as Const from '../const';
import AbilitiesScreen from './abilities-screen';
import FinalScreen from './final-screen';
import InventoryScreen from './inventory-screen';
import LevelAiHeroSystem from '../systems/level-ai-hero-system';
import LevelAiRandomWandererSystem from '../systems/level-ai-random-wanderer-system';
import LevelAiSeekerSystem from '../systems/level-ai-seeker-system';
import LevelFogOfWarRenderSystem from '../systems/level-fog-of-war-render-system';
import LevelGuiRenderSystem from '../systems/level-gui-render-system';
import LevelInputSystem from '../systems/level-input-system';
import LevelLogRenderSystem from '../systems/level-log-render-system';
import LevelLootRenderSystem from '../systems/level-loot-render-system';
import LevelMapScreen from './level-map-screen';
import LevelMobRenderSystem from '../systems/level-mob-render-system';
import LevelParticleRenderSystem from '../systems/level-particle-render-system';
import LevelParticleUpdateSystem from '../systems/level-particle-update-system';
import LevelProjectileRenderSystem from '../systems/level-projectile-render-system';
import LevelRenderSystem from '../systems/level-render-system';
import LevelUpdateSystem from '../systems/level-update-system';
import LoadingScreen from './loading-screen';
import Screen from '../screen';
import WorldScreen from './world-screen';

export default class LevelScreen extends Screen {

  constructor(fromLevelName, levelName) {

    super(false);

    this._fromLevelName = fromLevelName;
    this._levelName = levelName;
    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;
    this._logRenderSystem = undefined;
    this._aiSystems = undefined;
    this._updateParticlesSystem = undefined;

  }

  activate(entities) {

    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(Const.ScreenScale);

    entityManager.setCurrentLevel(this._levelName, this._fromLevelName);

    const bg = entityManager.currentLevelEntity.get('ColorComponent');
    bg && this.setBackgroundColor(bg.color);

    this._logRenderSystem = new LevelLogRenderSystem(this, renderer, entityManager);
    this._guiRenderSystem = new LevelGuiRenderSystem(this, renderer, entityManager);

    this._renderSystems = [
      new LevelRenderSystem(this, renderer, entityManager),
      new LevelLootRenderSystem(this, renderer, entityManager),
      new LevelMobRenderSystem(this, renderer, entityManager),
      new LevelProjectileRenderSystem(this, renderer, entityManager),
      new LevelFogOfWarRenderSystem(this, renderer, entityManager),
      new LevelParticleRenderSystem(this, renderer, entityManager),
      this._guiRenderSystem,
      this._logRenderSystem
    ];

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].initialize(entities);
    }

    this._inputSystem = new LevelInputSystem(entityManager)
      .on('show-inventory-screen', () => {
        this.screenManager.add(new InventoryScreen(this));
      })
      .on('show-abilities-screen', () => {
        this.screenManager.add(new AbilitiesScreen(this));
      })
      .on('show-map-screen', () => {
        this.screenManager.add(new LevelMapScreen(this));
      })
      .on('level-input-system.add-log-message', msg => {
        this._logRenderSystem.addMessage(msg);
      });

    this._updateSystem = new LevelUpdateSystem(renderer, entityManager)
      .on('level-update-system.enter-level-gateway', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName)]);
      })
      .on('level-update-system.enter-boss-gateway', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName)]);
      })
      .on('level-update-system.enter-world-gateway', () => {
        this.screenManager.add(new WorldScreen());
      })
      .on('level-update-system.leave-boss-level', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName), new WorldScreen()]);
      })
      .on('level-update-system.enter-victory-gateway', () => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('victory')]);
      })
      .on('level-update-system.pick-up-item', e => {
        this.removeChild(e.get('AnimatedSpriteComponent').animatedSprite);
      })
      .on('level-update-system.defeat', e => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('defeat')]);
      })
      .on('level-update-system.add-log-message', msg => {
        this._logRenderSystem.addMessage(msg);
      })
      .on('level-update-system.level-up', () => {
        this._guiRenderSystem.showLevelUpMsg();
      });

    this._updateSystem.initialize(entities);

    this._aiSystems = [
      new LevelAiHeroSystem(renderer, entityManager),
      new LevelAiRandomWandererSystem(renderer, entityManager),
      new LevelAiSeekerSystem(renderer, entityManager)
    ];

    for (let i = 0; i < this._aiSystems.length; ++i) {
      this._aiSystems[i].initialize(entities);
    }

    this._updateParticlesSystem = new LevelParticleUpdateSystem(renderer, entityManager);
    this._updateParticlesSystem.initialize(entities);

  }

  unload(entities) {
    this._updateSystem.removeAllListeners();
    this._inputSystem.removeAllListeners();
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) {
      return;
    }

    for (let i = 0; i < this._aiSystems.length; ++i) {
      this._aiSystems[i].process(gameTime, entities);
    }

    this._updateSystem.process(gameTime, entities);
    this._updateParticlesSystem.process(gameTime, entities);

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
