import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import LevelAiSystem from './level-ai-system';

export default class LevelAiSeekerSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {
    super(renderer, entityManager);
  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

  aiEntitiesToProcess() {
    return EntityFinders.findMobs(
      this.entityManager.entitySpatialGrid.getAdjacentEntities(this.entityManager.heroEntity),
      'AiSeekerComponent'
    );
  }
  
  processEnteringState(mob, entities) {

    const ai = mob.get('AiSeekerComponent');

    if (!ai.hasStateChanged) {
      return;
    }

    const hero = this.entityManager.heroEntity;

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {

      case AiSeekerComponent.State.AttackWarmingUp: {

        mob.get('MovementComponent').zeroAll();

        this.faceToward(mob, hero);

        ai.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.AttackWarmingUp];

        break;

      }
      case AiSeekerComponent.State.AttackCoolingDown: {

        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.AttackCoolingDown];

        break;

      }
      case AiSeekerComponent.State.Attacking: {

        mob.get('MovementComponent').zeroAll();

        this.faceToward(mob, hero);

        ai.timeLeftInCurrentState = 0;

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (!attackImplement) {
          break;
        }

        const weaponStats = attackImplement.getAllKeyed('StatisticComponent', 'name');

        if (
          !this.canBeAttacked(hero) ||
          !this.isInRange(mob, hero, weaponStats[Const.Statistic.Range].currentValue)
        ) {
          break;
        }

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        const weaponComp = attackImplement.getOfFirstMatchingType('WeaponComponent', 'RangedMagicSpellComponent');

        switch (weaponComp.constructor.name) {

          case 'MeleeWeaponComponent': {

            this.meleeWeaponAttack(mob, hero, attackImplement);

            break;

          }
          case 'RangedMagicSpellComponent': {

            if (this.trySpendSpellPoints(mob, attackImplement)) {
              this.rangedAttack(mob, hero, attackImplement, 'RangedMagicSpellComponent');
            }

            break;

          }
          case 'RangedWeaponComponent': {

            this.rangedAttack(mob, hero, attackImplement, 'RangedWeaponComponent');

            break;

          }

        }

        break;

      }
      case AiSeekerComponent.State.KnockingBack: {

        const movement = mob.get('MovementComponent');
        movement.movementAngle = ai.transitionData.angle;
        movement.velocityVector.zero();
        /*movement.directionVector.set(
          Math.cos(movement.movementAngle),
          Math.sin(movement.movementAngle)
        );*/

        ai.timeLeftInCurrentState = ai.transitionData.duration;

        break;

      }
      case AiSeekerComponent.State.Waiting: {

        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];

        break;

      }
      case AiSeekerComponent.State.Seeking: {

        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Seeking];

        break;

      }

    }

  }

  processState(gameTime, mob, entities) {

    const ai = mob.get('AiSeekerComponent');
    const hero = this.entityManager.heroEntity;

    switch (ai.state) {

      case AiSeekerComponent.State.AttackWarmingUp: {

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (!attackImplement) {
          break;
        }

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        if (!this.canBeAttacked(hero)) {
          ai.wait();
          break;
        }

        /*const rangeStat = attackImplement.get('StatisticComponent', c => c.name === Const.Statistic.Range);

        if (!this.isInRange(mob, hero, rangeStat.currentValue)) {
          ai.wait();
          break;
        }*/

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.attack();

        break;

      }
      case AiSeekerComponent.State.AttackCoolingDown: {

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.wait();

        break;

      }
      case AiSeekerComponent.State.Attacking: {

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.attackCoolDown();

        break;

      }
      case AiSeekerComponent.State.KnockingBack: {

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.wait();

        break;

      }
      case AiSeekerComponent.State.Seeking: {

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        const mobWeapon = EntityFinders.findById(
          entities,
          mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (!mobWeapon) {
          ai.wait();
          break;
        }

        const allowedToAttackHero = this.canBeAttacked(hero);
        if (!allowedToAttackHero) {
          ai.wait();
          break;
        }

        const canSeeHero = this.canSee(this.entityManager._currentLevelEntity, mob, hero);
        if (!canSeeHero) {
          ai.wait();
          break;
        }

        const range = mobWeapon.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
        const shouldAttackHero = this.isInRange(mob, hero, range);
        if (shouldAttackHero) {
          ai.attackWarmUp();
          break;
        }

        const heroPosition = hero.get('PositionComponent');
        const mobPosition = mob.get('PositionComponent');

        const angleToHero = Math.atan2(
          heroPosition.position.y - mobPosition.position.y,
          heroPosition.position.x - mobPosition.position.x
        );

        const movement = mob.get('MovementComponent');
        movement.movementAngle = angleToHero;
        movement.velocityVector.zero();
        /*movement.directionVector.set(
          Math.cos(movement.movementAngle),
          Math.sin(movement.movementAngle)
        );*/

        const facing = mob.get('FacingComponent');
        if (movement.directionVector.x > 0) {
          facing.facing = Const.Direction.East;
        } else if (movement.directionVector.x < 0) {
          facing.facing = Const.Direction.West;
        }

        break;

      }
      case AiSeekerComponent.State.Waiting: {

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        const mobWeapon = EntityFinders.findById(
          entities,
          mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (
          !mobWeapon ||
          !this.canBeAttacked(hero) ||
          !this.canSee(this.entityManager.currentLevelEntity, mob, hero)
        ) {
          ai.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];
          break;
        }

        const range = mobWeapon.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;

        if (this.isInRange(mob, hero, range)) {
          ai.attackWarmUp();
          break;
        }

        ai.seek();

        break;

      }

    }

    ai.timeLeftInCurrentState -= gameTime;

  }
  
}
