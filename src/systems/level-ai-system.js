import * as Const from '../const';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import Line from '../line';
import Point from '../point';
import System from '../system';
import * as EntityFinders from '../entity-finders';


export default class LevelAiSystem extends System {

  constructor() {
    super();
  }

  hitByWeapon(entity, weaponEnt) {
    
    return entity &&
      weaponEnt &&
      weaponEnt.has('MeleeAttackComponent') &&
      weaponEnt.get('MeleeAttackComponent').containsHitEntityId(entity.id);
    
  }
  
  canSee(currentLevelEnt, attackerEnt, targetEnt) {

    const sourcePositionComp = attackerEnt.get('PositionComponent');
    const targetPositionComp = targetEnt.get('PositionComponent');

    const lineBetween = new Line(Math.round(sourcePositionComp.position.x),
                                 Math.round(sourcePositionComp.position.y),
                                 Math.round(targetPositionComp.position.x),
                                 Math.round(targetPositionComp.position.y));

    const collisionLayer = currentLevelEnt.get('TileMapComponent').collisionLayer;

    return !_.some(lineBetween.calculateBresenham(), point => collisionLayer[point.y][point.x] > 0);

  }
   
  shouldAttack(attackerEnt, targetEnt, range) {

    const targetCurrentBoundingRect = targetEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(targetEnt.get('PositionComponent').position);
    const targetCurrentBoundingCenterPoint = targetCurrentBoundingRect.getCenter();

    const sourceCurrentBoundingRect = attackerEnt.get('BoundingRectangleComponent').rectangle.getOffsetBy(attackerEnt.get('PositionComponent').position);
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
    /*
  allowedToAttack(heroEntity) {
    return (heroEntity.get('HeroComponent').currentState !== HeroComponent.State.KnockingBack);
  }*/

  meleeWeaponAttack(attackerEnt, targetEnt, attackImplementEnt) {

    const attackerPositionComp = attackerEnt.get('PositionComponent');
    const targetPositionComp = targetEnt.get('PositionComponent');
    const attackImplementStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');
    const meleeAttackComp = attackImplementEnt.get('MeleeAttackComponent');
    meleeAttackComp.setAttack(new Point(attackerPositionComp.position.x + 0.5, attackerPositionComp.position.y + 0.5),
                              targetPositionComp.position,
                              attackImplementStatCompsMap[Const.Statistic.Range].currentValue,
                              attackImplementStatCompsMap[Const.Statistic.Arc].currentValue,
                              attackImplementStatCompsMap[Const.Statistic.Duration].currentValue,
                              attackImplementStatCompsMap[Const.Statistic.Damage].currentValue);


    const hitAngle = Math.atan2(targetPositionComp.position.y - attackerPositionComp.position.y,
                                targetPositionComp.position.x - attackerPositionComp.position.x);

    meleeAttackComp.addHit(targetEnt.id, hitAngle);

  }

  rangedWeaponAttack(entityManager, attackerEnt, targetEnt, attackImplementEnt, attackImplementCompName) {

    const attackImplementStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');
    const attackImplementComp = attackImplementEnt.get(attackImplementCompName);

    const projectileEnt = entityManager.buildFromProjectileTemplate(attackImplementComp.projectileType);
    entityManager.add(projectileEnt);

    const mobPositionComp = attackerEnt.get('PositionComponent');
    const heroPositionComp = targetEnt.get('PositionComponent');
    const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
    const mobBoundingRectComp = attackerEnt.get('BoundingRectangleComponent');

    const offsetX = (mobBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
    const offsetY = (mobBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

    const projectileStartPos = new Point(mobPositionComp.position.x + mobBoundingRectComp.rectangle.x + offsetX,
      mobPositionComp.position.y + mobBoundingRectComp.rectangle.y + offsetY);

    const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
    projectileAttackComp.set(attackerEnt.id,
                             projectileStartPos,
                             heroPositionComp.position,
                             attackImplementStatCompsMap[Const.Statistic.Range].currentValue,
                             attackImplementStatCompsMap[Const.Statistic.Damage].currentValue);

    const projectilePositionComp = projectileEnt.get('PositionComponent');
    projectilePositionComp.position.setFrom(mobPositionComp.position);

    const projectileMovementComp = projectileEnt.get('MovementComponent');
    projectileMovementComp.movementAngle = projectileAttackComp.angle;
    projectileMovementComp.velocityVector.zero();
    projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                               Math.sin(projectileMovementComp.movementAngle));

  }

  trySpendSpellPoints(attackerEnt, attackImplementEnt) {

    const statEffectComps = attackImplementEnt.getAll('StatisticEffectComponent');
    const mobStatCompsMap = attackerEnt.getAllKeyed('StatisticComponent', 'name');
    const magicPointsComp = mobStatCompsMap[Const.Statistic.MagicPoints];
    const spellPoints = magicPointsComp.currentValue;
    const spellCost = _.find(statEffectComps, c => c.name === Const.Statistic.MagicPoints).value;

    if (spellPoints >= Math.abs(spellCost)) {

      magicPointsComp.currentValue += spellCost;

      return true;

    } else {

      return false; // can't cast. not enough mp.

    }

  }

  selectAttackImplement(mobEnt, ents) {

    const weaponHandRefComp = mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);
    const memoryRefComp = mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

    let weapon;
    if (weaponHandRefComp) {
      weapon = EntityFinders.findById(ents, weaponHandRefComp.entityId);
    }

    let spell;
    if (memoryRefComp) {

      spell = EntityFinders.findById(ents, memoryRefComp.entityId);

      if (!spell.has('RangedMagicSpellComponent')) {
        spell = undefined;
      }

      //TODO: check mob has MP left. if not, can't cast.

    }

    //TODO: determine how to select best attack implement.

    if (spell) { return spell; }

    return weapon;

  }

}
