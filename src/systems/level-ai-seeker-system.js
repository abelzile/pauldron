import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import LevelAiSystem from '../systems/level-ai-system';


export default class LevelAiSeekerSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

    //TODO:These should be properties of mob/mob weapon and/or hero/hero weapon.
    this.AttackCoolDownTime = 1000;
    this.AttackWarmUpTime = 1000;
    this.KnockBackTime = 500;
    this.SeekTime = Number.MAX_SAFE_INTEGER;
    this.WaitTime = 4000;

    const state = AiSeekerComponent.State;
    this._currentStateFunc = Object.create(null);
    this._currentStateFunc[state.AttackWarmingUp] = this._doAttackWarmingUp;
    this._currentStateFunc[state.AttackCoolingDown] = this._doAttackCoolingDown;
    this._currentStateFunc[state.Attacking] = this._doAttacking;
    this._currentStateFunc[state.KnockingBack] = this._doKnockingBack;
    this._currentStateFunc[state.Seeking] = this._doSeeking;
    this._currentStateFunc[state.Waiting] = this._doWaiting;

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {

    for (const ent of ents) {

      if (ent.has('AiSeekerComponent')) {

        const aiComp = ent.get('AiSeekerComponent');
        const sm = aiComp.stateMachine;
        const state = AiSeekerComponent.State;

        //sm.onenterstate = function (event, from, to) { console.log(from + ' => ' + to); };

        sm['onenter' + state.AttackWarmingUp] = (event, from, to, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt) => {
          this.onEnterAttackWarmingUp(ent, this.AttackWarmUpTime);
        };

        sm['onenter' + state.AttackCoolingDown] = (event, from, to, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt) => {
          this.onEnterAttackCoolingDown(ent, this.AttackCoolDownTime);
        };

        sm['onenter' + state.Attacking] = (event, from, to, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt) => {
          this.onEnterAttacking(ent, mobWeaponEnt, heroEnt, this._entityManager);
        };

        sm['onenter' + state.KnockingBack] = (event, from, to, attackerEnt, attackerWeaponEnt) => {
          this.onEnterKnockingBack(ent, attackerEnt, attackerWeaponEnt, this.KnockBackTime);
        };

        sm['onenter' + state.Waiting] = (event, from, to, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt) => {
          this.onEnterWaiting(ent, this.WaitTime);
        };

        sm['onenter' + state.Seeking] = (event, from, to, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt) => {

          ent.get('MovementComponent').zeroAll();

          aiComp.timeLeftInCurrentState = this.SeekTime;

        };

      }

    }

  }

  processEntities(gameTime, ents) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const heroEnt = this._entityManager.heroEntity;
    const weaponEnts = EntityFinders.findWeapons(ents);
    const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);
    const mobEnts = EntityFinders.findMobs(this._entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt), 'AiSeekerComponent');

    for (const mobEnt of mobEnts) {

      const aiComp = mobEnt.get('AiSeekerComponent');

      const mobWeaponEnt = EntityFinders.findById(weaponEnts, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      this._currentStateFunc[aiComp.currentState].call(this, currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime);

      aiComp.timeLeftInCurrentState -= gameTime;

    }

  }

  _doSeeking(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (!mobWeaponEnt) {
      aiComp.stateMachine.stop();
      return;
    }

    const allowedToAttackHero = this.allowedToAttack(heroEnt);
    if (!allowedToAttackHero) {
      aiComp.stateMachine.stop();
      return;
    }

    const canSeeHero = this.canSee(currentLevelEnt, mobEnt, heroEnt);
    if (!canSeeHero) {
      aiComp.stateMachine.stop();
      return;
    }

    const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
    const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
    if (shouldAttackHero) {
      aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);
      return;
    }

    const heroPosComp = heroEnt.get('PositionComponent');
    const mobPosComp = mobEnt.get('PositionComponent');

    const angleToHero = Math.atan2(heroPosComp.position.y - mobPosComp.position.y, heroPosComp.position.x - mobPosComp.position.x);

    const movementComp = mobEnt.get('MovementComponent');
    movementComp.movementAngle = angleToHero;
    movementComp.velocityVector.zero();
    movementComp.directionVector.set(Math.cos(movementComp.movementAngle), Math.sin(movementComp.movementAngle));

  }

  _doWaiting(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (!mobWeaponEnt) {
      aiComp.timeLeftInCurrentState = this.WaitTime;
      return;
    }

    const allowedToAttackHero = this.allowedToAttack(heroEnt);
    if (!allowedToAttackHero) {
      aiComp.timeLeftInCurrentState = this.WaitTime;
      return;
    }

    const canSeeHero = this.canSee(currentLevelEnt, mobEnt, heroEnt);
    if (!canSeeHero) {
      aiComp.timeLeftInCurrentState = this.WaitTime;
      return;
    }

    const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
    const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
    if (shouldAttackHero) {
      aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);
      return;
    }

    aiComp.stateMachine.seek(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doKnockingBack(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.stop(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doAttackWarmingUp(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doAttacking(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.attack(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }

  _doAttackCoolingDown(currentLevelEnt, mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt, gameTime) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { return; }

    if (aiComp.hasTimeLeftInCurrentState) { return; }

    aiComp.stateMachine.stop(mobEnt, mobWeaponEnt, heroEnt, heroWeaponEnt);

  }


}
