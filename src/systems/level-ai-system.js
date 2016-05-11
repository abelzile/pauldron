import * as Const from '../const';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import Line from '../line';
import Point from '../point';
import System from '../system';


export default class LevelAiSystem extends System {

  constructor() {
    super();
  }

  onEnterAttackWarmingUp(mobEnt, stateTime) {

    mobEnt.get('MovementComponent').zeroAll();
    mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent').timeLeftInCurrentState = stateTime;

  }

  onEnterAttackCoolingDown(mobEnt, stateTime) {

    mobEnt.get('MovementComponent').zeroAll();
    mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent').timeLeftInCurrentState = stateTime;

  }

  onEnterAttacking(mobEnt, mobWeaponEnt, heroEnt, entityManager) {

    mobEnt.get('MovementComponent').zeroAll();

    const weaponComp = mobWeaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
    const weaponStatCompsMap = mobWeaponEnt.getAllKeyed('StatisticComponent', 'name');
    const allowedToAttackHero = this.allowedToAttack(heroEnt);
    const shouldAttackHero = this.shouldAttack(mobEnt, heroEnt, weaponStatCompsMap[Const.Statistic.Range].currentValue);

    if (allowedToAttackHero && shouldAttackHero) {

      switch (ObjectUtils.getTypeName(weaponComp)) {

        case 'MeleeWeaponComponent':
        {
          const mobPositionComp = mobEnt.get('PositionComponent');

          const meleeAttackComp = mobWeaponEnt.get('MeleeAttackComponent');
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
        case 'RangedWeaponComponent':
        {
          const projectileEnt = entityManager.buildFromProjectileTemplate(weaponComp.projectile);
          entityManager.add(projectileEnt);

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

    mobEnt.getFirst('AiRandomWandererComponent',
                    'AiSeekerComponent').timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

  }

  onEnterKnockingBack(mobEnt, attackerEnt, attackerWeaponEnt, stateTime) {

    const isMeleeAttack = !!attackerWeaponEnt;
    let hitAngle;

    if (isMeleeAttack) {

      const hitObj = attackerWeaponEnt.get('MeleeAttackComponent').findHitEntityObj(mobEnt.id);

      hitAngle = hitObj.hitAngle;

    } else {

      hitAngle = attackerEnt.get('ProjectileAttackComponent').angle;

    }

    const movementComp = mobEnt.get('MovementComponent');
    movementComp.movementAngle = hitAngle;
    movementComp.velocityVector.zero();
    movementComp.directionVector.set(Math.cos(movementComp.movementAngle), Math.sin(movementComp.movementAngle));

    mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent').timeLeftInCurrentState = stateTime;

  }

  onEnterWaiting(mobEnt, stateTime) {

    mobEnt.get('MovementComponent').zeroAll();
    mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent').timeLeftInCurrentState = stateTime;

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
    return (heroEntity.get('HeroComponent').currentState !== HeroComponent.State.KnockingBack);
  }

}
