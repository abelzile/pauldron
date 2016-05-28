import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as MathUtils from '../utils/math-utils';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import Line from '../line';
import Point from '../point';
import System from '../system';


export default class LevelAiRandomWandererSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

  processEntities(gameTime, ents) {

    const heroEnt = this._entityManager.heroEntity;
    const mobEnts = EntityFinders.findMobs(this._entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt), 'AiRandomWandererComponent');

    for (const mobEnt of mobEnts) {

      this._processEnteringState(mobEnt, ents);

      this._processState(gameTime, mobEnt, ents);

    }

  }

  _processEnteringState(mobEnt, ents) {

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

        const weaponEnt = EntityFinders.findById(ents,
                                                 mobEnt.get('EntityReferenceComponent',
                                                            c => c.typeId === Const.InventorySlot.Hand1).entityId);
        const weaponComp = weaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
        const weaponStatCompsMap = weaponEnt.getAllKeyed('StatisticComponent', 'name');
        const heroEnt = this._entityManager.heroEntity;
        const allowedToAttackHero = this.allowedToAttack(heroEnt);
        const shouldAttackHero = this.shouldAttack(mobEnt,
                                                   heroEnt,
                                                   weaponStatCompsMap[Const.Statistic.Range].currentValue);

        if (allowedToAttackHero && shouldAttackHero) {

          switch (ObjectUtils.getTypeName(weaponComp)) {

            case 'MeleeWeaponComponent': {
              
              const mobPositionComp = mobEnt.get('PositionComponent');

              const meleeAttackComp = weaponEnt.get('MeleeAttackComponent');
              meleeAttackComp.setAttack(new Point(mobPositionComp.position.x + 0.5, mobPositionComp.position.y + 0.5),
                                        heroEnt.get('PositionComponent').position,
                                        weaponStatCompsMap[Const.Statistic.Range].currentValue,
                                        weaponStatCompsMap[Const.Statistic.Arc].currentValue,
                                        weaponStatCompsMap[Const.Statistic.Duration].currentValue,
                                        weaponStatCompsMap[Const.Statistic.Damage].currentValue);

              const heroPositionComp = heroEnt.get('PositionComponent');

              const hitAngle = Math.atan2(heroPositionComp.position.y - mobPositionComp.position.y,
                                          heroPositionComp.position.x - mobPositionComp.position.x);

              meleeAttackComp.addHit(heroEnt.id, hitAngle);

              break;
              
            }
            case 'RangedWeaponComponent': {
              
              const projectileEnt = this._entityManager.buildFromProjectileTemplate(weaponComp.projectile);
              this._entityManager.add(projectileEnt);

              const mobPositionComp = mobEnt.get('PositionComponent');
              const heroPositionComp = heroEnt.get('PositionComponent');
              const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
              const mobBoundingRectComp = mobEnt.get('BoundingRectangleComponent');

              const offsetX = (mobBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
              const offsetY = (mobBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

              const projectileStartPos = new Point(mobPositionComp.position.x + mobBoundingRectComp.rectangle.x + offsetX,
                                                   mobPositionComp.position.y + mobBoundingRectComp.rectangle.y + offsetY);

              const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
              projectileAttackComp.set(mobEnt.id,
                                       projectileStartPos,
                                       heroPositionComp.position,
                                       weaponStatCompsMap[Const.Statistic.Range].currentValue,
                                       weaponStatCompsMap[Const.Statistic.Damage].currentValue);

              const projectilePositionComp = projectileEnt.get('PositionComponent');
              projectilePositionComp.position.setFrom(mobPositionComp.position);

              const projectileMovementComp = projectileEnt.get('MovementComponent');
              projectileMovementComp.movementAngle = projectileAttackComp.angle;
              projectileMovementComp.velocityVector.zero();
              projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                                         Math.sin(projectileMovementComp.movementAngle));

              break;
              
            }

          }

        }

        aiComp.timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

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

  _processState(gameTime, mobEnt, ents) {

    const aiComp = mobEnt.get('AiRandomWandererComponent');

    switch (aiComp.state) {

      case AiRandomWandererComponent.State.AttackWarmingUp: {
        
        const heroEnt = this._entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents,
                                                     heroEnt.get('EntityReferenceComponent',
                                                                 c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        if (aiComp.hasTimeLeftInCurrentState) { break; }

        aiComp.attack();

        break;
        
      }
      case AiRandomWandererComponent.State.AttackCoolingDown: {
        
        const heroEnt = this._entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents,
                                                     heroEnt.get('EntityReferenceComponent',
                                                                 c => c.typeId === Const.InventorySlot.Hand1).entityId);

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
        
        const heroEnt = this._entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents,
                                                     heroEnt.get('EntityReferenceComponent',
                                                                 c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents,
                                                    mobEnt.get('EntityReferenceComponent',
                                                               c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeaponEnt) {

          const allowedToAttackHero = this.allowedToAttack(heroEnt);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this._entityManager.currentLevelEntity, mobEnt, heroEnt);
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
        
        const heroEnt = this._entityManager.heroEntity;
        const heroWeaponEnt = EntityFinders.findById(ents,
                                                     heroEnt.get('EntityReferenceComponent',
                                                                 c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (this.hitByWeapon(mobEnt, heroWeaponEnt)) { break; }

        const mobWeaponEnt = EntityFinders.findById(ents,
                                                    mobEnt.get('EntityReferenceComponent',
                                                               c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (mobWeaponEnt) {

          const allowedToAttackHero = this.allowedToAttack(heroEnt);
          if (allowedToAttackHero) {

            const canSeeHero = this.canSee(this._entityManager.currentLevelEntity, mobEnt, heroEnt);
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

  hitByWeapon(entity, weaponEnt) {

    if (entity && weaponEnt && weaponEnt.has('MeleeAttackComponent')) {
      return weaponEnt.get('MeleeAttackComponent').containsHitEntityId(entity.id);
    }

    return false;

  }

  canSee(currentLevelEnt, sourceEnt, targetEnt) {

    const sourcePositionComp = sourceEnt.get('PositionComponent');
    const targetPositionComp = targetEnt.get('PositionComponent');

    const lineBetween = new Line(Math.round(sourcePositionComp.position.x),
      Math.round(sourcePositionComp.position.y),
      Math.round(targetPositionComp.position.x),
      Math.round(targetPositionComp.position.y));

    const collisionLayer = currentLevelEnt.get('TileMapComponent').collisionLayer;

    return !_.some(lineBetween.calculateBresenham(), point => collisionLayer[point.y][point.x] > 0);

  }

  shouldAttack(sourceEnt, targetEnt, range) {

    const targetCurrentBoundingRect = targetEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(targetEnt.get('PositionComponent').position);
    const targetCurrentBoundingCenterPoint = targetCurrentBoundingRect.getCenter();

    const sourceCurrentBoundingRect = sourceEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(sourceEnt.get('PositionComponent').position);
    const sourceCurrentBoundingCenterPoint = sourceCurrentBoundingRect.getCenter();

    // 1. get line from sourceCurrentBoundingCenterPoint to targetCurrentBoundingCenterPoint that is length of mob weapon attack.

    const testHitAngle = Math.atan2(targetCurrentBoundingCenterPoint.y - sourceCurrentBoundingCenterPoint.y,
                                    targetCurrentBoundingCenterPoint.x - sourceCurrentBoundingCenterPoint.x);

    const testLine = new Line(sourceCurrentBoundingCenterPoint.x,
      sourceCurrentBoundingCenterPoint.y,
      sourceCurrentBoundingCenterPoint.x + range * Math.cos(testHitAngle),
      sourceCurrentBoundingCenterPoint.y + range * Math.sin(testHitAngle));

    // 2. check if attack could hit by seeing if line intersects any of hero's targetCurrentBoundingRect lines
    // (Also potentially check each end of the testLine if required in case of a weapon with a very short attack
    // that falls entirely in the mob bounding rect). If yes, do attack officially on the line from step 1, if not, don't.

    return targetCurrentBoundingRect.intersectsWith(testLine) ||
      targetCurrentBoundingRect.intersectsWith(testLine.point1) ||
      targetCurrentBoundingRect.intersectsWith(testLine.point2);

  }

  allowedToAttack(heroEntity) {
    return (heroEntity.get('HeroComponent').state !== HeroComponent.State.KnockingBack);
  }

}