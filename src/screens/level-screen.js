import * as Const from '../const';
import AbilitiesScreen from './abilities-screen';
import FinalScreen from './final-screen';
import InventoryScreen from './inventory-screen';
import LevelAiHeroSystem from '../systems/level-ai-hero-system';
import LevelAiRandomWandererSystem from '../systems/level-ai-random-wanderer-system';
import LevelAiSeekerSystem from '../systems/level-ai-seeker-system';
import LevelCleanupSystem from '../systems/level-cleanup-system';
import LevelCombatSystem from '../systems/level-combat-system';
import LevelContainerOpenSystem from '../systems/level-container-open-system';
import LevelFogOfWarRenderSystem from '../systems/level-fog-of-war-render-system';
import LevelGuiRenderSystem from '../systems/level-gui-render-system';
import LevelInputSystem from '../systems/level-input-system';
import LevelLogRenderSystem from '../systems/level-log-render-system';
import LevelLootRenderSystem from '../systems/level-loot-render-system';
import LevelMapScreen from './level-map-screen';
import LevelMerchantSystem from '../systems/level-merchant-system';
import LevelMobRenderSystem from '../systems/level-mob-render-system';
import LevelMovementSystem from '../systems/level-movement-system';
import LevelParticleRenderSystem from '../systems/level-particle-render-system';
import LevelPickupSystem from '../systems/level-pickup-system';
import LevelProjectileRenderSystem from '../systems/level-projectile-render-system';
import LevelRenderSystem from '../systems/level-render-system';
import LevelStatisticEffectSystem from '../systems/level-statistic-effect-system';
import LevelUseItemSystem from '../systems/level-use-item-system';
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
    this._updateSystems = null;
    this._renderSystems = null;
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

    const logRenderSystem = new LevelLogRenderSystem(this, renderer, entityManager);
    const guiRenderSystem = new LevelGuiRenderSystem(this, renderer, entityManager);
    const particleRenderSystem = new LevelParticleRenderSystem(this, renderer, entityManager);
    const lootRenderSystem = new LevelLootRenderSystem(this, renderer, entityManager);

    this._renderSystems = [
      new LevelRenderSystem(this, renderer, entityManager),
      lootRenderSystem,
      new LevelMobRenderSystem(this, renderer, entityManager),
      new LevelProjectileRenderSystem(this, renderer, entityManager),
      new LevelFogOfWarRenderSystem(this, renderer, entityManager),
      particleRenderSystem,
      guiRenderSystem,
      logRenderSystem
    ];

    for (const renderSystem of this._renderSystems) {
      renderSystem.initialize(entities);
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
        logRenderSystem.addMessage(msg);
      })
      .on('show-merchant-screen', merchant => {
        this.screenManager.add(new MerchantShopScreen(this, merchant.id));
      });

    const movementSystem = new LevelMovementSystem(renderer, entityManager)
      .on('level-movement-system.leave-boss-level', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName), new WorldScreen()]);
      })
      .on('level-movement-system.enter-world-gateway', () => {
        this.screenManager.add(new WorldScreen());
      })
      .on('level-movement-system.enter-victory-gateway', () => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('victory')]);
      })
      .on('level-movement-system.enter-level-gateway', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName)]);
      })
      .on('level-movement-system.enter-boss-gateway', (fromLevelName, toLevelName) => {
        LoadingScreen.load(this.screenManager, true, [new LevelScreen(fromLevelName, toLevelName)]);
      });

    const combatSystem = new LevelCombatSystem(renderer, entityManager)
      .on('level-combat-system.show-attack-hit', (attack, point) => {
        particleRenderSystem.showAttackHit(attack, point);
      })
      .on('level-combat-system.defeat', () => {
        LoadingScreen.load(this.screenManager, true, [new FinalScreen('defeat')]);
      })
      .on('level-combat-system.show-money', money => {
        lootRenderSystem.showMoney(money);
      })
      .on('level-combat-system.show-mob-death', mob => {
        particleRenderSystem.showMobDeath(mob);
      })
      .on('level-combat-system.level-up', () => {
        guiRenderSystem.showLevelUpMsg();
      })
      .on('level-combat-system.add-log-message', msg => {
        logRenderSystem.addMessage(msg);
      });

    const containerSystem = new LevelContainerOpenSystem(renderer, entityManager)
      .on('level-container-system.open-container', container => {
        particleRenderSystem.showContainerOpen(container);
      })
      .on('level-container-system.show-container-loot', loot => {
        lootRenderSystem.showContainerLoot(loot);
        particleRenderSystem.showLoot(loot);
      });

    const itemPickupSystem = new LevelPickupSystem(renderer, entityManager)
      .on('level-pickup-system.pick-up-item', this._removeEntitySprites.bind(this))
      .on('level-pickup-system.pick-up-money', this._removeEntitySprites.bind(this));

    this._updateSystems = [
      movementSystem,
      combatSystem,
      new LevelStatisticEffectSystem(renderer, entityManager),
      containerSystem,
      itemPickupSystem,
      new LevelUseItemSystem(renderer, entityManager),
      new LevelMerchantSystem(renderer, entityManager),
      new LevelCleanupSystem(renderer, entityManager)
    ];

    for (const updateSystem of this._updateSystems) {
      updateSystem.initialize(entities);
    }

    this._aiSystems = [
      new LevelAiHeroSystem(renderer, entityManager),
      new LevelAiRandomWandererSystem(renderer, entityManager),
      new LevelAiSeekerSystem(renderer, entityManager)
    ];

    for (const aiSystem of this._aiSystems) {
      aiSystem
        .on('level-update-system.show-attack-hit', (attack, point) => {
          particleRenderSystem.showAttackHit(attack, point);
        })
        .initialize(entities);
    }
  }

  unload(entities) {
    const systems = [...this._aiSystems, ...this._renderSystems, ...this._updateSystems, this._inputSystem];
    for (const system of systems) {
      this._unloadSystem(system, entities);
    }
  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {
    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    if (!this.isActive) {
      return;
    }

    for (const system of this._aiSystems) {
      system.process(gameTime, entities);
    }

    for (const system of this._updateSystems) {
      system.process(gameTime, entities);
    }
  }

  handleInput(gameTime, entities, input) {
    super.handleInput(gameTime, entities, input);

    if (this.isActive) {
      this._inputSystem.process(gameTime, entities, input);
    }
  }

  draw(gameTime, entities) {
    super.draw(gameTime, entities);

    for (const system of this._renderSystems) {
      system.process(gameTime, entities);
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
