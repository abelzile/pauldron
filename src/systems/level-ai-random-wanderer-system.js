import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
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
  
  processEnteringState(mobEnt, ents) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    if (!aiComp.hasStateChanged) { return; }

    aiComp.updatePreviousStateToCurrent();

    switch (aiComp.state) {

      case AiRandomWandererComponent.State.AttackWarmingUp: {
        
        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.AttackWarmingUp];

        break;
        
      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {
        
        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.AttackCoolingDown];

        break;
        
      }
      case AiRandomWandererComponent.State.Attacking: {
        
        mobEnt.get('MovementComponent').zeroAll();

        const heroEnt = this.entityManager.heroEntity;
        let timeLeftInCurrentState = 200;
        const attackImplementEnt = this.selectAttackImplement(mobEnt, ents);

        if (attackImplementEnt) {

          const weaponStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');
          timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

          if (this.canBeAttacked(heroEnt) && this.shouldAttack(mobEnt, heroEnt, weaponStatCompsMap[Const.Statistic.Range].currentValue)) {

            const weaponComp = attackImplementEnt.getFirst('MeleeWeaponComponent',
                                                           'RangedWeaponComponent',
                                                           'RangedMagicSpellComponent');

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

        }

        aiComp.timeLeftInCurrentState = timeLeftInCurrentState;

        break;
        
      }
      case AiRandomWandererComponent.State.KnockingBack: {
        
        const movementComp = mobEnt.get('MovementComponent');
        movementComp.movementAngle = aiComp.transitionData.hitAngle;
        movementComp.velocityVector.zero();
        movementComp.directionVector.set(Math.cos(movementComp.movementAngle), Math.sin(movementComp.movementAngle));

        aiComp.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.KnockingBack];

        break;
        
      }
      case AiRandomWandererComponent.State.Waiting: {
        
        mobEnt.get('MovementComponent').zeroAll();
        aiComp.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.Waiting];

        break;
        
      }
      case AiRandomWandererComponent.State.Wandering: {
        
        const movementComp = mobEnt.get('MovementComponent');
        movementComp.movementAngle = MathUtils.random(0.0, Const.RadiansOf360Degrees, true);
        movementComp.velocityVector.zero();
        movementComp.directionVector.set(Math.sin(movementComp.movementAngle), Math.cos(movementComp.movementAngle));

        aiComp.timeLeftInCurrentState = AiRandomWandererComponent.StateTime[AiRandomWandererComponent.State.Wandering];

        break;
        
      }
        
    }

  }

  processState(gameTime, mobEnt, ents) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    switch (aiComp.state) {

      case AiRandomWandererComponent.State.AttackWarmingUp: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.attack();

        break;

      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wait();

        break;

      }
      case AiRandomWandererComponent.State.Attacking: {

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.attackCoolDown();

        break;

      }
      case AiRandomWandererComponent.State.KnockingBack: {

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wait();

        break;

      }
      case AiRandomWandererComponent.State.Waiting: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeaponEnt) {

          const allowedToAttackHero = this.canBeAttacked(heroEnt);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this.entityManager.currentLevelEntity, mobEnt, heroEnt);
            if (canSeeHero) {

              const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
              const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
              if (shouldAttackHero) {

                aiComp.attackWarmUp();

                break;

              }

            }

          }

        }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wander();

        break;

      }
      case AiRandomWandererComponent.State.Wandering: {

        const heroEnt = this.entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeaponEnt) {

          const allowedToAttackHero = this.canBeAttacked(heroEnt);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this.entityManager.currentLevelEntity, mobEnt, heroEnt);
            if (canSeeHero) {

              const range = mobWeaponEnt.get('StatisticComponent', c => c.name === Const.Statistic.Range).currentValue;
              const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, range);
              if (shouldAttackHero) {

                aiComp.attackWarmUp();
                break;

              }

            }

          }

        }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.wait();

        break;

      }

    }

    aiComp.timeLeftInCurrentState -= gameTime;

  }

}