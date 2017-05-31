import * as _ from 'lodash';
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
import LevelProjectileRenderSystem from '../systems/level-projectile-render-system';
import LevelRenderSystem from '../systems/level-render-system';
import LevelUpdateSystem from '../systems/level-update-system';
import LoadingScreen from './loading-screen';
import MerchantShopScreen from './merchant-shop-screen';
import Screen from '../screen';
import WorldScreen from './world-screen';

export default class LevelScreen extends Screen {
  constructor(fromLevelName, levelName) {
    super(false);

    this.transitionOnTime = 1000;

    this._fromLevelName = fromLevelName;
    this._levelName = levelName;
    this._inputSystem = null;
    this._updateSystem = null;
    this._renderSystems = null;
    this._logRenderSystem = null;
    this._aiSystems = null;
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
    this._particleRenderSystem = new LevelParticleRenderSystem(this, renderer, entityManager);
    this._lootRenderSystem = new LevelLootRenderSystem(this, renderer, entityManager);

    this._renderSystems = [
      new LevelRenderSystem(this, renderer, entityManager),
      this._lootRenderSystem,
      new LevelMobRenderSystem(this, renderer, entityManager),
      new LevelProjectileRenderSystem(this, renderer, entityManager),
      new LevelFogOfWarRenderSystem(this, renderer, entityManager),
      this._particleRenderSystem,
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
        this.screenManager.add(new LevelMapScreen());
      })
      .on('level-input-system.add-log-message', msg => {
        this._logRenderSystem.addMessage(msg);
      })
      .on('show-merchant-screen', (merchant) => {
        this.screenManager.add(new MerchantShopScreen(this, merchant.id))
      })
      ;

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
      .on('level-update-system.pick-up-item', this._removeEntitySprites.bind(this))
      .on('level-update-system.defeat', e => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('defeat')]);
      })
      .on('level-update-system.add-log-message', msg => {
        this._logRenderSystem.addMessage(msg);
      })
      .on('level-update-system.level-up', () => {
        this._guiRenderSystem.showLevelUpMsg();
      })
      .on('level-update-system.show-attack-hit', (attack, point) => {
        this._particleRenderSystem.showAttackHit(attack, point);
      })
      .on('level-update-system.show-mob-death', (mob) => {
        this._particleRenderSystem.showMobDeath(mob);
      })
      .on('level-update-system.open-container', (container) => {
        this._particleRenderSystem.showContainerOpen(container);
      })
      .on('level-update-system.show-container-loot', (loot) => {
        this._lootRenderSystem.showContainerLoot(loot);
        this._particleRenderSystem.showLoot(loot);
      })
      .on('level-update-system.show-money', (money) => {
        this._lootRenderSystem.showMoney(money);
      })
      .on('level-update-system.pick-up-money', this._removeEntitySprites.bind(this))
      ;


    this._updateSystem.initialize(entities);

    this._aiSystems = [
      new LevelAiHeroSystem(renderer, entityManager),
      new LevelAiRandomWandererSystem(renderer, entityManager),
      new LevelAiSeekerSystem(renderer, entityManager)
    ];

    for (let i = 0; i < this._aiSystems.length; ++i) {
      this._aiSystems[i].on('level-update-system.show-attack-hit', (attack, point) => {
        this._particleRenderSystem.showAttackHit(attack, point);
      });
      this._aiSystems[i].initialize(entities);
    }
  }

  unload(entities) {
    _.forEach(this._aiSystems, sys => this._unloadSystem(sys, entities));
    _.forEach(this._renderSystems, sys => this._unloadSystem(sys, entities));
    this._unloadSystem(this._updateSystem, entities);
    this._unloadSystem(this._inputSystem, entities);
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
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    if (this.isActive) {
      this._inputSystem.process(gameTime, entities, input);
    }
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    for (let i = 0; i < this._renderSystems.length; ++i) {
      this._renderSystems[i].process(gameTime, entities);
    }
  }

  _unloadSystem(system, entities) {
    system.unload(entities);
    system.removeAllListeners();
  }

  _removeEntitySprites(e) {
    const sprites = e.getAllKeyed('SpriteComponent', 'id');
    if (sprites.hasOwnProperty('shadow')) {
      this.removeChild(sprites['shadow'].sprite);
    }
    this.removeChild(e.get('AnimatedSpriteComponent').animatedSprite);
  }
}
