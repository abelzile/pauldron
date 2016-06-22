import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
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
    return EntityFinders.findMobs(this.entityManager.entitySpatialGrid.getAdjacentEntities(this.entityManager.heroEntity), 'AiSeekerComponent');
  }
  
  processEnteringState(mobEnt, ents) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    if (!aiComp.hasStateChanged) { return; }

    aiComp.updatePreviousStateToCurrent();

    switch (aiComp.state) {

      case AiSeekerComponent.State.AttackWarmingUp: {

        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.AttackWarmingUp];

        break;

      }
      case AiSeekerComponent.State.AttackCoolingDown: {

        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.AttackCoolingDown];

        break;

      }
      case AiSeekerComponent.State.Attacking: {

        mobEnt.get('MovementComponent').zeroAll();

        aiComp.timeLeftInCurrentState = 200;

        const heroEnt = this.entityManager.heroEntity;
        const attackImplementEnt = this.selectAttackImplement(mobEnt, ents);

        if (!attackImplementEnt) { break; }

        const weaponStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');

        aiComp.timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

        if (this.canBeAttacked(heroEnt) && this.shouldAttack(mobEnt, heroEnt, weaponStatCompsMap[Const.Statistic.Range].currentValue)) {

          const weaponComp = attackImplementEnt.getFirst('WeaponComponent', 'RangedMagicSpellComponent');

          switch (weaponComp.constructor.name) {

            case 'MeleeWeaponComponent':
            {

              this.meleeWeaponAttack(mobEnt, heroEnt, attackImplementEnt);

              break;

            }
            case 'RangedMagicSpellComponent':
            {

              if (this.trySpendSpellPoints(mobEnt, attackImplementEnt)) {

                this.rangedWeaponAttack(this.entityManager, mobEnt, heroEnt, attackImplementEnt, 'RangedMagicSpellComponent');

              }

              break;

            }
            case 'RangedWeaponComponent':
            {

              this.rangedWeaponAttack(this.entityManager, mobEnt, heroEnt, attackImplementEnt, 'RangedWeaponComponent');

              break;

            }

          }

        }

        break;

      }
      case AiSeekerComponent.State.KnockingBack: {

        const movementComp = mobEnt.get('MovementComponent');
        movementComp.movementAngle = aiComp.transitionData.hitAngle;
        movementComp.velocityVector.zero();
        movementComp.directionVector.set(Math.cos(movementComp.movementAngle), Math.sin(movementComp.movementAngle));

        aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.KnockingBack];

        break;

      }
      case AiSeekerComponent.State.Waiting: {

        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];

        break;

      }
      case AiSeekerComponent.State.Seeking: {

        mobEnt.get('MovementComponent').zeroAll();

        aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Seeking];

        break;

      }

    }

  }

  processState(gameTime, mobEnt, ents) {

    const aiComp = mobEnt.get('AiSeekerComponent');

    switch (aiComp.state) {

      case AiSeekerComponent.State.AttackWarmingUp: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.attack();

        break;

      }
      case AiSeekerComponent.State.AttackCoolingDown: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wait();

        break;

      }
      case AiSeekerComponent.State.Attacking: {

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.attackCoolDown();

        break;

      }
      case AiSeekerComponent.State.KnockingBack: {

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wait();

        break;

      }
      case AiSeekerComponent.State.Seeking: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (!mobWeaponEnt) {
          aiComp.wait();
          break;
        }

        const allowedToAttackHero = this.canBeAttacked(heroEnt);
        if (!allowedToAttackHero) {
          aiComp.wait();
          break;
        }

        const canSeeHero = this.canSee(this.entityManager._currentLevelEntity, mobEnt, heroEnt);
        if (!canSeeHero) {
          aiComp.wait();
          break;
        }

        const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
        const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
        if (shouldAttackHero) {
          aiComp.attackWarmUp();
          break;
        }

        const heroPosComp = heroEnt.get('PositionComponent');
        const mobPosComp = mobEnt.get('PositionComponent');

        const angleToHero = Math.atan2(heroPosComp.position.y - mobPosComp.position.y,
                                       heroPosComp.position.x - mobPosComp.position.x);

        const movementComp = mobEnt.get('MovementComponent');
        movementComp.movementAngle = angleToHero;
        movementComp.velocityVector.zero();
        movementComp.directionVector.set(Math.cos(movementComp.movementAngle), Math.sin(movementComp.movementAngle));

        break;

      }
      case AiSeekerComponent.State.Waiting: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents,
                                                     heroEnt.get('EntityReferenceComponent',
                                                                 c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents,
                                                    mobEnt.get('EntityReferenceComponent',
                                                               c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (!mobWeaponEnt) {
          aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];
          break;
        }

        const allowedToAttackHero = this.canBeAttacked(heroEnt);
        if (!allowedToAttackHero) {
          aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];
          break;
        }

        const canSeeHero = this.canSee(this.entityManager.currentLevelEntity, mobEnt, heroEnt);
        if (!canSeeHero) {
          aiComp.timeLeftInCurrentState = AiSeekerComponent.StateTime[AiSeekerComponent.State.Waiting];
          break;
        }

        const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
        const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
        if (shouldAttackHero) {
          aiComp.attackWarmUp();
          break;
        }

        aiComp.seek();

        break;

      }

    }

    aiComp.timeLeftInCurrentState -= gameTime;

  }
  
}
