import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import * as EntityFinders from './entity-finders';
import * as LevelFactory from './factories/level-entity-factory';
import * as ObjectUtils from './utils/object-utils';
import Entity from './entity';
import EventEmitter from 'eventemitter2';
import SpatialGrid from './spatial-grid';

export default class EntityManager extends EventEmitter {

  constructor(
    armorEntityFactory,
    containerEntityFactory,
    itemEntityFactory,
    magicSpellEntityFactory,
    mobEntityFactory,
    projectileEntityFactory,
    weaponEntityFactory,
    particleEmitterFactory
  ) {

    super();

    this.entities = [];
    this.entitySpatialGrid = null;
    this._currentLevelEntity = null;
    this._mobTemplateEntities = Object.create(null);
    this._mobWeaponMap = Object.create(null);
    this._mobMagicSpellMap = Object.create(null);
    this.worldLevelTemplateValues = Object.create(null);
    this.armorEntityFactory = armorEntityFactory;
    this.containerEntityFactory = containerEntityFactory;
    this.itemEntityFactory = itemEntityFactory;
    this.magicSpellEntityFactory = magicSpellEntityFactory;
    this.mobEntityFactory = mobEntityFactory;
    this.projectileEntityFactory = projectileEntityFactory;
    this.weaponEntityFactory = weaponEntityFactory;
    this.particleEmitterFactory = particleEmitterFactory;

    _.forOwn(this.mobEntityFactory.entityDict, (val, key) => {
      this._mobTemplateEntities[key] = this.mobEntityFactory.buildMob(key);
      this._mobWeaponMap[key] = val.weapon;
    });

  }

  get heroEntity() {
    return EntityFinders.findById(this.entities, Const.EntityId.Hero);
  }

  get worldEntity() {
    return EntityFinders.findById(this.entities, Const.EntityId.World);
  }

  get currentLevelEntity() {
    return this._currentLevelEntity;
  }
  set currentLevelEntity(value) {

    if (value === this._currentLevelEntity) {
      return;
    }

    const oldLevelEnt = this._currentLevelEntity;
    const newLevelEnt = value;

    this._createEntitySpatialGrid(newLevelEnt);

    const oldLevelEnts = [].concat(
      EntityFinders.findArmors(this.entities),
      EntityFinders.findContainers(this.entities),
      EntityFinders.findItems(this.entities),
      EntityFinders.findMobs(this.entities),
      EntityFinders.findProjectiles(this.entities),
      EntityFinders.findWeapons(this.entities)
    );

    const hero = this.heroEntity;
    const heroEntRefComps = hero.getAll('EntityReferenceComponent');

    _.remove(oldLevelEnts, e => _.some(heroEntRefComps, c => c.entityId === e.id));

    this.removeAll(oldLevelEnts);

    const levelItemComps = newLevelEnt.getAll('LevelItemComponent');

    for (let i = 0; i < levelItemComps.length; ++i) {
      const levelItemComp = levelItemComps[i];

      const newItemEnt = this.buildItem(levelItemComp.itemTypeId);
      newItemEnt.get('PositionComponent').position.set(levelItemComp.startPosition.x, levelItemComp.startPosition.y);

      this.add(newItemEnt);
      this.entitySpatialGrid.add(newItemEnt);

      levelItemComp.currentEntityId = newItemEnt.id;
    }

    const levelContainerComps = newLevelEnt.getAll('LevelContainerComponent');

    for (let i = 0; i < levelContainerComps.length; ++i) {
      const levelContainerComp = levelContainerComps[i];

      const newContainerEnt = this.buildContainer(levelContainerComp.containerTypeId);
      newContainerEnt
        .get('PositionComponent')
        .position.set(levelContainerComp.startPosition.x, levelContainerComp.startPosition.y);

      this.add(newContainerEnt);
      this.entitySpatialGrid.add(newContainerEnt);
    }

    const levelMobComps = newLevelEnt.getAll('LevelMobComponent');
    let boss = null;

    for (let i = 0; i < levelMobComps.length; ++i) {
      const levelMobComp = levelMobComps[i];
      const newMobEnt = this.buildMob(levelMobComp.mobTypeId);

      const position = newMobEnt.get('PositionComponent');
      position.x = levelMobComp.startPosition.x;
      position.y = levelMobComp.startPosition.y;

      this.add(newMobEnt);
      this.entitySpatialGrid.add(newMobEnt);

      levelMobComp.currentEntityId = newMobEnt.id;

      const weaponId = this._mobWeaponMap[levelMobComp.mobTypeId];

      if (weaponId) {
        const weaponEnt = this.buildWeapon(weaponId);
        newMobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = weaponEnt.id;

        this.add(weaponEnt);
      }

      const magicSpellTypeId = this._mobMagicSpellMap[levelMobComp.mobTypeId];

      if (magicSpellTypeId) {
        const magicSpellEnt = this.buildMagicSpell(magicSpellTypeId);
        newMobEnt.get(
          'EntityReferenceComponent',
          c => c.typeId === Const.MagicSpellSlot.Memory
        ).entityId = magicSpellEnt.id;

        this.add(magicSpellEnt);
      }

      if (levelMobComp.isBoss) {
        boss = newMobEnt;
      }

      const emitters = newMobEnt.getAll('ParticleEmitterComponent');
      if (emitters && emitters.length > 0) {
        for (let i = 0; i < emitters.length; ++i) {
          const emitter = emitters[i];
          emitter.init(position.position);
        }
      }
    }

    if (boss) {
      const doors = newLevelEnt.get('DoorsComponent');

      for (let i = 0; i < doors.doors.length; ++i) {
        const door = doors.doors[i];
        const lock = door.lock;

        if (lock) {
          const typeName = ObjectUtils.getTypeName(lock);

          switch (typeName) {
            case 'ExitDoorLock': {
              lock.entityId = boss.id;
            }
          }
        }
      }
    }

    this.entitySpatialGrid.update();

    this._currentLevelEntity = newLevelEnt;

  }

  setCurrentLevel(levelName, fromLevelName) {
    //TODO: break this up into some functions.

    let level = EntityFinders.findLevelByName(this.entities, levelName);

    if (level) {

      if (fromLevelName === 'world') {
        this._positionHero(null, level);
      } else {
        this._positionHero(this._currentLevelEntity, level);
      }

    } else {

      if (fromLevelName === 'world') {

        //const world = this.worldEntity.get('WorldMapComponent');

        const tiles = this.worldEntity.getAll('WorldMapTileComponent');
        const data = _.find(tiles, tile => tile.id === levelName);

        if (!data) {
          throw new Error(`World data for levelName "${levelName}" not found.`);
        }

        const templateVals = this.worldLevelTemplateValues[data.levelType];
        const isFirstLevel = data.levelNum === 0;
        const isFinalLevel = data.levelNum === tiles.length - 1;
        level = LevelFactory.buildWorldLevel(
          levelName,
          templateVals.data,
          templateVals.texture,
          this._mobTemplateEntities,
          isFirstLevel,
          isFinalLevel
        );

        data.levelEntityId = level.id;

        this._positionHero(null, level);

      } else {

        const exits = this._currentLevelEntity.getAll('ExitComponent');
        const exit = _.find(exits, g => g.toLevelName === levelName);
        const templateVals = this.worldLevelTemplateValues[exit.toLevelType];

        if (Entity.is(exit, 'ToBossExitComponent')) {

          console.log('build boss level');

          level = LevelFactory.buildBossLevel(
            levelName,
            fromLevelName,
            templateVals.data,
            templateVals.texture,
            this._mobTemplateEntities
          );

        } else {

          // creating a sub-level.
          level = LevelFactory.buildSubLevel(
            levelName,
            fromLevelName,
            templateVals.data,
            templateVals.texture,
            this._mobTemplateEntities
          );

        }

        this._positionHero(this._currentLevelEntity, level);

      }

      this.add(level);

    }

    this.currentLevelEntity = level;

  }

  _createEntitySpatialGrid(newLevelEntity) {

    const tileMapComp = newLevelEntity.get('TileMapComponent');
    const height = tileMapComp.collisionLayer.length;
    const width = tileMapComp.collisionLayer[0].length;

    this.entitySpatialGrid = new SpatialGrid(width, height, this._getCellSize(width));

  }

  _positionHero(oldLevel, newLevel) {

    const newLevelArrivals = newLevel.getAll('ArrivalComponent');
    let oldLevelName;
    if (oldLevel) {
      oldLevelName = oldLevel.get('NameComponent').name;
      if (oldLevelName.startsWith('world')) {
        oldLevelName = 'world';
      }
    } else {
      oldLevelName = 'world';
    }

    let arrival = _.find(newLevelArrivals, a => a.fromLevelName === oldLevelName);
    if (!arrival) {
      arrival = _.find(newLevelArrivals, a => a.fromLevelName.startsWith(oldLevelName));
    }

    const hero = this.heroEntity;
    hero.get('MovementComponent').zeroAll();
    hero.get('PositionComponent').position.set(arrival.x, arrival.y);

  }

  add(entity) {
    this.entities.push(entity);
    this.emit('add', entity);
    return this;
  }

  remove(entity) {

    if (!entity) {
      return;
    }

    ArrayUtils.remove(this.entities, entity);

    this.entitySpatialGrid && this.entitySpatialGrid.remove(entity);

    this.emit('remove', entity);

    this._removeParticleEmitters(entity);

    entity.clear();

  }

  _removeParticleEmitters(entity) {

    const emitters = entity.getAll('ParticleEmitterComponent');

    if (emitters.length === 0) {
      return;
    }

    const holder = EntityFinders.findById(this.entities, Const.EntityId.DeletedEntityEmitterHolder);

    _.forEachRight(
      emitters, emitter => {
        entity.remove(emitter);
        emitter.emitter.pause();
        holder.add(emitter);
      }
    );


  }

  removeAll(entities) {
    _.forEach(entities, e => this.remove(e));
  }

  buildMob(id) {
    return this.mobEntityFactory.buildMob(id);
  }

  buildProjectile(id) {
    return this.projectileEntityFactory.buildProjectile(id);
  }

  buildWeapon(id) {
    return this.weaponEntityFactory.buildWeapon(id);
  }

  buildHeroArmor(id) {
    return this.armorEntityFactory.buildHeroArmor(id);
  }

  buildContainer(id) {
    return this.containerEntityFactory.buildContainer(id);
  }

  buildItem(id) {
    return this.itemEntityFactory.buildItem(id);
  }

  buildMagicSpell(id) {
    return this.magicSpellEntityFactory.buildMagicSpell(id);
  }

  removeLevelItemComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelItemComponent', entity);
  }

  removeLevelMobComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelMobComponent', entity);
  }

  getLevelMobComponentRepresenting(entity) {
    return this._getLevelComponentRepresenting('LevelMobComponent', entity);
  }

  _getLevelComponentRepresenting(typeName, entity) {
    return _.find(this._currentLevelEntity.getAll(typeName), e => e.currentEntityId === entity.id);
  }

  _removeLevelComponentRepresenting(typeName, entity) {
    const compRepresenting = this._getLevelComponentRepresenting(typeName, entity);
    compRepresenting && this._currentLevelEntity.remove(compRepresenting);
  }

  _getCellSize(value) {
    //TODO: put elsewhere and make better.
    if (value <= Const.ViewPortTileWidth) {
      return value;
    }
    return Const.ViewPortTileWidth;
  }

}
