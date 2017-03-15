import * as _ from 'lodash';
import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import ExperienceComponent from '../components/experience-component';
import Rectangle from '../rectangle';
import System from '../system';
import ToWorldExitComponent from '../components/to-world-exit-component';
import Vector from '../vector';

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
    hero.get('HeroComponent').stand();
  }

  processEntities(gameTime, entities) {
    const currentLevelEnt = this._entityManager.currentLevelEntity;
    const hero = this._entityManager.heroEntity;
    const entitySpatialGrid = this._entityManager.entitySpatialGrid;
    let adjacentEntities = entitySpatialGrid.getAdjacentEntities(hero);
    let mobs = EntityFinders.findMobs(adjacentEntities);
    const projectiles = EntityFinders.findProjectiles(entities);

    this._processMovement(currentLevelEnt, hero, mobs, projectiles, entities);

    const exit = this._processExits(hero, currentLevelEnt);

    if (exit) {
      this._enterGateway(entities, exit, hero, currentLevelEnt);
      return;
    }

    entitySpatialGrid.update();

    adjacentEntities = entitySpatialGrid.getAdjacentEntities(hero);

    mobs = EntityFinders.findMobs(adjacentEntities);
    const weaponEnts = EntityFinders.findWeapons(entities);
    const itemEnts = EntityFinders.findItems(adjacentEntities);

    this._processAttacks(gameTime, entities, hero, mobs, weaponEnts, projectiles);
    this._processStatisticEffects(gameTime, entities, hero);
    this._processUseItem(hero, entities);
    this._processItems(hero, itemEnts);
    this._processDeleted(entities);
  }

  unload(entities) {
  }

  canBeAttacked(entity) {
    const aiComp = entity.get('AiComponent');

    if (!aiComp) {
      throw new Error('AI component not found.');
    }

    switch (ObjectUtils.getTypeName(aiComp)) {
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

  _enterGateway(entities, exit, hero, currentLevel) {
    // stop and position hero in case of a cancel...
    hero.get('HeroComponent').stand();
    hero.get('MovementComponent').zeroAll();
    hero.get('PositionComponent').position.set(exit.x, exit.y + 1);

    const exitTypeName = ObjectUtils.getTypeName(exit);

    switch (exitTypeName) {
      case 'ToWorldExitComponent':
        if (exit.isLevelCompleteExit) {
          this._entityManager.worldEntity
            .get('WorldMapComponent')
            .getWorldDataByName(exit.levelToCompleteName).isComplete = true;

          const completedLevel = EntityFinders.findLevelByName(entities, exit.levelToCompleteName);
          const bossExit = completedLevel.get('ToBossExitComponent');
          const replacementExit = new ToWorldExitComponent(bossExit.position.clone());

          completedLevel.remove(bossExit);
          completedLevel.add(replacementExit);

          const worldArrival = completedLevel.getAll('ArrivalComponent', c => c.fromLevelName === 'world')[0];
          worldArrival.x = replacementExit.x;
          worldArrival.y = replacementExit.y + 1;

          this._entityManager.setCurrentLevel(exit.levelToCompleteName, 'world');

          this.emit('level-update-system.leave-boss-level', 'world', exit.levelToCompleteName);
        } else {
          this.emit('level-update-system.enter-world-gateway');
        }

        break;

      case 'ToVictoryExitComponent':
        console.log('EXITING TO VICTORY!');

        this.emit('level-update-system.enter-victory-gateway');

        break;

      default:
        let eventName = '';

        if (exitTypeName === 'ToBossExitComponent') {
          eventName = 'level-update-system.enter-boss-gateway';
        } else {
          eventName = 'level-update-system.enter-level-gateway';
        }

        this.emit(eventName, currentLevel.get('NameComponent').name, exit.toLevelName);

        break;

    }
  }

  _processStatisticEffects(gameTime, entities, hero) {
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

    if (!useComp.entityId) {
      return;
    }

    const itemEnt = EntityFinders.findById(entities, useComp.entityId);

    useComp.entityId = '';

    this._useItem(heroEnt, itemEnt);
  }

  _useItem(heroEnt, itemEnt) {
    const statisticComps = heroEnt.getAll('StatisticComponent');

    for (const effectComp of itemEnt.getAll('StatisticEffectComponent')) {
      for (const statisticComp of statisticComps) {
        if (statisticComp.apply(effectComp)) {
          break;
        }
      }
    }
  }

  _processDeleted(entities) {
    const deleted = _.filter(entities, e => e.deleted);
    const related = _.chain(deleted)
      .map(e => _.map(e.getAll('EntityReferenceComponent'), c => {
        if (c.entityId) {
          return EntityFinders.findById(entities, c.entityId);
        }
      }))
      .flatten()
      .compact()
      .value();

    this._entityManager.removeAll([...deleted, ...related]);
  }

  _processAttacks(gameTime, entities, hero, mobs, weapons, projectiles) {
    //1. Hero attacking mobs.

    const heroWeapon = EntityFinders.findById(
      weapons,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
    );
    const heroSpell = EntityFinders.findById(
      entities,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
    );

    let heroWeaponAttack = null;
    if (heroWeapon) {
      heroWeaponAttack = heroWeapon.get('MeleeAttackComponent');
    }

    let heroSpellAttack = null;
    if (heroSpell) {
      heroSpellAttack = heroSpell.get('MeleeAttackComponent');
    }

    const weaps = [heroSpell, heroWeapon];
    const attacks = [heroSpellAttack, heroWeaponAttack];

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
      const heroAttackOriginOffsetX = heroPosition.x + 0.5;
      const heroAttackOriginOffsetY = heroPosition.y + 0.5;
      const xDiff = heroAttackOriginOffsetX - attack.origin.x;
      const yDiff = heroAttackOriginOffsetY - attack.origin.y;

      if (!(xDiff === 0 && yDiff === 0)) {
        attack.adjustPositionBy(xDiff, yDiff);
      }

      for (let i = 0; i < mobs.length; ++i) {
        const mob = mobs[i];

        if (attack.containsHitEntityId(mob.id)) {
          continue;
        }

        if (!this.canBeAttacked(mob)) {
          continue;
        }

        const mobPosition = mob.get('PositionComponent');
        const mobPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(mob);
        const attackLines = attack.lines;
        let done = false;

        for (let j = 0; j < attackLines.length && !done; ++j) {
          const attackLine = attackLines[j];
          const sideLines = mobPositionedBoundingRect.sides;

          for (let k = 0; k < sideLines.length && !done; ++k) {
            const sideLine = sideLines[k];

            if (!attackLine.intersectsWith(sideLine)) {
              continue;
            }

            const hitAngle = Math.atan2(mobPosition.y - heroPosition.y, mobPosition.x - heroPosition.x);
            const hitPosition = attack.addHit(mob.id, hitAngle, mobPositionedBoundingRect);

            this.emit('level-update-system.show-attack-hit', attack, hitPosition);

            done = true;
          }
        }

        this._processMeleeAttack(entities, hero, weapon, mob);
      }
    }

    for (let i = 0; i < attacks.length; ++i) {
      const temp = attacks[i];
      temp && temp.hasRemainingAttack && temp.decrementBy(gameTime);
    }

    //2. Mobs attacking hero.

    for (let i = 0; i < mobs.length; ++i) {
      const mob = mobs[i];
      const mobWeapon = EntityFinders.findById(
        weapons,
        mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
      );

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
      const projectile = projectiles[i];

      for (let j = 0; j < mobAndHeroEnts.length; ++j) {
        this._processProjectileAttack(entities, projectile, mobAndHeroEnts[j]);
      }
    }
  }

  _processMeleeAttack(entities, attacker, attackerWeapon, target) {
    const attackerWeaponAttack = attackerWeapon.get('MeleeAttackComponent');

    if (!attackerWeaponAttack.containsHitEntityId(target.id)) {
      return;
    }

    const attackHit = attackerWeaponAttack.findHitEntityObj(target.id);

    if (attackHit.hasBeenProcessed) {
      return;
    }

    attackHit.hasBeenProcessed = true;

    this._processMeleeDamage(entities, target, attacker, attackerWeapon);
  }

  _processProjectileAttack(entities, projectile, target) {
    if (projectile.deleted) {
      return;
    }

    const projectileAttack = projectile.get('ProjectileAttackComponent');
    if (projectileAttack.shooterEntityId === target.id) {
      return;
    }

    const shooterEntity = EntityFinders.findById(entities, projectileAttack.shooterEntityId);
    if (EntityFinders.isMob(shooterEntity) && EntityFinders.isMob(target)) {
      return;
    }

    const projectilePositionedBoundingRect = EntityUtils.getPositionedBoundingRect(projectile);
    const targetPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(target);

    const intersection = Rectangle.intersection(projectilePositionedBoundingRect, targetPositionedBoundingRect);
    if (!intersection) {
      return;
    }

    projectile.deleted = true;

    const center = intersection.getCenter();

    this.emit('level-update-system.show-attack-hit', projectileAttack, center);

    this._processProjectileDamage(entities, target, projectile);
  }

  _processMeleeDamage(entities, target, attacker, attackerWeapon) {
    const targetHpComp = this._applyDamage(attackerWeapon, target, entities);

    if (targetHpComp.currentValue <= 0) {
      this._processDeath(entities, target);
    } else {
      const weaponStats = attackerWeapon.getAllKeyed('StatisticComponent', 'name');
      const attackComp = attackerWeapon.get('MeleeAttackComponent');
      const hitObj = attackComp.findHitEntityObj(target.id);
      const aiComp = target.get('AiComponent');
      aiComp.knockBack(hitObj.hitAngle, weaponStats[Const.Statistic.KnockBackDuration].currentValue);
    }
  }

  _processProjectileDamage(entities, target, attacker) {
    const targetHpComp = this._applyDamage(attacker, target, entities);

    if (targetHpComp.currentValue <= 0) {
      this._processDeath(entities, target);
    } else {
      const weaponStats = attacker.getAllKeyed('StatisticComponent', 'name');
      const attackComp = attacker.get('ProjectileAttackComponent');
      const aiComp = target.get('AiComponent');
      aiComp.knockBack(attackComp.angle, weaponStats[Const.Statistic.KnockBackDuration].currentValue);
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
          const defenseComp = _.find(
            armorEnt.getAll('StatisticComponent'),
            c => c.name === Const.Statistic.Defense
          );

          if (defenseComp) {
            sum += defenseComp.currentValue;
          }
        }
      }
    }

    return sum;
  }

  _applyDamage(attackImplement, targetEnt, entities) {
    const stats = attackImplement.getAllKeyed('StatisticComponent', 'name');
    let damage = stats[Const.Statistic.Damage].currentValue;
    const defense = this._calculateTargetDefense(targetEnt, entities);

    const origDamage = damage;

    const damageReduce = Math.floor(damage * defense);
    damage -= damageReduce;

    this.__log('damage: ' + origDamage + ' - ' + damageReduce + ' = ' + damage);

    const targetHpComp = _.find(
      targetEnt.getAll('StatisticComponent'),
      s => s.name === Const.Statistic.HitPoints
    );
    targetHpComp.currentValue -= damage;

    return targetHpComp;
  }

  _processDeath(entities, deadMob) {
    const aiComp = deadMob.get('AiComponent');

    if (ObjectUtils.getTypeName(aiComp) === 'HeroComponent') {
      console.log('hero dead.');
      this.emit('level-update-system.defeat');
    } else {
      console.log('mob dead.');

      const experienceValue = deadMob.get('ExperienceValueComponent');

      if (experienceValue) {
        this._processExpUp(entities, experienceValue);
      } else {
        console.log('ALERT! No ExperienceValueComponent on ' + deadMob);
      }

      deadMob.deleted = true;

      const levelMob = this._entityManager.getLevelMobComponentRepresenting(deadMob);
      if (levelMob && levelMob.isBoss) {
        const doors = this._entityManager.currentLevelEntity.get('DoorsComponent');

        if (doors && doors.exitDoor) {
          this._unlockDoor(doors.exitDoor);
        }
      }

      this._entityManager.removeLevelMobComponentRepresenting(deadMob);

      this.emit('level-update-system.show-mob-death', deadMob);
    }
  }

  _unlockDoor(door) {
    if (door && door.lock) {
      door.lock.unlock();

      const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
      tileMap.visualLayers[1][door.position.y][door.position.x] = 1000;
    }
  }

  _processExpUp(entities, experienceValueComp) {
    const value = experienceValueComp.value;

    const hero = this._entityManager.heroEntity;
    const expComp = hero.get('ExperienceComponent');

    const currentLevel = Math.trunc(ExperienceComponent.pointsToLevel(expComp.points));

    expComp.points += value;

    let newCurrentLevel = Math.trunc(ExperienceComponent.pointsToLevel(expComp.points));

    if (newCurrentLevel > currentLevel) {
      const heroCc = hero.get('CharacterClassComponent');
      const ccs = EntityFinders.findCharacterClasses(entities);
      const heroCcEnt = _.find(ccs, c => c.get('CharacterClassComponent').typeId === heroCc.typeId);

      while (newCurrentLevel > currentLevel) {
        console.log('level up!');

        const rewards = heroCcEnt.getAll('LevelUpRewardComponent');
        const stats = hero.getAll('StatisticComponent');

        for (let i = 0; i < rewards.length; ++i) {
          const reward = rewards[i];

          for (let j = 0; j < stats.length; ++j) {
            const stat = stats[j];

            if (stat.apply(reward)) {
              break;
            }
          }
        }

        newCurrentLevel--;
      }

      this.emit('level-update-system.level-up');
    } else {
      const nextLevelPoints = ExperienceComponent.levelToPoints(currentLevel + 1);
      const diff = nextLevelPoints - expComp.points;

      console.log(diff + 'xp required for next level');
    }
  }

  _processItems(heroEnt, itemEnts) {
    const heroEntRefComps = heroEnt.getAll('EntityReferenceComponent');
    const itemEntsInBackpack = EntityFinders.findReferencedIn(itemEnts, heroEntRefComps);
    const freeItemEnts = _.difference(itemEnts, itemEntsInBackpack);
    const heroPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(heroEnt);

    for (const itemEnt of freeItemEnts) {
      const itemPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(itemEnt);

      if (itemPositionedBoundingRect.intersectsWith(heroPositionedBoundingRect)) {
        const entRefComps = heroEnt.getAll('EntityReferenceComponent');
        const emptyBackpackEntRefComps = _.filter(
          entRefComps,
          c => c.typeId === Const.InventorySlot.Backpack && !c.entityId
        );

        if (emptyBackpackEntRefComps.length === 0) {
          return;
        }

        emptyBackpackEntRefComps[0].entityId = itemEnt.id;

        this._entityManager.removeLevelItemComponentRepresenting(itemEnt);

        this.emit('level-update-system.pick-up-item', itemEnt);
      }
    }
  }

  _processMovement(currentLevel, hero, mobs, projectiles, entities) {
    const collisions = [];

    this._applyInput(hero, currentLevel, collisions);

    if (collisions.length > 0) {
      this._processDoors(hero, currentLevel, collisions, entities);
    }

    this._processMobMovement(mobs, currentLevel);
    this._processProjectileMovement(projectiles, currentLevel);

    for (let i = 0; i < collisions.length; ++i) {
      collisions[i].pdispose();
    }
  }

  _processMobMovement(mobs, currentLevel) {
    for (let i = 0; i < mobs.length; ++i) {
      const mob = mobs[i];

      this._applyInput(mob, currentLevel);

      const position = mob.get('PositionComponent');
      const particleEmitters = mob.getAll('ParticleEmitterComponent');

      for (let j = 0; j < particleEmitters.length; ++j) {
        const particleEmitter = particleEmitters[j];
        particleEmitter.position.x = position.x + particleEmitter.offset.x;
        particleEmitter.position.y = position.y + particleEmitter.offset.y;
      }
    }
  }

  _processProjectileMovement(projectiles, currentLevelEnt) {
    for (let i = 0; i < projectiles.length; ++i) {
      const projectile = projectiles[i];
      const hitTerrain = this._applyInput(projectile, currentLevelEnt);

      if (hitTerrain) {
        projectile.deleted = true;
        continue;
      }

      const position = projectile.get('PositionComponent');
      const attack = projectile.get('ProjectileAttackComponent');
      const stats = projectile.getAllKeyed('StatisticComponent', 'name');
      const distanceTravelled = Vector.distance(attack.startPosition, position.position);

      if (distanceTravelled > stats[Const.Statistic.Range].currentValue) {
        projectile.deleted = true;
      }
    }
  }

  _applyInput(entity, currentLevelEntity, outCollisions = []) {
    const tileMapComp = currentLevelEntity.get('TileMapComponent');
    const movementComp = entity.get('MovementComponent');
    const acceleration = EntityUtils.getCurrentStatisticValues(
      entity,
      c => c.name === Const.Statistic.Acceleration,
      c => c.name === Const.Statistic.Acceleration
    )[Const.Statistic.Acceleration];

    const positionComp = entity.get('PositionComponent');
    const boundingRectangleComp = entity.get('BoundingRectangleComponent');

    const oldPosX = positionComp.position.x;
    const oldPosY = positionComp.position.y;

    movementComp.velocityVector.x += acceleration * movementComp.directionVector.x;
    movementComp.velocityVector.y += acceleration * movementComp.directionVector.y;
    movementComp.velocityVector.multiply(this._drag);

    const collidedY = this._processTerrainCollision(
      'y',
      positionComp,
      movementComp,
      boundingRectangleComp,
      tileMapComp,
      oldPosY,
      outCollisions
    );
    const collidedX = this._processTerrainCollision(
      'x',
      positionComp,
      movementComp,
      boundingRectangleComp,
      tileMapComp,
      oldPosX,
      outCollisions
    );

    return collidedX || collidedY;
  }

  _processDoors(hero, currentLevel, collisions, entities) {
    const doorComps = currentLevel.get('DoorsComponent');

    if (!doorComps) {
      return;
    }

    const tileMap = currentLevel.get('TileMapComponent');
    const doors = doorComps.doors;

    let done = false;

    for (let i = 0; i < collisions.length && !done; ++i) {
      const collision = collisions[i];

      for (let j = 0; j < doors.length && !done; ++j) {
        const door = doors[j];

        if (collision.equals(door.position)) {
          const lock = door.lock;
          if (lock && lock.isLocked && lock.canUnlock(entities)) {
            lock.unlock();
          }

          if (!lock || (lock && !lock.isLocked)) {
            this._openDoor(tileMap, door, collision);
            done = true;
          }
        }
      }
    }
  }

  _openDoor(tileMap, door, collision) {
    tileMap.collisionLayer[collision.y][collision.x] = 0;

    door.open = true;

    const room = door.room;
    room.explored = true;

    const hall = door.hall;
    hall.explored = true;

    const newHall = hall.clone();

    if (hall.width > hall.height) {
      newHall.y -= 1;
      newHall.height += 2;
    } else if (hall.width < hall.height) {
      newHall.x -= 1;
      newHall.width += 2;
    } else {
      newHall.x -= 1;
      newHall.y -= 1;
      newHall.width += 2;
      newHall.height += 2;
    }

    tileMap.clearFogOfWar(Rectangle.inflate(room, 1));
    tileMap.clearFogOfWar(newHall);

    if (_.includes(Const.DoorTileIds, tileMap.visualLayers[1][collision.y][collision.x])) {
      tileMap.visualLayers[1][collision.y][collision.x] = 1001;
    }
  }

  _processExits(hero, level) {
    const currentBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    const exits = level.getAll('ExitComponent');

    for (let i = 0; i < exits.length; ++i) {
      const exit = exits[i];
      const exitCenter = new Vector(exit.position.x + 0.5, exit.position.y + 0.5);

      if (currentBoundingRect.intersectsWith(exitCenter)) {
        return exit;
      }
    }

    return null;
  }

  _processTerrainCollision(
    axis,
    positionComp,
    movementComp,
    boundingRectangleComp,
    tileMapComp,
    oldPos,
    outCollisions = []
  ) {
    let otherAxis;

    if (axis === 'x') {
      otherAxis = 'y';
    } else if (axis === 'y') {
      otherAxis = 'x';
    } else {
      throw new Error('axis arg "' + axis + '" is invalid. Must be "x" or "y".');
    }

    positionComp.position[axis] += movementComp.velocityVector[axis];

    const newPos = new Vector();
    newPos[axis] = positionComp.position[axis];
    newPos[otherAxis] = positionComp.position[otherAxis];

    const isWithin = axis === 'y' ? tileMapComp.isWithinY(newPos[axis]) : tileMapComp.isWithinX(newPos[axis]);

    if (!isWithin) {
      positionComp.position[axis] = newPos[axis] = oldPos;
      movementComp.velocityVector[axis] = 0;

      return true;
    }

    const boundingRect = boundingRectangleComp.rectangle;

    const minX = Math.floor(newPos.x);
    const maxX = Math.ceil(newPos.x + boundingRect.width);
    const minY = Math.floor(newPos.y);
    const maxY = Math.ceil(newPos.y + boundingRect.height);

    if (!(oldPos < newPos[axis] || oldPos > newPos[axis])) {
      return false;
    }

    if (!tileMapComp.containsImpassible(minX, maxX, minY, maxY)) {
      return false;
    }

    const offsetBoundingRect = boundingRect.getOffsetBy(positionComp.position);
    const rect = new Rectangle();
    let collided = false; // can't use collisions.length because array may already contain collisions.

    for (let y = minY; y <= maxY; ++y) {
      for (let x = minX; x <= maxX; ++x) {
        if (tileMapComp.collisionLayer[y][x] === 0) {
          continue;
        }

        rect.x = x;
        rect.y = y;

        if (!offsetBoundingRect.intersectsWith(rect)) {
          continue;
        }

        outCollisions.push(Vector.pnew(x, y));

        collided = true;
      }
    }

    if (collided) {
      positionComp.position[axis] = oldPos;
      movementComp.velocityVector[axis] = 0;

      return true;
    }

    return false;
  }

  __log(msg) {
    this.emit('level-update-system.add-log-message', msg);
  }
}
