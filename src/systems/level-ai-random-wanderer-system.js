import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as MathUtils from '../utils/math-utils';
import _ from 'lodash';
import LevelAiSystem from './level-ai-system';


export default class LevelAiRandomWandererSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {
    super(renderer, entityManager);
  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

  aiEntitiesToProcess() {
    return EntityFinders.findMobs(this.entityManager.entitySpatialGrid.getAdjacentEntities(this.entityManager.heroEntity), 'AiRandomWandererComponent');
  }
  
  processEnteringState(mob, entities) {

    const ai = mob.get('AiRandomWandererComponent');

    if (!ai.hasStateChanged) { return; }

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {

      case AiRandomWandererComponent.State.AttackWarmingUp: {
        
        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.AttackWarmingUp];

        break;
        
      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {
        
        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.AttackCoolingDown];

        break;
        
      }
      case AiRandomWandererComponent.State.Attacking: {
        
        mob.get('MovementComponent').zeroAll();

        const hero = this.entityManager.heroEntity;
        let timeLeftInCurrentState = 200;
        const attackImplement = this.selectAttackImplement(mob, entities);

        if (attackImplement) {

          const weaponStats = attackImplement.getAllKeyed('StatisticComponent', 'name');
          timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

          if (this.canBeAttacked(hero) && this.shouldAttack(mob, hero, weaponStats[Const.Statistic.Range].currentValue)) {

            const weaponComp = attackImplement.getFirst('WeaponComponent', 'RangedMagicSpellComponent');

            switch (weaponComp.constructor.name) {

              case 'MeleeWeaponComponent':
              {

                this.meleeWeaponAttack(mob, hero, attackImplement);

                break;

              }
              case 'RangedMagicSpellComponent':
              {

                if (this.trySpendSpellPoints(mob, attackImplement)) {

                  this.rangedWeaponAttack(mob, hero, attackImplement, 'RangedMagicSpellComponent');

                }

                break;

              }
              case 'RangedWeaponComponent':
              {

                this.rangedWeaponAttack(mob, hero, attackImplement, 'RangedWeaponComponent');

                break;

              }

            }

          }

        }

        ai.timeLeftInCurrentState = timeLeftInCurrentState;

        break;
        
      }
      case AiRandomWandererComponent.State.KnockingBack: {
        
        const movement = mob.get('MovementComponent');
        movement.movementAngle = ai.transitionData.angle;
        movement.velocityVector.zero();
        movement.directionVector.set(Math.cos(movement.movementAngle), Math.sin(movement.movementAngle));

        ai.timeLeftInCurrentState = ai.transitionData.duration;

        break;
        
      }
      case AiRandomWandererComponent.State.Waiting: {
        
        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.Waiting];

        break;
        
      }
      case AiRandomWandererComponent.State.Wandering: {
        
        const movement = mob.get('MovementComponent');
        movement.movementAngle = MathUtils.random(0.0, Const.RadiansOf360Degrees, true);
        movement.velocityVector.zero();
        movement.directionVector.set(Math.sin(movement.movementAngle), Math.cos(movement.movementAngle));

        const facing = mob.get('FacingComponent');
        if (movement.directionVector.x > 0) {
          facing.facing = Const.Direction.East;
        } else if (movement.directionVector.x < 0) {
          facing.facing = Const.Direction.West;
        }

        ai.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.Wandering];

        break;
        
      }
        
    }

  }

  processState(gameTime, mob, entities) {

    const ai = mob.get('AiRandomWandererComponent');
    const hero = this.entityManager.heroEntity;

    switch (ai.state) {

      case AiRandomWandererComponent.State.AttackWarmingUp: {

        const heroWeapon = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mob, heroWeapon)) { break; }

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.attack();

        break;

      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {

        const heroWeapon = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mob, heroWeapon)) { break; }

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.wait();

        break;

      }
      case AiRandomWandererComponent.State.Attacking: {

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.attackCoolDown();

        break;

      }
      case AiRandomWandererComponent.State.KnockingBack: {

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.wait();

        break;

      }
      case AiRandomWandererComponent.State.Waiting: {

        const heroWeapon = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mob, heroWeapon)) { break; }

        const mobWeapon = EntityFinders.findById(entities, mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeapon) {

          const allowedToAttackHero = this.canBeAttacked(hero);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this.entityManager.currentLevelEntity, mob, hero);
            if (canSeeHero) {

              const range = mobWeapon.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
              const shouldAttackHero = this.shouldAttack(mob, hero, range);
              if (shouldAttackHero) {

                ai.attackWarmUp();

                break;

              }

            }

          }

        }

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.wander();

        break;

      }
      case AiRandomWandererComponent.State.Wandering: {

        const heroWeapon = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mob, heroWeapon)) { break; }

        const mobWeapon = EntityFinders.findById(entities, mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeapon) {

          const allowedToAttackHero = this.canBeAttacked(hero);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this.entityManager.currentLevelEntity, mob, hero);
            if (canSeeHero) {

              const range = mobWeapon.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
              const shouldAttackHero = this.shouldAttack(mob, hero, range);
              if (shouldAttackHero) {

                ai.attackWarmUp();
                break;

              }

            }

          }

        }

        if (ai.hasTimeLeftInCurrentState) { break; }

        ai.wait();

        break;

      }

    }

    ai.timeLeftInCurrentState -= gameTime;

  }

}