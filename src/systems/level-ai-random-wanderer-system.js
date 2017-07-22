import * as _ from 'lodash';
import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import LevelAiSystem from './level-ai-system';
import EntityReferenceComponent from '../components/entity-reference-component';
import StatisticComponent from '../components/statistic-component';
import * as EntityUtils from '../utils/entity-utils';

export default class LevelAiRandomWandererSystem extends LevelAiSystem {
  constructor(renderer, entityManager) {
    super(renderer, entityManager);
  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {}

  aiEntitiesToProcess() {
    return EntityFinders.findMobs(this.entityManager.getEntitiesAdjacentToHero(), 'AiRandomWandererComponent');
  }

  processEnteringState(mob, entities) {
    const hero = this.entityManager.heroEntity;
    const ai = mob.get('AiRandomWandererComponent');

    if (!ai.hasStateChanged) {
      return;
    }

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {
      case AiRandomWandererComponent.State.AttackWarmingUp: {
        mob.get('MovementComponent').zeroAll();

        this.faceToward(mob, hero);

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (attackImplement.has('RangedAttackComponent')) {
          const attackerCenter = EntityUtils.getPositionedBoundingRect(mob).getCenter();
          attackerCenter.x -= 0.5; // assumption is projectile is always 1 tile in size.
          attackerCenter.y -= 0.5;

          attackImplement.get('RangedAttackComponent').setAngle(attackerCenter, hero.get('PositionComponent').position);
        }

        const warmUpDuration = attackImplement.get(
          'StatisticComponent',
          c => c.name === Const.Statistic.WarmUpDuration
        );
        ai.timeLeftInCurrentState = warmUpDuration ? warmUpDuration.maxValue : 500;

        break;
      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {
        mob.get('MovementComponent').zeroAll();
        ai.timeLeftInCurrentState =
          AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.AttackCoolingDown];

        break;
      }
      case AiRandomWandererComponent.State.Attacking: {
        mob.get('MovementComponent').zeroAll();

        this.faceToward(mob, hero);

        ai.timeLeftInCurrentState = 0;

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (!attackImplement) {
          break;
        }

        const weaponStats = attackImplement.getAllKeyed('StatisticComponent', 'name');

        if (!this.canBeAttacked(hero) || !this.isInRange(mob, hero, weaponStats[Const.Statistic.Range].currentValue)) {
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
      case AiRandomWandererComponent.State.KnockingBack: {
        const movement = mob.get('MovementComponent');
        movement.movementAngle = ai.transitionData.angle;
        movement.velocityVector.zero();

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
        movement.movementAngle = _.random(0.0, Const.RadiansOf360Degrees, true);
        movement.velocityVector.zero();

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
        const attackImplement = this.selectAttackImplement(mob, entities);

        if (!attackImplement) {
          break;
        }

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
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
      case AiRandomWandererComponent.State.AttackCoolingDown: {
        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
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
      case AiRandomWandererComponent.State.Attacking: {
        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.attackCoolDown();

        break;
      }
      case AiRandomWandererComponent.State.KnockingBack: {
        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.wait();

        break;
      }
      case AiRandomWandererComponent.State.Waiting: {
        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        const mobHand1Slot = mob.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);
        const mobWeapon = mobHand1Slot ? EntityFinders.findById(entities, mobHand1Slot.entityId) : null;

        if (mobWeapon && this.canBeAttacked(hero) && this.canSee(this.entityManager.currentLevelEntity, mob, hero)) {
          const range = mobWeapon.get('StatisticComponent', StatisticComponent.isRange).currentValue;

          if (this.isInRange(mob, hero, range)) {
            ai.attackWarmUp();
            break;
          }
        }

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.wander();

        break;
      }
      case AiRandomWandererComponent.State.Wandering: {
        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        const mobHand1Slot = mob.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);
        const mobWeapon = mobHand1Slot ? EntityFinders.findById(entities, mobHand1Slot.entityId) : null;

        if (mobWeapon && this.canBeAttacked(hero) && this.canSee(this.entityManager.currentLevelEntity, mob, hero)) {
          const range = mobWeapon.get('StatisticComponent', StatisticComponent.isRange).currentValue;

          if (this.isInRange(mob, hero, range)) {
            ai.attackWarmUp();
            break;
          }
        }

        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.wait();

        break;
      }
    }

    ai.timeLeftInCurrentState -= gameTime;
  }
}
