import * as _ from 'lodash';
import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import Line from '../line';
import System from '../system';
import Vector from '../vector';

export default class LevelAiSystem extends System {
  constructor(renderer, entityManager) {
    super();

    this.renderer = renderer;
    this.entityManager = entityManager;
  }

  processEntities(gameTime, ents) {
    const mobs = this.aiEntitiesToProcess();

    for (let i = 0; i < mobs.length; ++i) {
      const mob = mobs[i];

      this.processEnteringState(mob, ents);
      this.processState(gameTime, mob, ents);
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

    const lineBetween = Line.pnew(
      Math.round(sourcePositionComp.position.x),
      Math.round(sourcePositionComp.position.y),
      Math.round(targetPositionComp.position.x),
      Math.round(targetPositionComp.position.y)
    );

    const collisionLayer = currentLevelEnt.get('TileMapComponent').collisionLayer;

    const canSee = !_.some(lineBetween.calculateBresenham(), point => collisionLayer[point.y][point.x] > 0);

    lineBetween.pdispose();

    return canSee;
  }

  isInRange(attackerEnt, targetEnt, range) {
    const targetCurrentBoundingRect = EntityUtils.getPositionedBoundingRect(targetEnt);
    const targetCurrentBoundingCenterPoint = targetCurrentBoundingRect.getCenter();
    const sourceCurrentBoundingRect = EntityUtils.getPositionedBoundingRect(attackerEnt);
    const sourceCurrentBoundingCenterPoint = sourceCurrentBoundingRect.getCenter();

    // 1. get line from sourceCurrentBoundingCenterPoint to targetCurrentBoundingCenterPoint that is length of mob weapon attack.

    const testHitAngle = Math.atan2(
      targetCurrentBoundingCenterPoint.y - sourceCurrentBoundingCenterPoint.y,
      targetCurrentBoundingCenterPoint.x - sourceCurrentBoundingCenterPoint.x
    );

    const testLine = Line.pnew(
      sourceCurrentBoundingCenterPoint.x,
      sourceCurrentBoundingCenterPoint.y,
      sourceCurrentBoundingCenterPoint.x + range * Math.cos(testHitAngle),
      sourceCurrentBoundingCenterPoint.y + range * Math.sin(testHitAngle)
    );

    // 2. check if attack could hit by seeing if line intersects any of hero's targetCurrentBoundingRect lines
    // (Also potentially check each end of the testLine if required in case of a weapon with a very short attack
    // that falls entirely in the mob bounding rect). If yes, do attack officially on the line from step 1, if not, don't.

    const isInRange = targetCurrentBoundingRect.intersectsWith(testLine) ||
      targetCurrentBoundingRect.intersectsWith(testLine.point1) ||
      targetCurrentBoundingRect.intersectsWith(testLine.point2);

    testLine.pdispose();

    return isInRange;
  }

  meleeWeaponAttack(attacker, target, attackImplement) {
    const targetCurrentBoundingRect = EntityUtils.getPositionedBoundingRect(target);
    const targetCurrentBoundingCenterPoint = targetCurrentBoundingRect.getCenter();
    const attackerCurrentBoundingRect = EntityUtils.getPositionedBoundingRect(attacker);
    const attackerCurrentBoundingCenterPoint = attackerCurrentBoundingRect.getCenter();
    const attackImplementStats = attackImplement.getAllKeyed('StatisticComponent', 'name');
    const attack = attackImplement.get('MeleeAttackComponent');
    attack.init(
      attackerCurrentBoundingCenterPoint,
      targetCurrentBoundingCenterPoint,
      attackImplementStats[Const.Statistic.Range].currentValue,
      attackImplementStats[Const.Statistic.Arc].currentValue,
      attackImplementStats[Const.Statistic.Duration].currentValue,
      attackImplementStats[Const.Statistic.Damage].currentValue
    );

    const hitAngle = Math.atan2(
      targetCurrentBoundingCenterPoint.y - attackerCurrentBoundingCenterPoint.y,
      targetCurrentBoundingCenterPoint.x - attackerCurrentBoundingCenterPoint.x
    );
    const hitPosition = attack.addHit(target.id, hitAngle, targetCurrentBoundingRect);

    this.emit('level-update-system.show-attack-hit', attack, hitPosition);
  }

  rangedAttack(attacker, target, attackImplement, attackImplementCompName) {
    const attackImplementComp = attackImplement.get(attackImplementCompName);
    const projectile = this._buildProjectile(attackImplementComp.projectileType, target, attacker, attackImplement);

    if (attackImplement.has('RangedAttackComponent')) {
      attackImplement.get('RangedAttackComponent').angle = projectile.get('ProjectileAttackComponent').angle;
    }

    this.entityManager.add(projectile);

    if (!attackImplementComp.projectileCount || attackImplementComp.projectileCount === 1) {
      return;
    }

    const angleIncr = Const.RadiansOf22Point5Degrees;
    let halfCount = Math.floor(attackImplementComp.projectileCount / 2);
    let mainAngle = projectile.get('ProjectileAttackComponent').angle;

    for (let i = 1; i <= halfCount; ++i) {
      this.entityManager.add(
        this._buildProjectile(
          attackImplementComp.projectileType,
          target,
          attacker,
          attackImplement,
          mainAngle + angleIncr * i
        )
      );
      this.entityManager.add(
        this._buildProjectile(
          attackImplementComp.projectileType,
          target,
          attacker,
          attackImplement,
          mainAngle - angleIncr * i
        )
      );
    }
  }

  _buildProjectile(projectileTypeId, target, attacker, attackImplement, angle = Number.NaN) {
    const projectile = this.entityManager.buildProjectile(projectileTypeId);

    const targetPos = this._calculateTargetPosition(target);
    const rangeAllowance = this._calculateRangeAllowance(target);
    const attackImplementStatsDict = attackImplement.getAllKeyed('StatisticComponent', 'name');
    const attackerCenter = EntityUtils.getPositionedBoundingRect(attacker).getCenter();

    const projectilePosition = projectile.get('PositionComponent');
    projectilePosition.x = attackerCenter.x - 0.5; // assumption is projectile is always 1 tile in size.
    projectilePosition.y = attackerCenter.y - 0.5;

    const projectileAttack = projectile.get('ProjectileAttackComponent');
    projectileAttack.init(
      attacker.id,
      projectilePosition.position,
      targetPos,
      attackImplementStatsDict[Const.Statistic.Damage].currentValue
    );

    projectile.addRange(
      _.map(
        _.values(attackImplementStatsDict), c => {
          const comp = c.clone();
          if (comp.name === Const.Statistic.Range) {
            comp.currentValue = comp.maxValue = comp.maxValue + rangeAllowance;
          }
          return comp;
        }
      )
    );

    const projectileMovement = projectile.get('MovementComponent');
    projectileMovement.movementAngle = Number.isNaN(angle) ? projectileAttack.angle : angle;
    projectileMovement.velocityVector.zero();

    _.forEach(projectile.getAll('ParticleEmitterComponent'), c => c.emitter.start());

    return projectile;
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
    }

    return false;
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
          spell = null; // can't cast. not enough mp.
        }
      } else {
        // not ranged, at present not an attack spell.
        spell = null;
      }
    }

    //TODO: determine how to select best attack implement.

    if (spell) {
      return spell;
    }

    return weapon;
  }

  canBeAttacked(entity) {
    const aiComp = entity.get('AiComponent');

    if (!aiComp) {
      throw new Error('AI component not found.');
    }

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

  faceToward(facer, target) {
    const facerFacing = facer.get('FacingComponent');
    const facerPosition = facer.get('PositionComponent');
    const targetPosition = target.get('PositionComponent');

    facerFacing.facing = facerPosition.x < targetPosition.x ? Const.Direction.East : Const.Direction.West;
  }

  _calculateTargetPosition(target) {
    switch (target.constructor.name) {
      case 'Entity':
        return target.get('PositionComponent').position;
      case 'Vector':
        return target;
      default:
        throw new Error('target arg required.');
    }
  }

  _calculateRangeAllowance(target) {
    if (target.constructor.name === 'Entity') {
      return target.get('BoundingRectangleComponent').rectangle.getDiagonalLength() / 2;
    }
    return 0;
  }
}
