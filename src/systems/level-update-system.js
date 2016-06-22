import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
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

    const heroEnt = this._entityManager.heroEntity;
    heroEnt.get('MovementComponent').zeroAll();

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

    this._processUseItem(heroEnt, entities);

    this._processItems(heroEnt, itemEnts);

    this._processDeleted(entities);

  }

  _enterGateway(gatewayComp, heroEnt, levelEnts) {

    switch (gatewayComp.toLevelName) {

      case 'world':

        // position hero in case of world map cancel.
        heroEnt.get('PositionComponent').position.set(gatewayComp.position.x - 1, gatewayComp.position.y); //TODO: make better
        
        this.emit('level-update-system.enter-world-gateway');

        break;

      case 'victory':

        this.emit('level-update-system.enter-victory-gateway');

        break;

      default:

        this._entityManager.currentLevelEntity = EntityFinders.findLevelByName(levelEnts, gatewayComp);
        this.emit('level-update-system.enter-level-gateway');

        break;

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

    _.chain(entities)
     .filter(e => e.deleted)
     .each(e => {

       _.chain(e.getAll('EntityReferenceComponent'))
        .filter(c => c.entityId !== '')
        .each(c => {
          this._entityManager.remove(EntityFinders.findById(entities, c.entityId));
        })
        .value();

       this._entityManager.remove(e);

     })
     .value();

  }

  _processAttacks(gameTime, entities, heroEnt, mobEnts, weaponEnts, projectileEnts) {

    const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    //1. Hero attacking mobs.

    if (heroWeaponEnt && heroWeaponEnt.has('MeleeAttackComponent')) {

      for (const mobEnt of mobEnts) {
        this._processMeleeAttack(entities, heroEnt, heroWeaponEnt, mobEnt);
      }

      const attackComp = heroWeaponEnt.get('MeleeAttackComponent');

      if (attackComp.hasRemainingAttack) {
        attackComp.decrementBy(gameTime);
      }

    }

    //2. Mobs attacking hero.

    for (const mobEnt of mobEnts) {

      const mobWeaponEnt = EntityFinders.findById(weaponEnts, mobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      if (mobWeaponEnt && mobWeaponEnt.has('MeleeAttackComponent')) {

        this._processMeleeAttack(entities, mobEnt, mobWeaponEnt, heroEnt);

        const attackComp = mobWeaponEnt.get('MeleeAttackComponent');

        if (attackComp.hasRemainingAttack) {
          attackComp.decrementBy(gameTime);
        }

      }

    }

    //3. Projectile attacks.

    const mobAndHeroEnts = [].concat(mobEnts, heroEnt);

    for (const projectileEnt of projectileEnts) {

      for (const mobOrHeroEnt of mobAndHeroEnts) {
        this._processProjectileAttack(entities, projectileEnt, mobOrHeroEnt);
      }

    }

  }

  _processMeleeAttack(entities, attackerEnt, attackerWeaponEnt, targetEnt) {

    const attackerWeaponAttackComp = attackerWeaponEnt.get('MeleeAttackComponent');

    if (!attackerWeaponAttackComp.containsHitEntityId(targetEnt.id)) { return; }

    const attackHit = attackerWeaponAttackComp.findHitEntityObj(targetEnt.id);

    if (attackHit.hasBeenProcessed) { return; }

    attackHit.hasBeenProcessed = true;

    this._processMeleeDamage(entities, targetEnt, attackerEnt, attackerWeaponEnt);

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
      aiComp.knockBack(hitObj.hitAngle);

    }

  }

  _processProjectileDamage(entities, targetEnt, attackerEnt) {

    const attackComponent = attackerEnt.get('ProjectileAttackComponent');

    const targetHpComp = this._applyDamage(attackComponent, targetEnt, entities);

    if (targetHpComp.currentValue <= 0) {

      this._processDeath(targetEnt);

    } else {

      const aiComp = targetEnt.get('AiComponent');
      aiComp.knockBack(attackComponent.angle);

    }

  }

  _calculateTargetDefense(targetEnt, entities) {

    return _
      .chain(targetEnt.getAll('EntityReferenceComponent'))
      .map(c => {

        if (!_.includes(this.ArmorSlots, c.typeId)) { return undefined; }

        const armorEnt = EntityFinders.findById(entities, c.entityId);

        if (!armorEnt) { return undefined; }

        const defenseComp = _.find(armorEnt.getAll('StatisticComponent'), c => c.name === Const.Statistic.Defense);

        if (!defenseComp) { return undefined; }

        return defenseComp;

      })
      .compact()
      .reduce((sum, c) => { return sum + c.currentValue; }, 0)
      .value();

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

    for (const mobEnt of mobEnts) {
      this._applyInput(mobEnt, currentLevelEnt);
    }

    for (const projectileEnt of projectileEnts) {

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
    const accelerationStatComp = entity.get('StatisticComponent', c => c.name === Const.Statistic.Acceleration);
    const positionComp = entity.get('PositionComponent');
    const boundingRectangleComp = entity.get('BoundingRectangleComponent');

    const oldPosX = positionComp.position.x;
    const oldPosY = positionComp.position.y;

    movementComp.velocityVector.x += accelerationStatComp.currentValue * movementComp.directionVector.x;
    movementComp.velocityVector.y += accelerationStatComp.currentValue * movementComp.directionVector.y;
    movementComp.velocityVector.multiplyBy(this._drag);

    const collidedY = this._processTerrainCollision('y', positionComp, movementComp, boundingRectangleComp, tileMapComp, oldPosY);
    const collidedX = this._processTerrainCollision('x', positionComp, movementComp, boundingRectangleComp, tileMapComp, oldPosX);

    positionComp.position.x = Math.round(positionComp.position.x * 100) / 100;
    positionComp.position.y = Math.round(positionComp.position.y * 100) / 100;

    return collidedX || collidedY;

  }

  _processGateways(currentLevelEnt, heroEnt, levelEntities) {

    const boundingRectangleComp = heroEnt.get('BoundingRectangleComponent');
    const positionComp = heroEnt.get('PositionComponent');
    const currentBoundingRect = boundingRectangleComp.rectangle.getOffsetBy(positionComp.position);
    const gatewayComps = currentLevelEnt.getAll('GatewayComponent');

    return _.find(gatewayComps, gc => {

      if (gc.toLevelName === '') { return false; }

      const gatewayCenter = new Point(gc.position.x + 0.5, gc.position.y + 0.5);

      return currentBoundingRect.intersectsWith(gatewayCenter);

    });

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
