import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import _ from 'lodash';
import Line from '../line';
import Point from '../point';
import System from '../system';


export default class LevelAiSystem extends System {

  constructor(renderer, entityManager) {
    
    super();

    this.renderer = renderer;
    this.entityManager = entityManager;
    
  }
  
  processEntities(gameTime, ents) {

    const mobEnts = this.aiEntitiesToProcess();

    for (const mobEnt of mobEnts) {

      this.processEnteringState(mobEnt, ents);

      this.processState(gameTime, mobEnt, ents);

    }

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
   
  isInRange(attackerEnt, targetEnt, range) {

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

  meleeWeaponAttack(attackerEnt, targetEnt, attackImplementEnt) {

    const attackerPositionComp = attackerEnt.get('PositionComponent');
    const targetPositionComp = targetEnt.get('PositionComponent');
    const attackImplementStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');
    const meleeAttackComp = attackImplementEnt.get('MeleeAttackComponent');
    meleeAttackComp.init(new Point(attackerPositionComp.position.x + 0.5, attackerPositionComp.position.y + 0.5),
                         new Point(targetPositionComp.position.x + 0.5, targetPositionComp.position.y + 0.5),
                         attackImplementStatCompsMap[Const.Statistic.Range].currentValue,
                         attackImplementStatCompsMap[Const.Statistic.Arc].currentValue,
                         attackImplementStatCompsMap[Const.Statistic.Duration].currentValue,
                         attackImplementStatCompsMap[Const.Statistic.Damage].currentValue,
                         attackImplementStatCompsMap[Const.Statistic.KnockBackDuration].currentValue);

    const hitAngle = Math.atan2(targetPositionComp.position.y - attackerPositionComp.position.y,
                                targetPositionComp.position.x - attackerPositionComp.position.x);

    meleeAttackComp.addHit(targetEnt.id, hitAngle);

  }

  rangedWeaponAttack(attackerEnt, target, attackImplementEnt, attackImplementCompName) {

    let targetPos;

    switch (target.constructor.name) {

      case 'Entity':

        // Current assumption is hero won't attack entity directly with a ranged attack, just a position. So if target is an entity, it is the hero.
        // This assumption may not hold up in the future and we may have to check entity's components to see what entity is.
        const heroPositionComp = target.get('PositionComponent');
        targetPos = heroPositionComp.position;

        break;

      case 'Point':
      case 'Vector':

        targetPos = target;
        break;

      default:

        throw new Error('target arg required.');

    }

    const attackImplementStatCompsMap = attackImplementEnt.getAllKeyed('StatisticComponent', 'name');
    const attackImplementComp = attackImplementEnt.get(attackImplementCompName);

    const projectileEnt = this.entityManager.buildFromProjectileTemplate(attackImplementComp.projectileType);
    this.entityManager.add(projectileEnt);

    const attackerPosComp = attackerEnt.get('PositionComponent');
    const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
    const attackerBoundingRectComp = attackerEnt.get('BoundingRectangleComponent');

    const offsetX = (attackerBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
    const offsetY = (attackerBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

    const projectileStartPos = new Point(attackerPosComp.position.x + attackerBoundingRectComp.rectangle.x + offsetX,
                                         attackerPosComp.position.y + attackerBoundingRectComp.rectangle.y + offsetY);

    const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
    projectileAttackComp.init(attackerEnt.id,
                              projectileStartPos,
                              targetPos,
                              attackImplementStatCompsMap[Const.Statistic.Range].currentValue,
                              attackImplementStatCompsMap[Const.Statistic.Damage].currentValue,
                              attackImplementStatCompsMap[Const.Statistic.KnockBackDuration].currentValue);

    const projectilePositionComp = projectileEnt.get('PositionComponent');
    projectilePositionComp.position.setFrom(attackerPosComp.position);

    const projectileMovementComp = projectileEnt.get('MovementComponent');
    projectileMovementComp.movementAngle = projectileAttackComp.angle;
    projectileMovementComp.velocityVector.zero();
    projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                               Math.sin(projectileMovementComp.movementAngle));

    if (attackImplementEnt.has('RangedAttackComponent')) {
      attackImplementEnt.get('RangedAttackComponent').angle = projectileAttackComp.angle;
    }

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

  selectAttackImplement(attackEnt, ents) {

    const weaponHandRefComp = attackEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);
    const memoryRefComp = attackEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);

    let weapon;
    if (weaponHandRefComp) {
      weapon = EntityFinders.findById(ents, weaponHandRefComp.entityId);
    }

    let spell;
    if (memoryRefComp) {

      spell = EntityFinders.findById(ents, memoryRefComp.entityId);

      if (spell.has('RangedMagicSpellComponent')) {

        const attackerMpStatComp = attackEnt.getAll('StatisticComponent', c => c.name === Const.Statistic.MagicPoints);
        const spellPoints = attackerMpStatComp.currentValue;

        const spellCostComp = spell.getAll('StatisticEffectComponent', c => c.name === Const.Statistic.MagicPoints);
        const spellCost = spellCostComp.value;

        if (spellPoints < Math.abs(spellCost)) {
          spell = undefined;  // can't cast. not enough mp.
        }

      } else {

        // not ranged, at present not an attack spell.
        spell = undefined;

      }

    }

    //TODO: determine how to select best attack implement.

    if (spell) { return spell; }

    return weapon;

  }

  canBeAttacked(entity) {

    const aiComp = entity.get('AiComponent');

    if (!aiComp) { throw new Error('AI component not found.'); }

    switch (aiComp.constructor.name) {

      case 'HeroComponent':
        return aiComp.state !== HeroComponent.State.KnockingBack;
      case 'AiRandomWandererComponent':
        return aiComp.state !== AiRandomWandererComponent.State.KnockingBack;
      case 'AiSeekerComponent':
        return aiComp.state !== AiSeekerComponent.State.KnockingBack;
      default:
        throw new Error('Unknown AI component: ' + aiComp.constructor.name);

    }

  }

  faceHero(mob, hero) {

    const mobFacing = mob.get('FacingComponent');
    const mobPosition = mob.get('PositionComponent');
    const heroPosition = hero.get('PositionComponent');

    if (mobPosition.x < heroPosition.x) {
      mobFacing.facing = Const.Direction.East;
    } else if (mobPosition.x > heroPosition.x) {
      mobFacing.facing = Const.Direction.West;
    }

  }

}
