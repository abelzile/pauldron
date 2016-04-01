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

    this._renderer = renderer;
    this._entityManager = entityManager;

    this._drag = 0.5; // to global.

    const state = HeroComponent.State;
    this._currentStateFunc = Object.create(null);
    this._currentStateFunc[state.Normal] = this._doHeroNormal;
    this._currentStateFunc[state.KnockingBack] = this._doHeroKnockingBack;
    this._currentStateFunc[state.Attacking] = this._doHeroAttacking;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const heroEnt = this._entityManager.heroEntity;
    const heroComp = heroEnt.get('HeroComponent');

    heroComp.stateMachine.onknockBack = (event, from, to, attackerEntity, attackerWeaponEnt) => {

      const isMobAttack = !!attackerWeaponEnt;
      let hitAngle;

      if (isMobAttack) {

        const attackHit = attackerWeaponEnt.get('MeleeAttackComponent').findHitEntityObj(heroEnt.id);

        hitAngle = attackHit.hitAngle;

      } else {

        hitAngle = attackerEntity.get('ProjectileAttackComponent').angle;

      }

      const heroMovementComp = heroEnt.get('MovementComponent');
      heroMovementComp.movementAngle = hitAngle;
      heroMovementComp.velocityVector.zero();
      heroMovementComp.directionVector.set(Math.cos(heroMovementComp.movementAngle), Math.sin(heroMovementComp.movementAngle));

      heroComp.timeLeftInCurrentState = 500;

    };

    heroComp.stateMachine.onattack = (event, from, to, gameTime, input, heroEnt, mobEnts, weaponEnts) => {

      const heroWeaponEntId = heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId;

      if (!heroWeaponEntId) { return; }

      const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroWeaponEntId);

      if (!heroWeaponEnt) { return; }

      heroEnt.get('MovementComponent').zeroAll();

      const mousePosition = input.getMousePosition();
      const heroPositionComp = heroEnt.get('PositionComponent');
      const weaponComp = heroWeaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
      const mouseTilePosition = this._translateScreenPositionToTilePosition(mousePosition, heroPositionComp);

      switch (ObjectUtils.getTypeName(weaponComp)) {

        case 'MeleeWeaponComponent':
        {
          const attackComp = heroWeaponEnt.get('MeleeAttackComponent');
          attackComp.setAttack(new Point(heroPositionComp.position.x + 0.5, heroPositionComp.position.y + 0.5),
                               mouseTilePosition,
                               weaponComp.range,
                               weaponComp.arc,
                               weaponComp.duration,
                               weaponComp.damage);

          for (const mobEntity of mobEnts) {

            if (!this._allowedToAttack(mobEntity)) { continue; }

            if (attackComp.containsHitEntityId(mobEntity.id)) { continue; }

            const mobPositionComp = mobEntity.get('PositionComponent');
            const mobBoundingRectComp = mobEntity.get('BoundingRectangleComponent');
            const mobPositionedBoundingRect = mobBoundingRectComp.rectangle.getOffsetBy(mobPositionComp.position);

            let done = false;

            for (const attackLine of attackComp.lines) {

              for (const sideLine of mobPositionedBoundingRect.sides) {

                if (!attackLine.intersectsWith(sideLine)) { continue; }

                const hitAngle = Math.atan2(mobPositionComp.position.y - heroPositionComp.position.y,
                                            mobPositionComp.position.x - heroPositionComp.position.x);

                attackComp.addHit(mobEntity.id, hitAngle);

                done = true;

                break;

              }

              if (done) { break; }

            }

          }

          break;
        }
        case 'RangedWeaponComponent':
        {
          const projectileEnt = this._entityManager.buildFromProjectileTemplate(weaponComp.projectile);
          this._entityManager.add(projectileEnt);

          const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
          const heroBoundingRectComp = heroEnt.get('BoundingRectangleComponent');

          const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
          const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

          const projectileStartPos = new Point(heroPositionComp.position.x + heroBoundingRectComp.rectangle.x + offsetX,
                                               heroPositionComp.position.y + heroBoundingRectComp.rectangle.y + offsetY);

          const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
          projectileAttackComp.set(heroEnt.id, projectileStartPos, mouseTilePosition, weaponComp.range, weaponComp.damage);

          const projectilePositionComp = projectileEnt.get('PositionComponent');
          projectilePositionComp.position.setFrom(heroPositionComp.position);

          const projectileMovementComp = projectileEnt.get('MovementComponent');
          projectileMovementComp.movementAngle = projectileAttackComp.angle;
          projectileMovementComp.velocityVector.zero();
          projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                                     Math.sin(projectileMovementComp.movementAngle));

          break;
        }

      }

      heroComp.timeLeftInCurrentState = weaponComp.duration;

    };

  }

  processEntities(gameTime, entities) {

    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const heroEnt = this._entityManager.heroEntity;
    const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    let adjacentEntities = entitySpatialGrid.getAdjacentEntities(heroEnt);
    let mobEnts = EntityFinders.findMobs(adjacentEntities);
    const projectileEnts = EntityFinders.findProjectiles(entities);

    this._processMovement(currentLevelEnt, heroEnt, mobEnts, projectileEnts);

    const levelEnts = EntityFinders.findLevels(entities);
    const newLevelEnt = this._processGateways(levelEnts);

    if (newLevelEnt !== undefined) {
      this._entityManager.currentLevelEntity = newLevelEnt;
      this.emit('level-update-system.enter-gateway');
      return;
    }

    entitySpatialGrid.update();

    adjacentEntities = entitySpatialGrid.getAdjacentEntities(heroEnt);

    mobEnts = EntityFinders.findMobs(adjacentEntities);
    const weaponEnts = EntityFinders.findWeapons(entities);
    const itemEnts = EntityFinders.findItems(adjacentEntities);

    this._processAttacks(gameTime, heroEnt, mobEnts, weaponEnts, projectileEnts);

    this._processItems(heroEnt, itemEnts);

    this._processDeleted(entities);

    const heroComp = heroEnt.get('HeroComponent');

    this._currentStateFunc[heroComp.currentState].call(this, gameTime, heroEnt, mobEnts, weaponEnts);

    heroComp.timeLeftInCurrentState -= gameTime;

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

  _processAttacks(gameTime, heroEnt, mobEnts, weaponEnts, projectileEnts) {

    const heroWeaponEnt = EntityFinders.findById(weaponEnts, heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    //1. Hero attacking mobs.

    if (heroWeaponEnt && heroWeaponEnt.has('MeleeAttackComponent')) {

      for (const mobEnt of mobEnts) {
        this._processMeleeAttack(heroEnt, heroWeaponEnt, mobEnt);
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

        this._processMeleeAttack(mobEnt, mobWeaponEnt, heroEnt);

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
        this._processProjectileAttack(projectileEnt, mobOrHeroEnt);
      }

    }

  }

  _processMeleeAttack(attackerEnt, attackerWeaponEnt, targetEnt) {

    const attackerWeaponAttackComp = attackerWeaponEnt.get('MeleeAttackComponent');

    if (!attackerWeaponAttackComp.containsHitEntityId(targetEnt.id)) { return; }

    const attackHit = attackerWeaponAttackComp.findHitEntityObj(targetEnt.id);

    if (attackHit.hasBeenProcessed) { return; }

    attackHit.hasBeenProcessed = true;

    this._processDamage(targetEnt, attackerEnt, attackerWeaponEnt);

  }

  _processProjectileAttack(projectileEnt, targetEnt) {

    if (projectileEnt.deleted) { return; }

    const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
    const projectilePositionedBoundingRect = this._getEntityPositionedRect(projectileEnt);

    if (projectileAttackComp.shooterEntityId === targetEnt.id) { return; }

    const targetPositionedBoundingRect = this._getEntityPositionedRect(targetEnt);

    if (!projectilePositionedBoundingRect.intersectsWith(targetPositionedBoundingRect)) { return; }

    projectileEnt.deleted = true;

    this._processDamage(targetEnt, projectileEnt);

  }

  _processDamage(targetEnt, attackerEnt, attackerWeaponEnt) {

    const isMeleeAttack = !!attackerWeaponEnt;
    let damage = (isMeleeAttack) ?
                 attackerWeaponEnt.get('MeleeAttackComponent').damage :
                 attackerEnt.get('ProjectileAttackComponent').damage;

    const targetHpComp = _.find(targetEnt.getAll('StatisticComponent'), s => s.name === 'hit-points');
    targetHpComp.currentValue -= damage;

    const aiComp = targetEnt.getFirst('HeroComponent', 'AiRandomWandererComponent', 'AiSeekerComponent');

    if (targetHpComp.currentValue <= 0) {

      if (ObjectUtils.getTypeName(aiComp) === 'HeroComponent') {

        console.log('hero dead.');

      } else {

        console.log('mob dead.');

        targetEnt.deleted = true;

        this._entityManager.removeLevelMobComponentRepresenting(targetEnt);

      }

    } else {

      if (isMeleeAttack) {
        aiComp.stateMachine.knockBack(attackerEnt, attackerWeaponEnt);
      } else {
        aiComp.stateMachine.knockBack(attackerEnt);
      }

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

    const heroAndMobEnts = [].concat(heroEnt, mobEnts);

    for (const heroOrMobEnt of heroAndMobEnts) {
      this._applyInput(heroOrMobEnt, currentLevelEnt);
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
    const statisticComps = entity.getAll('StatisticComponent');
    const accelerationStatComp = _.find(statisticComps, c => c.name === Const.Statistic.Acceleration);
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

  _processGateways(levelEntities) {

    const heroEnt = this._entityManager.heroEntity;
    const currentLevelEnt = this._entityManager.currentLevelEntity;

    const boundingRectangleComp = heroEnt.get('BoundingRectangleComponent');
    const positionComp = heroEnt.get('PositionComponent');
    const currentBoundingRect = boundingRectangleComp.rectangle.getOffsetBy(positionComp.position);
    const gatewayComps = currentLevelEnt.getAll('GatewayComponent');

    const gateway = _.find(gatewayComps, (gatewayComponent) => {

      if (gatewayComponent.toLevelName === '') { return false; }

      const gatewayCenter = new Point(gatewayComponent.position.x + 0.5, gatewayComponent.position.y + 0.5);

      return currentBoundingRect.intersectsWith(gatewayCenter);

    });

    if (gateway === undefined) {
      return undefined;
    }

    return EntityFinders.findLevelByName(levelEntities, gateway.toLevelName);

  }

  _doHeroNormal(gameTime, heroEnt, mobEnts, weaponEnts) {
  }

  _doHeroKnockingBack(gameTime, heroEnt, mobEnts, weaponEnts) {

    const heroComp = heroEnt.get('HeroComponent');

    if (!heroComp.hasTimeLeftInCurrentState) {
      heroComp.stateMachine.normal();
    }

  }

  _doHeroAttacking(gameTime, heroEnt, mobEnts, weaponEnts) {

    const heroComponent = heroEnt.get('HeroComponent');

    if (!heroComponent.hasTimeLeftInCurrentState) {
      heroComponent.stateMachine.normal();
    }

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

  _translateScreenPositionToTilePosition(screenPosition, heroPositionComp) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const tilePxSize = this._renderer.tilePxSize;
    const scale = this._renderer.globalScale;

    const screenTileWidth = screenWidth / tilePxSize / scale;
    const screenTileHeight = screenHeight / tilePxSize / scale;

    const leftTile = heroPositionComp.position.x - (screenTileWidth / 2);
    const topTile = heroPositionComp.position.y - (screenTileHeight / 2);

    const screenTilePosX = leftTile + (screenPosition.x / tilePxSize / scale);
    const screenTilePosY = topTile + (screenPosition.y / tilePxSize / scale);

    return new Point(screenTilePosX, screenTilePosY);

  }

  _allowedToAttack(mobEnt) {

    //TODO:Fix this.
    const aiComp = mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent');
    return (aiComp.currentState !== 'knockingBack'); //Const.AiState.KnockingBack);

  }

}
