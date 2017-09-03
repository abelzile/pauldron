import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as MathUtils from '../utils/math-utils';
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
        //TODO
        break;
      }
      case Const.MobMovementAiState.Waking: {
        this._enteringWaking(mob, hero);
        break;
      }
      case Const.MobMovementAiState.KnockingBack: {
        this._enteringKnockingBack(mob);
        break;
      }
      case Const.MobMovementAiState.Waiting: {
        this._enteringWaiting(mob);
        break;
      }
      case Const.MobMovementAiState.Moving: {
        this._enteringMoving(mob);
        break;
      }
      case Const.MobMovementAiState.CoolingDown: {
        this._enteringCoolingDown(mob);
        break;
      }
    }
  }

  processState(gameTime, mob, entities) {
    const ai = mob.get('MobMovementAiComponent');
    const hero = this.entityManager.heroEntity;

    switch (ai.state) {
      case Const.MobMovementAiState.Sleeping: {
        this._doSleeping(mob, hero);
        break;
      }
      case Const.MobMovementAiState.Waking: {
        this._doWaking(mob);
        break;
      }
      case Const.MobMovementAiState.KnockingBack: {
        this._doKnockingBack(mob);
        break;
      }
      case Const.MobMovementAiState.Waiting: {
        this._doWaiting(entities, mob, hero);
        break;
      }
      case Const.MobMovementAiState.Moving: {
        this._doMoving(entities, mob, hero);
        break;
      }
      case Const.MobMovementAiState.CoolingDown: {
        this._doCoolingDown(mob);
        break;
      }
    }

    ai.timeLeftInCurrentState -= gameTime;
  }

  _enteringMoving(mob) {
    const ai = mob.get('MobMovementAiComponent');
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
  }

  _enteringWaiting(mob) {
    const ai = mob.get('MobMovementAiComponent');

    switch (ai.mobMovementAiType) {
      case Const.MobMovementAiType.Hero:
        break;
      default:
        mob.get('MovementComponent').zeroAll();
        break;
    }

    ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waiting];
  }

  _enteringKnockingBack(mob) {
    const moveAi = mob.get('MobMovementAiComponent');
    const movement = mob.get('MovementComponent');
    movement.movementAngle = moveAi.transitionData.angle;
    movement.velocityVector.zero();

    moveAi.timeLeftInCurrentState = moveAi.transitionData.duration;

    /*const attackAi = mob.get('MobAttackAiComponent');
    if (attackAi.state !== Const.MobAttackAiState.Attacking) {
      attackAi.attackCoolDown();
    }*/
  }

  _enteringWaking(mob, hero) {
    const ai = mob.get('MobMovementAiComponent');

    this.emit('entering-waking', mob);
    this.faceToward(mob, hero);

    ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waking];
  }

  _doMoving(entities, mob, target) {
    const ai = mob.get('MobMovementAiComponent');

    if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
      return;
    }

    const heroWeapon = EntityFinders.findById(
      entities,
      target.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
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
        const mobComp = mob.get('MobComponent');

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        const mobPosition = mob.get('PositionComponent');
        const mobMovement = mob.get('MovementComponent');
        const targetPosition = target.get('PositionComponent');

        if (mobComp.isFlying) {
          const currentAngle = Math.atan2(
            mobPosition.y - mobPosition.previousPosition.y,
            mobPosition.x - mobPosition.previousPosition.x
          );
          const angleToHero = this._angleTo(mobPosition, targetPosition);

          mobMovement.movementAngle = this._angleTowards(currentAngle, angleToHero, 0.06);

          const facing = mob.get('FacingComponent');
          if (mobMovement.directionVector.x > 0) {
            facing.facing = Const.Direction.East;
          } else if (mobMovement.directionVector.x < 0) {
            facing.facing = Const.Direction.West;
          }
        } else {
          if (!this.canSee(this.entityManager._currentLevelEntity, mob, target)) {
            ai.wait();
            break;
          }

          mobMovement.movementAngle = this._angleTo(mobPosition, targetPosition);

          const facing = mob.get('FacingComponent');
          if (mobMovement.directionVector.x > 0) {
            facing.facing = Const.Direction.East;
          } else if (mobMovement.directionVector.x < 0) {
            facing.facing = Const.Direction.West;
          }
        }

        break;
      }
    }
  }

  _doSleeping(mob, target) {
    const ai = mob.get('MobMovementAiComponent');

    if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
      return;
    }

    if (this.canSee(this.entityManager._currentLevelEntity, mob, target)) {
      ai.wake();
    }
  }

  _doWaiting(entities, mob, target) {
    const ai = mob.get('MobMovementAiComponent');

    if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
      return;
    }

    const heroWeapon = EntityFinders.findById(
      entities,
      target.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
    );

    if (this.hitByWeapon(mob, heroWeapon)) {
      return;
    }

    switch (ai.mobMovementAiType) {
      case Const.MobMovementAiType.Wanderer:
        if (ai.hasTimeLeftInCurrentState) {
          break;
        }

        ai.move();

        break;
      case Const.MobMovementAiType.Seeker:
        const mobComp = mob.get('MobComponent');

        if (!mobComp.isFlying) {
          if (!this.canBeAttacked(target) || !this.canSee(this.entityManager.currentLevelEntity, mob, target)) {
            ai.timeLeftInCurrentState = ai.stateTime[Const.MobMovementAiState.Waiting];
            break;
          }
        }

        ai.move();

        break;
    }
  }

  _doWaking(mob) {
    const ai = mob.get('MobMovementAiComponent');

    if (ai.mobMovementAiType === Const.MobMovementAiType.Hero) {
      return;
    }

    if (!ai.hasTimeLeftInCurrentState) {
      ai.wait();
    }
  }

  _doKnockingBack(mob) {
    const ai = mob.get('MobMovementAiComponent');

    if (!ai.hasTimeLeftInCurrentState) {
      ai.wait();
    }
  }

  _angleTo(sourcePosition, targetPosition) {
    return Math.atan2(
      targetPosition.position.y - sourcePosition.position.y,
      targetPosition.position.x - sourcePosition.position.x
    );
  }

  _angleTowards(angle, target, amount) {
    const diff = MathUtils.normalizeAngle(angle - target, 0.0);

    if (diff > 0) {
      return target + Math.max(0, diff - amount);
    } else {
      return target + Math.min(0, diff + amount);
    }
  }

  _enteringCoolingDown(mob) {
    const ai = mob.get('MobMovementAiComponent');

    switch (ai.mobMovementAiType) {
      case Const.MobMovementAiType.Hero:
        break;
      default:
        mob.get('MovementComponent').zeroAll();
        break;
    }

    ai.timeLeftInCurrentState = ai.transitionData.duration;
  }

  _doCoolingDown(mob) {
    const ai = mob.get('MobMovementAiComponent');

    if (!ai.hasTimeLeftInCurrentState) {
      ai.wait();
    }
  }
}
