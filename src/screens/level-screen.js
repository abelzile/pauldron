import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import AbilitiesScreen from './abilities-screen';
import Circle from '../circle';
import FinalScreen from './final-screen';
import InventoryScreen from './inventory-screen';
import LevelCleanupSystem from '../systems/level-cleanup-system';
import LevelCombatSystem from '../systems/level-combat-system';
import LevelContainerOpenSystem from '../systems/level-container-open-system';
import LevelDebugRenderSystem from '../systems/level-debug-render-system';
import LevelFogOfWarRenderSystem from '../systems/level-fog-of-war-render-system';
import LevelGuiRenderSystem from '../systems/level-gui-render-system';
import LevelInputSystem from '../systems/level-input-system';
import LevelLogRenderSystem from '../systems/level-log-render-system';
import LevelLootRenderSystem from '../systems/level-loot-render-system';
import LevelMapScreen from './level-map-screen';
import LevelMerchantSystem from '../systems/level-merchant-system';
import LevelMobAttackAiSystem from '../systems/level-mob-attack-ai-system';
import LevelMobMovementAiSystem from '../systems/level-mob-movement-ai-system';
import LevelMobRenderSystem from '../systems/level-mob-render-system';
import LevelMovementSystem from '../systems/level-movement-system';
import LevelParticleRenderSystem from '../systems/level-particle-render-system';
import LevelPickupSystem from '../systems/level-pickup-system';
import LevelProjectileRenderSystem from '../systems/level-projectile-render-system';
import LevelRenderSystem from '../systems/level-render-system';
import LevelStatisticEffectSystem from '../systems/level-statistic-effect-system';
import LoadingScreen from './loading-screen';
import MerchantShopScreen from './merchant-shop-screen';
import Screen from '../screen';
import UseItemSystem from '../systems/use-item-system';
import Vector from '../vector';
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
    this._maxShakeTime = 200;
    this._maxShakeRadius = 5;
    this._currentShakeTime = 0;
    this.shakeOffset = new Vector();
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
      logRenderSystem,
      new LevelDebugRenderSystem(this, renderer, entityManager)
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
      })
      .on('use-hotbar-item', hotbarSlotIndex => {
        guiRenderSystem.showUseHotbarItem(hotbarSlotIndex);
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
        this.initSmallShake();
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
      .on('level-pickup-system.pick-up-money', e => {
        this._removeEntitySprites(e);
        guiRenderSystem.showMoneyIncrease();
      });

    this._updateSystems = [
      movementSystem,
      combatSystem,
      new LevelStatisticEffectSystem(renderer, entityManager),
      containerSystem,
      itemPickupSystem,
      new UseItemSystem(renderer, entityManager),
      new LevelMerchantSystem(renderer, entityManager),
      new LevelCleanupSystem(renderer, entityManager)
    ];

    for (const updateSystem of this._updateSystems) {
      updateSystem.initialize(entities);
    }

    this._aiSystems = [
      new LevelMobMovementAiSystem(entityManager),
      new LevelMobAttackAiSystem(entityManager),
    ];

    for (const aiSystem of this._aiSystems) {
      aiSystem
        .on('entering-waking', (mob) => {
          particleRenderSystem.showMobWaking(mob);
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

    if (this._currentShakeTime > 0) {
      const radius = (this._currentShakeTime / this._maxShakeTime) * this._maxShakeRadius;
      const pos = Circle.randomPointOnCircumfrence(Const.ZeroVector, radius);
      this.shakeOffset.x = Math.round(pos.x);
      this.shakeOffset.y = Math.round(pos.y);
    }

    for (const system of this._aiSystems) {
      system.process(gameTime, entities);
    }

    for (const system of this._updateSystems) {
      system.process(gameTime, entities);
    }

    this._currentShakeTime -= gameTime;
    if (this._currentShakeTime <= 0) {
      this.shakeOffset.zero();
    }
  }

  initSmallShake() {
    this.shakeOffset.zero();
    this._maxShakeTime = Const.MsPerFrame * 8;
    this._maxShakeRadius = 3;
    this._currentShakeTime = this._maxShakeTime;
  }

  applyShakeOffset(pos) {
    pos.x += this.shakeOffset.x;
    pos.y += this.shakeOffset.y;
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

  translateWorldPositionToScreenPosition(worldPos, screenTopLeftPos, applyShake = true) {
    const pos = ScreenUtils.translateWorldPositionToScreenPosition(worldPos, screenTopLeftPos);

    if (applyShake) {
      this.applyShakeOffset(pos);
    }

    return pos;
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
