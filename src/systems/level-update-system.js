import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import Point from '../point';
import Rectangle from '../rectangle';
import System from '../system';


export default class LevelUpdateSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this.ArmorSlots = [Const.InventorySlot.Body, Const.InventorySlot.Feet, Const.InventorySlot.Head];

    this._renderer = renderer;
    this._entityManager = entityManager;

    this._drag = 0.5; // to global.

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const hero = this._entityManager.heroEntity;
    hero.get('MovementComponent').zeroAll();

  }

  processEntities(gameTime, entities) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const heroEnt = this._entityManager.heroEntity;
    const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    let adjacentEntities = entitySpatialGrid.getAdjacentEntities(heroEnt);
    let mobEnts = EntityFinders.findMobs(adjacentEntities);
    const projectileEnts = EntityFinders.findProjectiles(entities);
    const levelEnts = EntityFinders.findLevels(entities);

    this._processMovement(currentLevelEnt, heroEnt, mobEnts, projectileEnts);

    const gatewayComp = this._processGateways(currentLevelEnt, heroEnt, levelEnts);

    if (gatewayComp) {

      this._enterGateway(gatewayComp, heroEnt, levelEnts);

      return;

    }

    entitySpatialGrid.update();

    adjacentEntities = entitySpatialGrid.getAdjacentEntities(heroEnt);

    mobEnts = EntityFinders.findMobs(adjacentEntities);
    const weaponEnts = EntityFinders.findWeapons(entities);
    const itemEnts = EntityFinders.findItems(adjacentEntities);

    this._processAttacks(gameTime, entities, heroEnt, mobEnts, weaponEnts, projectileEnts);

    this._processEffects(gameTime, entities, heroEnt);

    this._processUseItem(heroEnt, entities);

    this._processItems(heroEnt, itemEnts);

    this._processDeleted(entities);

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


  _enterGateway(gatewayComp, hero, levels) {

    switch (gatewayComp.toLevelName) {

      case 'world':

        // position hero in case of world map cancel.
        const position = hero.get('PositionComponent');
        position.x = gatewayComp.position.x - 1; //TODO: make better
        position.y = gatewayComp.position.y;
        
        this.emit('level-update-system.enter-world-gateway');

        break;

      case 'victory':

        this.emit('level-update-system.enter-victory-gateway');

        break;

      default:

        this._entityManager.currentLevelEntity = EntityFinders.findLevelByName(levels, gatewayComp);
        this.emit('level-update-system.enter-level-gateway');

        break;

    }

  }

  _processEffects(gameTime, entities, hero) {

    const stats = hero.getAllKeyed('StatisticComponent', 'name');
    const effects = hero.getAll('StatisticEffectComponent');

    for (let i = 0; i < effects.length; ++i) {

      const effect = effects[i];

      if (effect.timeLeft <= 0) {

        hero.remove(effect);

      } else {

        // this won't work for currentValue, it is pinned to max value.
        // may make sense to get rid of EffectTimeType and just stick with timeLeft
        // maybe set a super high value (like infinity) for permanent effect.

        if (effect.effectTimeType === Const.EffectTimeType.Permanent) {

          stats[effect.name].currentValue += effect.value;

        }

      }

      effect.timeLeft -= gameTime;

    }

  }

  _processUseItem(heroEnt, entities) {

    const entRefComps = heroEnt.getAll('EntityReferenceComponent');

    const useComp = _.find(entRefComps, e => e.typeId === Const.InventorySlot.Use);

    if (!useComp.entityId) { return; }

    const itemEnt = EntityFinders.findById(entities, useComp.entityId);
    
    useComp.entityId = '';

    this._useItem(heroEnt, itemEnt);

  }

  _useItem(heroEnt, itemEnt) {

    const statisticComps = heroEnt.getAll('StatisticComponent');

    for (const effectComp of itemEnt.getAll('StatisticEffectComponent')) {

      for (const statisticComp of statisticComps) {

        if (statisticComp.apply(effectComp)) { break; }

      }

    }

  }

  _processDeleted(entities) {

    for (let i = 0; i < entities.length; ++i) {

      const e = entities[i];

      if (!e.deleted) { continue; }

      const entRefs = e.getAll('EntityReferenceComponent');

      for (let j = 0; j < entRefs.length; ++j) {

        const c = entRefs[j];

        if (c.entityId === '') { continue; }

        this._entityManager.remove(EntityFinders.findById(entities, c.entityId));

      }

      this._entityManager.remove(e);

    }

  }

  _processAttacks(gameTime, entities, hero, mobs, weapons, projectiles) {

    //1. Hero attacking mobs.

    const heroWeapon = EntityFinders.findById(weapons, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);
    const heroSpell = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId);

    let heroWeaponAttack = null;
    if (heroWeapon) {
      heroWeaponAttack = heroWeapon.get('MeleeAttackComponent');
    }

    let heroSpellAttack = null;
    if (heroSpell) {
      heroSpellAttack = heroSpell.get('MeleeAttackComponent');
    }

    const weaps = [ heroSpell, heroWeapon ];
    const attacks = [ heroSpellAttack, heroWeaponAttack ];

    let weapon = null;
    let attack = null;

    for (let i = 0; i < attacks.length; ++i) {

      const temp = attacks[i];

      if (temp && temp.hasRemainingAttack) {
        attack = temp;
        weapon = weaps[i];
      }

    }

    if (attack) {

      const heroPosition = hero.get('PositionComponent');

      const heroAttackOriginOffsetX = heroPosition.x + .5;
      const heroAttackOriginOffsetY = heroPosition.y + .5;

      const xDiff = heroAttackOriginOffsetX - attack.origin.x;
      const yDiff = heroAttackOriginOffsetY - attack.origin.y;

      if (!(xDiff === 0 && yDiff === 0)) {
        attack.adjustPositionBy(xDiff, yDiff);
      }

      for (let i = 0; i < mobs.length; ++i) {

        const mob = mobs[i];

        if (attack.containsHitEntityId(mob.id)) { continue; }

        if (!this.canBeAttacked(mob)) { continue; }

        const mobPosition = mob.get('PositionComponent');
        const mobBoundingRect = mob.get('BoundingRectangleComponent');
        const mobPositionedBoundingRect = mobBoundingRect.rectangle.getOffsetBy(mobPosition.position);

        let done = false;

        const attackLines = attack.lines;

        for (let j = 0; j < attackLines.length; ++j) {

          const attackLine = attackLines[j];

          const sideLines = mobPositionedBoundingRect.sides;

          for (let k = 0; k < sideLines.length; ++k) {

            const sideLine = sideLines[k];

            if (!attackLine.intersectsWith(sideLine)) { continue; }

            const hitAngle = Math.atan2(mobPosition.y - heroPosition.y, mobPosition.x - heroPosition.x);

            attack.addHit(mob.id, hitAngle);

            done = true;

            break;

          }

          if (done) { break; }

        }

        this._processMeleeAttack(entities, hero, weapon, mob);

      }

    }

    for (let i = 0; i < attacks.length; ++i) {

      const temp = attacks[i];

      if (temp && temp.hasRemainingAttack) {
        temp.decrementBy(gameTime);
      }

    }

    //2. Mobs attacking hero.

    for (let i = 0; i < mobs.length; ++i) {

      const mob = mobs[i];
      const mobWeapon = EntityFinders.findById(weapons, mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      if (mobWeapon && mobWeapon.has('MeleeAttackComponent')) {

        const attack = mobWeapon.get('MeleeAttackComponent');

        if (attack.hasRemainingAttack) {

          this._processMeleeAttack(entities, mob, mobWeapon, hero);

          if (attack.hasRemainingAttack) {
            attack.decrementBy(gameTime);
          }

        }

      }

    }

    //3. Projectile attacks.

    const mobAndHeroEnts = [].concat(mobs, hero);

    for (let i = 0; i < projectiles.length; ++i) {

      const projectileEnt = projectiles[i];

      for (let j = 0; j < mobAndHeroEnts.length; ++j) {

        this._processProjectileAttack(entities, projectileEnt, mobAndHeroEnts[j]);

      }

    }

  }

  _processMeleeAttack(entities, attacker, attackerWeapon, target) {

    const attackerWeaponAttack = attackerWeapon.get('MeleeAttackComponent');

    if (!attackerWeaponAttack.containsHitEntityId(target.id)) { return; }

    const attackHit = attackerWeaponAttack.findHitEntityObj(target.id);

    if (attackHit.hasBeenProcessed) { return; }

    attackHit.hasBeenProcessed = true;

    this._processMeleeDamage(entities, target, attacker, attackerWeapon);

  }

  _processProjectileAttack(entities, projectileEnt, targetEnt) {

    if (projectileEnt.deleted) { return; }

    const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
    const projectilePositionedBoundingRect = this._getEntityPositionedRect(projectileEnt);

    if (projectileAttackComp.shooterEntityId === targetEnt.id) { return; }

    const targetPositionedBoundingRect = this._getEntityPositionedRect(targetEnt);

    if (!projectilePositionedBoundingRect.intersectsWith(targetPositionedBoundingRect)) { return; }

    projectileEnt.deleted = true;

    this._processProjectileDamage(entities, targetEnt, projectileEnt);

  }

  _processMeleeDamage(entities, targetEnt, attackerEnt, attackerWeaponEnt) {

    const attackComponent = attackerWeaponEnt.get('MeleeAttackComponent');

    const targetHpComp = this._applyDamage(attackComponent, targetEnt, entities);

    if (targetHpComp.currentValue <= 0) {

      this._processDeath(targetEnt);

    } else {

      const hitObj = attackComponent.findHitEntityObj(targetEnt.id);

      const aiComp = targetEnt.get('AiComponent');
      aiComp.knockBack(hitObj.hitAngle, attackComponent.knockBackDuration);

    }

  }

  _processProjectileDamage(entities, targetEnt, attackerEnt) {
 
    const attackComp = attackerEnt.get('ProjectileAttackComponent');

    const targetHpComp = this._applyDamage(attackComp, targetEnt, entities);

    if (targetHpComp.currentValue <= 0) {

      this._processDeath(targetEnt);

    } else {

      const aiComp = targetEnt.get('AiComponent');
      aiComp.knockBack(attackComp.angle, attackComp.knockBackDuration);

    }

  }

  _calculateTargetDefense(targetEnt, entities) {

    let sum = 0;

    const entRefs = targetEnt.getAll('EntityReferenceComponent');

    for (let i = 0; i < entRefs.length; ++i) {

      const ref = entRefs[i];

      if (_.includes(this.ArmorSlots, ref.typeId)) {

        const armorEnt = EntityFinders.findById(entities, ref.entityId);

        if (armorEnt) {

          const defenseComp = _.find(armorEnt.getAll('StatisticComponent'), c => c.name === Const.Statistic.Defense);

          if (defenseComp) {

            sum += defenseComp.currentValue;

          }

        }

      }

    }

    return sum;

  }

  _applyDamage(attackComponent, targetEnt, entities) {

    let damage = attackComponent.damage;
    const defense = this._calculateTargetDefense(targetEnt, entities);

    const origDamage = damage;

    const damageReduce = Math.floor(damage * defense);
    damage = damage - damageReduce;

    this.__log('damage: ' + origDamage + ' - ' + damageReduce + ' = ' + damage);

    const targetHpComp = _.find(targetEnt.getAll('StatisticComponent'), s => s.name === Const.Statistic.HitPoints);
    targetHpComp.currentValue -= damage;

    return targetHpComp;

  }

  _processDeath(deadEnt) {

    const aiComp = deadEnt.get('AiComponent');

    if (ObjectUtils.getTypeName(aiComp) === 'HeroComponent') {

      console.log('hero dead.');

      this.emit('level-update-system.defeat');

    } else {

      console.log('mob dead.');

      deadEnt.deleted = true;

      this._entityManager.removeLevelMobComponentRepresenting(deadEnt);

    }

  }

  _processItems(heroEnt, itemEnts) {

    const heroEntRefComps = heroEnt.getAll('EntityReferenceComponent');
    const itemEntsInBackpack = EntityFinders.findReferencedIn(itemEnts, heroEntRefComps);

    const freeItemEnts = _.difference(itemEnts, itemEntsInBackpack);

    const heroPositionedBoundingRect = this._getEntityPositionedRect(heroEnt);

    for (const itemEnt of freeItemEnts) {

      const itemPositionedBoundingRect = this._getEntityPositionedRect(itemEnt);

      if (itemPositionedBoundingRect.intersectsWith(heroPositionedBoundingRect)) {

        const entRefComps = heroEnt.getAll('EntityReferenceComponent');
        const emptyBackpackEntRefComps = _.filter(entRefComps, c => c.typeId === Const.InventorySlot.Backpack && !c.entityId);

        if (emptyBackpackEntRefComps.length === 0) { return; }

        emptyBackpackEntRefComps[0].entityId = itemEnt.id;

        this._entityManager.removeLevelItemComponentRepresenting(itemEnt);

        this.emit('level-update-system.pick-up-item', itemEnt);

      }

    }

  }

  _getEntityPositionedRect(entity) {

    const posComp = entity.get('PositionComponent');
    const boundingRectComp = entity.get('BoundingRectangleComponent');

    return boundingRectComp.rectangle.getOffsetBy(posComp.position);

  }

  _processMovement(currentLevelEnt, heroEnt, mobEnts, projectileEnts) {

    this._applyInput(heroEnt, currentLevelEnt);

    for (let i = 0; i < mobEnts.length; ++i) {
      this._applyInput(mobEnts[i], currentLevelEnt);
    }

    for (let i = 0; i < projectileEnts.length; ++i) {

      const projectileEnt = projectileEnts[i];

      const hitTerrain = this._applyInput(projectileEnt, currentLevelEnt);

      if (hitTerrain) {
        projectileEnt.deleted = true;
        continue;
      }

      const projectilePositionComp = projectileEnt.get('PositionComponent');
      const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');

      const distanceTravelled = Point.distance(projectileAttackComp.startPosition, projectilePositionComp.position);

      if (distanceTravelled > projectileAttackComp.range) {
        projectileEnt.deleted = true;
      }

    }

  }

  _applyInput(entity, currentLevelEntity) {

    const tileMapComp = currentLevelEntity.get('TileMapComponent');
    const movementComp = entity.get('MovementComponent');
    const acceleration = EntityUtils.getCurrentStatisticValues(entity,
                                                               c => c.name === Const.Statistic.Acceleration,
                                                               c => c.name === Const.Statistic.Acceleration)[Const.Statistic.Acceleration];

    const positionComp = entity.get('PositionComponent');
    const boundingRectangleComp = entity.get('BoundingRectangleComponent');

    const oldPosX = positionComp.position.x;
    const oldPosY = positionComp.position.y;

    movementComp.velocityVector.x += acceleration * movementComp.directionVector.x;
    movementComp.velocityVector.y += acceleration * movementComp.directionVector.y;
    movementComp.velocityVector.multiplyBy(this._drag);

    const collidedY = this._processTerrainCollision('y', positionComp, movementComp, boundingRectangleComp, tileMapComp, oldPosY);
    const collidedX = this._processTerrainCollision('x', positionComp, movementComp, boundingRectangleComp, tileMapComp, oldPosX);

    //positionComp.position.x = Math.round(positionComp.position.x * 100) / 100;
    //positionComp.position.y = Math.round(positionComp.position.y * 100) / 100;

    return collidedX || collidedY;

  }

  _processGateways(currentLevelEnt, heroEnt, levelEntities) {

    const boundingRectangleComp = heroEnt.get('BoundingRectangleComponent');
    const positionComp = heroEnt.get('PositionComponent');
    const currentBoundingRect = boundingRectangleComp.rectangle.getOffsetBy(positionComp.position);
    const gatewayComps = currentLevelEnt.getAll('GatewayComponent');

    for (let i = 0; i < gatewayComps.length; ++i) {

      const gc = gatewayComps[i];

      if (gc.toLevelName !== '') {

        const gatewayCenter = new Point(gc.position.x + 0.5, gc.position.y + 0.5);

        if (currentBoundingRect.intersectsWith(gatewayCenter)) {
          return gc;
        }

      }

    }

    return null;

  }

  _processTerrainCollision(axis, positionComp, movementComp, boundingRectangleComp, tileMapComp, oldPos) {

    let otherAxis;
    let withinTileMapFunc;

    if (axis === 'x') {

      otherAxis = 'y';
      withinTileMapFunc = tileMapComp.isWithinY.bind(tileMapComp);

    } else if (axis === 'y') {

      otherAxis = 'x';
      withinTileMapFunc = tileMapComp.isWithinX.bind(tileMapComp);

    } else {
      throw new Error('axis arg "' + axis + '" is invalid. Must be "x" or "y".');
    }

    positionComp.position[axis] += movementComp.velocityVector[axis];

    const newPos = new Point();
    newPos[axis] = positionComp.position[axis];
    newPos[otherAxis] = positionComp.position[otherAxis];

    if (!withinTileMapFunc(newPos[axis])) {

      positionComp.position[axis] = newPos[axis] = oldPos;
      movementComp.velocityVector[axis] = 0;

      return true;

    }

    const minX = Math.floor(newPos.x);
    const maxX = Math.ceil(newPos.x);
    const minY = Math.floor(newPos.y);
    const maxY = Math.ceil(newPos.y);

    if (!(oldPos < newPos[axis] || oldPos > newPos[axis])) {
      return false;
    }

    if (!tileMapComp.containsImpassible(minX, maxX, minY, maxY)) {
      return false;
    }

    const offsetBoundingRect = boundingRectangleComp.rectangle.getOffsetBy(positionComp.position);

    for (let y = minY; y <= maxY; ++y) {

      for (let x = minX; x <= maxX; ++x) {

        if (tileMapComp.collisionLayer[y][x] === 0) { continue; }

        if (!offsetBoundingRect.intersectsWith(new Rectangle(x, y))) { continue; }

        positionComp.position[axis] = oldPos;
        movementComp.velocityVector[axis] = 0;

        return true;

      }

    }

    return false;

  }

  __log(msg) {
    this.emit('level-update-system.add-log-message', msg);
  }

}
