import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as ObjectUtils from '../utils/object-utils';
import ArrivalComponent from '../components/arrival-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';
import System from '../system';
import ToWorldExitComponent from '../components/to-world-exit-component';
import Vector from '../vector';

export default class LevelMovementSystem extends System {
  constructor(renderer, entityManager) {
    super();
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
    return this;
  }

  begin() {
    this._entityManager.entitySpatialGridUpdate();
  }

  processEntities(gameTime, entities, input) {
    const currentLevel = this._entityManager.currentLevelEntity;
    const hero = this._entityManager.heroEntity;
    const adjacentEntities = this._entityManager.getEntitiesAdjacentToHero();
    const mobs = EntityFinders.findMobs(adjacentEntities);
    const projectiles = EntityFinders.findProjectiles(entities);

    this._doMovement(currentLevel, hero, mobs, projectiles, entities);

    const exit = this._findExitsHeroIsCollidingWith(hero, currentLevel);

    if (exit) {
      this._enterGateway(entities, exit, hero, currentLevel);
    }
  }

  end() {
    this._entityManager.entitySpatialGridUpdate();
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
          const worldTile = this._entityManager.worldEntity.get(
            'WorldMapTileComponent',
            tile => tile.id === exit.levelToCompleteName
          );

          if (!worldTile) {
            throw new Error(`World tile with name "${exit.levelToCompleteName}" not found.`);
          }

          worldTile.isComplete = true;

          const completedLevel = EntityFinders.findLevelByName(entities, exit.levelToCompleteName);
          const bossExit = completedLevel.get('ToBossExitComponent');
          const replacementExit = new ToWorldExitComponent(bossExit.position.clone());

          completedLevel.remove(bossExit);
          completedLevel.add(replacementExit);

          const worldArrival = completedLevel.getAll('ArrivalComponent', ArrivalComponent.isFromWorld)[0];
          worldArrival.x = replacementExit.x;
          worldArrival.y = replacementExit.y + 1;

          this._entityManager.setCurrentLevel(exit.levelToCompleteName, 'world');

          this.emit('level-movement-system.leave-boss-level', 'world', exit.levelToCompleteName);
        } else {
          this.emit('level-movement-system.enter-world-gateway');
        }

        break;

      case 'ToVictoryExitComponent':
        console.log('EXITING TO VICTORY!');

        this.emit('level-movement-system.enter-victory-gateway');

        break;

      default:
        let eventName = exitTypeName === 'ToBossExitComponent'
          ? 'level-movement-system.enter-boss-gateway'
          : 'level-movement-system.enter-level-gateway';
        this.emit(eventName, currentLevel.get('NameComponent').name, exit.toLevelName);
        break;
    }
  }

  _doMovement(currentLevel, hero, mobs, projectiles, entities) {
    const collisions = [];

    this._applyMovementInput(hero, currentLevel, entities, collisions);

    if (collisions.length > 0) {
      this._checkForDoorCollisions(currentLevel, collisions, entities);
    }

    this._moveMobs(mobs, currentLevel);
    this._moveProjectiles(projectiles, currentLevel);

    for (const collision of collisions) {
      collision.pdispose();
    }
  }

  _findExitsHeroIsCollidingWith(hero, level) {
    const heroCurrentBoundingRect = EntityUtils.getPositionedBoundingRect(hero);
    const exitCenter = Vector.pnew();

    for (const exit of level.getAll('ExitComponent')) {
      exitCenter.pinitialize(exit.position.x + 0.5, exit.position.y + 0.5);

      if (heroCurrentBoundingRect.intersectsWith(exitCenter)) {
        exitCenter.pdispose();
        return exit;
      }
    }

    exitCenter.pdispose();
    return null;
  }

  _applyMovementInput(entity, currentLevelEntity, entities, outCollisions = []) {
    const tileMapComp = currentLevelEntity.get('TileMapComponent');
    const movementComp = entity.get('MovementComponent');
    const acceleration = this._calculateAcceleration(entity, entities);

    const positionComp = entity.get('PositionComponent');
    const boundingRectangleComp = entity.get('BoundingRectangleComponent');

    const oldPosX = positionComp.position.x;
    const oldPosY = positionComp.position.y;

    movementComp.velocityVector.x += acceleration * movementComp.directionVector.x;
    movementComp.velocityVector.y += acceleration * movementComp.directionVector.y;
    movementComp.velocityVector.multiply(this._drag);

    const collidedY = this._isTerrainCollision(
      'y',
      positionComp,
      movementComp,
      boundingRectangleComp,
      tileMapComp,
      oldPosY,
      outCollisions
    );
    const collidedX = this._isTerrainCollision(
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

  _calculateAcceleration(entity, entities) {
    //1. base acceleration
    const baseAcceleration = entity.get('StatisticComponent', StatisticComponent.isAcceleration).currentValue;

    //2. base agility modifier
    let baseAgility = 0;
    const agility = entity.get('StatisticComponent', StatisticComponent.isAgility);
    if (agility) {
      baseAgility = agility.currentValue;
    }

    //3. acceleration on all worn items if applicable
    const wearableAcceleration = EntityUtils.calculateStatTotalOnWornEntities(
      entity,
      StatisticComponent.isAcceleration,
      entities
    );

    //4. agility on all worn items if applicable
    const wearableAgility = EntityUtils.calculateStatTotalOnWornEntities(
      entity,
      StatisticComponent.isAgility,
      entities
    );

    //5. base acceleration stat effects
    //TODO: should we accumulate all statistic effects, or should we take the greatest value? Probably greatest.
    const accelerationEffects = entity
      .getAll('StatisticEffectComponent', StatisticComponent.isAcceleration)
      .reduce((total, statEffect) => total + statEffect.value, 0);

    //6. base agility stat effects
    //TODO: should we accumulate all statistic effects, or should we take the greatest value? Probably greatest.
    const agilityEffects = entity
      .getAll('StatisticEffectComponent', StatisticComponent.isAgility)
      .reduce((total, statEffect) => total + statEffect.value, 0);

    //7. total
    const totalAcceleration = baseAcceleration + wearableAcceleration + accelerationEffects;
    const totalAgilityModifier = (baseAgility + wearableAgility + agilityEffects) / 100;

    return _.clamp(totalAcceleration + totalAgilityModifier, 0, Number.MAX_SAFE_INTEGER);
  }

  _checkForDoorCollisions(currentLevel, collisions, entities) {
    const doorComps = currentLevel.get('DoorsComponent');

    if (!doorComps) {
      return;
    }

    const tileMap = currentLevel.get('TileMapComponent');
    const doors = doorComps.doors;

    let done = false;

    for (const collision of collisions) {
      if (done) {
        break;
      }
      for (const door of doors) {
        if (collision.equals(door.position)) {
          const lock = door.lock;
          if (lock && lock.isLocked && lock.canUnlock(entities)) {
            lock.unlock();
          }

          if (!lock || (lock && !lock.isLocked)) {
            this._openDoor(tileMap, door, collision);
            done = true;
            break;
          }
        }
      }
    }
  }

  _moveMobs(mobs, currentLevel) {
    for (const mob of mobs) {
      this._applyMovementInput(mob, currentLevel);

      /*const position = mob.get('PositionComponent');
      const particleEmitters = mob.getAll('ParticleEmitterComponent');

      for (const particleEmitter of particleEmitters) {
        particleEmitter.position.x = position.x + particleEmitter.offset.x;
        particleEmitter.position.y = position.y + particleEmitter.offset.y;
      }*/
    }
  }

  _moveProjectiles(projectiles, currentLevelEnt) {
    for (const projectile of projectiles) {
      const hitTerrain = this._applyMovementInput(projectile, currentLevelEnt);

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

  _isTerrainCollision(
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
      throw new Error(`axis arg "${axis}" is invalid. Must be "x" or "y".`);
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
}
