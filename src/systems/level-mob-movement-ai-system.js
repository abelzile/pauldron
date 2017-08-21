import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import EntityReferenceComponent from '../components/entity-reference-component';
import LevelMobAiSystem from './level-mob-ai-system';

export default class LevelMobMovementAiSystem extends LevelMobAiSystem {
  constructor(entityManager) {
    super(entityManager);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {}

  processEntities(gameTime, entities, input) {
    const mobs = EntityFinders.findMobs(entities);
    mobs.unshift(this.entityManager.heroEntity);

    for (const mob of mobs) {
      this.processEnteringState(mob, entities);
      this.processState(gameTime, mob, entities);
    }
  }

  processEnteringState(mob, entities) {
    const ai = mob.get('MobMovementAiComponent');
    const hero = this.entityManager.heroEntity;

    if (!ai.hasStateChanged) {
      return;
    }

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {
      case Const.MobMovementAiState.Sleeping: {
        break;
      }
      case Const.MobMovementAiState.Waking: {
        this.emit('entering-waking', mob);
        this.faceToward(mob, hero);

        ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waking];

        break;
      }
      case Const.MobMovementAiState.KnockingBack: {
        const movement = mob.get('MovementComponent');
        movement.movementAngle = ai.transitionData.angle;
        movement.velocityVector.zero();

        ai.timeLeftInCurrentState = ai.transitionData.duration;

        break;
      }
      case Const.MobMovementAiState.Waiting: {
        switch (ai.mobMovementAiType) {
          case Const.MobMovementAiType.Hero:
            break;
          default:
            mob.get('MovementComponent').zeroAll();
            break;
        }

        ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waiting];

        break;
      }
      case Const.MobMovementAiState.Moving: {
        const movement = mob.get('MovementComponent');

        switch (ai.mobMovementAiType) {
          case Const.MobMovementAiType.Hero:
            break;
          case Const.MobMovementAiType.Wanderer:
            movement.movementAngle = _.random(0.0, Const.RadiansOf360Degrees, true);
            movement.velocityVector.zero();

            const facing = mob.get('FacingComponent');
            if (movement.directionVector.x > 0) {
              facing.facing = Const.Direction.East;
            } else if (movement.directionVector.x < 0) {
              facing.facing = Const.Direction.West;
            }

            break;
          case Const.MobMovementAiType.Seeker:
            movement.zeroAll();

            break;
        }

        ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Moving];

        break;
      }
    }
  }

  processState(gameTime, mob, entities) {
    const ai = mob.get('MobMovementAiComponent');
    const hero = this.entityManager.heroEntity;

    switch (ai.state) {
      case Const.MobMovementAiState.Sleeping: {
        if (ai.mobMovementAiType !== Const.MobMovementAiType.Hero) {
          const canSeeHero = this.canSee(this.entityManager._currentLevelEntity, mob, hero);

          if (canSeeHero) {
            ai.wake();
          }
        }
        break;
      }
      case Const.MobMovementAiState.Waking: {
        if (ai.mobMovementAiType !== Const.MobMovementAiType.Hero) {
          if (!ai.hasTimeLeftInCurrentState) {
            ai.wait();
          }
        }
        break;
      }
      case Const.MobMovementAiState.KnockingBack: {
        if (!ai.hasTimeLeftInCurrentState) {
          ai.wait();
        }
        break;
      }
      case Const.MobMovementAiState.Waiting: {
        if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
          break;
        }

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        switch (ai.mobMovementAiType) {
          case Const.MobMovementAiType.Wanderer:
            if (ai.hasTimeLeftInCurrentState) {
              break;
            }

            ai.move();

            break;
          case Const.MobMovementAiType.Seeker:
            if (!this.canBeAttacked(hero) || !this.canSee(this.entityManager.currentLevelEntity, mob, hero)) {
              ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waiting];
              break;
            }

            ai.move();

            break;
        }

        break;
      }
      case Const.MobMovementAiState.Moving: {
        if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
          break;
        }

        const heroWeapon = EntityFinders.findById(
          entities,
          hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
        );

        switch (ai.mobMovementAiType) {
          case Const.MobMovementAiType.Wanderer: {
            if (this.hitByWeapon(mob, heroWeapon)) {
              break;
            }

            if (ai.hasTimeLeftInCurrentState) {
              break;
            }

            ai.wait();

            break;
          }
          case Const.MobMovementAiType.Seeker: {
            if (this.hitByWeapon(mob, heroWeapon)) {
              break;
            }

            const canSeeHero = this.canSee(this.entityManager._currentLevelEntity, mob, hero);
            if (!canSeeHero) {
              ai.wait();
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

            const facing = mob.get('FacingComponent');
            if (movement.directionVector.x > 0) {
              facing.facing = Const.Direction.East;
            } else if (movement.directionVector.x < 0) {
              facing.facing = Const.Direction.West;
            }

            break;
          }
        }

        break;
      }
    }

    ai.timeLeftInCurrentState -= gameTime;
  }
}
