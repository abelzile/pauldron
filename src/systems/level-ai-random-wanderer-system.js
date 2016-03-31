import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as MathUtils from '../utils/math-utils';
import _ from 'lodash';
import LevelAiSystem from '../systems/level-ai-system';


export default class LevelAiRandomWandererSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

    //TODO:These should be properties of mob/mob weapon and/or hero/hero weapon.
    this.AttackCoolDownTime = 1000;
    this.AttackWarmUpTime = 1000;
    this.KnockBackTime = 500;
    this.WaitTime = 4000;
    this.WanderTime = 500;

    const state = AiRandomWandererComponent.State;
    this._currentStateFunc = Object.create(null);
    this._currentStateFunc[state.AttackWarmingUp] = this._doAttackWarmingUp;
    this._currentStateFunc[state.AttackCoolingDown] = this._doAttackCoolingDown;
    this._currentStateFunc[state.Attacking] = this._doAttacking;
    this._currentStateFunc[state.KnockingBack] = this._doKnockingBack;
    this._currentStateFunc[state.Waiting] = this._doWaiting;
    this._currentStateFunc[state.Wandering] = this._doWandering;

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {

    for (const ent of ents) {

      if (ent.has('AiRandomWandererComponent')) {

        const aiComp = ent.get('AiRandomWandererComponent');
        const sm = aiComp.stateMachine;
        const state = AiRandomWandererComponent.State;

        //sm.onenterstate = function (event, from, to) { console.log(from + ' => ' + to); };

        sm['onenter' + state.AttackWarmingUp] = (event, from, to, mobEntity, mobWeaponEntity, heroEntity, heroWeaponEntity) => {
          this.onEnterAttackWarmingUp(ent, this.AttackWarmUpTime);
        };

        sm['onenter' + state.AttackCoolingDown] = (event, from, to, mobEntity, mobWeaponEntity, heroEntity, heroWeaponEntity) => {
          this.onEnterAttackCoolingDown(ent, this.AttackCoolDownTime);
        };

        sm['onenter' + state.Attacking] = (event, from, to, mobEntity, mobWeaponEntity, heroEntity, heroWeaponEntity) => {
          this.onEnterAttacking(ent, mobWeaponEntity, heroEntity, this._entityManager);
        };

        sm['onenter' + state.KnockingBack] = (event, from, to, attackerEntity, attackerWeaponEntity) => {
          this.onEnterKnockingBack(ent, attackerEntity, attackerWeaponEntity, this.KnockBackTime);
        };

        sm['onenter' + state.Waiting] = (event, from, to, mobEntity, mobWeaponEntity, heroEntity, heroWeaponEntity) => {
          this.onEnterWaiting(ent, this.WaitTime);
        };

        sm['onenter' + state.Wandering] = (event, from, to, mobEntity, mobWeaponEntity, heroEntity, heroWeaponEntity) => {

          const movementComp = ent.get('MovementComponent');
          movementComp.movementAngle = MathUtils.random(0.0, Const.RadiansOf360Degrees, true);
          movementComp.velocityVector.zero();
          movementComp.directionVector.set(Math.sin(movementComp.movementAngle), Math.cos(movementComp.movementAngle));

          aiComp.timeLeftInCurrentState = this.WanderTime;

        };

      }

    }

  }

  processEntities(gameTime, ents) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const heroEnt = this._entityManager.heroEntity;
    const weaponEnts = EntityFinders.findWeapons(ents);
    const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);
    const mobEnts = EntityFinders.findMobs(this._entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt), 'AiRandomWandererComponent');

    for (const mobEnt of mobEnts) {

      const aiComp = mobEnt.get('AiRandomWandererComponent');
      const mobWeaponEnt = EntityFinders.findById(weaponEnts, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      this._currentStateFunc[aiComp.currentState].call(this, currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime);

      aiComp.timeLeftInCurrentState -= gameTime;

    }

  }

  _doWandering(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (mobWeaponEnt) {

      const allowedToAttackHero = this.allowedToAttack(heroEnt);
      if (allowedToAttackHero) {

        const canSeeHero = this.canSee(currentLevelEnt, mobEnt, heroEnt);
        if (canSeeHero) {

          const mobWeaponComp = mobWeaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
          const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, mobWeaponComp.range);
          if (shouldAttackHero) {

            aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);
            return;

          }

        }

      }

    }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.stop(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doWaiting(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (mobWeaponEnt) {

      const allowedToAttackHero = this.allowedToAttack(heroEnt);
      if (allowedToAttackHero) {

        const canSeeHero = this.canSee(currentLevelEnt, mobEnt, heroEnt);
        if (canSeeHero) {

          const mobWeaponComp = mobWeaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
          const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, mobWeaponComp.range);
          if (shouldAttackHero) {

            aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);
            return;

          }

        }

      }
      
    }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.go(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doKnockingBack(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.stop(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doAttackWarmingUp(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doAttacking(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);
    
  }

  _doAttackCoolingDown(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.stop(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

}
