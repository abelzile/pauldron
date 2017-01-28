import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import * as EntityFinders from './entity-finders';
import * as MobMap from './mob-weapon-map';
import EventEmitter from 'eventemitter2';
import SpatialGrid from './spatial-grid';
import * as LevelFactory from './factories/level-entity-factory';
import * as ObjectUtils from './utils/object-utils';

export default class EntityManager extends EventEmitter {

  constructor() {

    super();

    this._currentLevelEntity = undefined;

    this.armorTemplateEntities = Object.create(null);
    this.containerTemplateEntities = Object.create(null);
    this.itemTemplateEntities = Object.create(null);
    this.magicSpellTemplateEntities = Object.create(null);
    this.mobTemplateEntities = Object.create(null);
    this.projectileTemplateEntities = Object.create(null);
    this.weaponTemplateEntities = Object.create(null);

    this.entities = [];
    this.entitySpatialGrid = undefined;
    this.heroEntity = undefined;
    this.worldEntity = undefined;

    this.worldLevelTemplateValues = Object.create(null);

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

    this._positionHero(oldLevelEnt, newLevelEnt);

    this._createEntitySpatialGrid(newLevelEnt);

    const oldLevelEnts = [].concat(
      EntityFinders.findArmors(this.entities),
      EntityFinders.findContainers(this.entities),
      EntityFinders.findItems(this.entities),
      EntityFinders.findMobs(this.entities),
      EntityFinders.findProjectiles(this.entities),
      EntityFinders.findWeapons(this.entities),
    );

    const heroEntRefComps = this.heroEntity.getAll('EntityReferenceComponent');

    _.remove(oldLevelEnts, e => _.some(heroEntRefComps, c => c.entityId === e.id));

    this.removeAll(oldLevelEnts);

    const levelItemComps = newLevelEnt.getAll('LevelItemComponent');

    for (let i = 0; i < levelItemComps.length; ++i) {

      const levelItemComp = levelItemComps[i];

      const newItemEnt = this.buildFromItemTemplate(levelItemComp.itemTypeId);
      newItemEnt.get('PositionComponent').position.set(levelItemComp.startPosition.x, levelItemComp.startPosition.y);

      this.add(newItemEnt);
      this.entitySpatialGrid.add(newItemEnt);

      levelItemComp.currentEntityId = newItemEnt.id;

    }

    const levelContainerComps = newLevelEnt.getAll('LevelContainerComponent');

    for (let i = 0; i < levelContainerComps.length; ++i) {

      const levelContainerComp = levelContainerComps[i];

      const newContainerEnt = this.buildFromContainerTemplate(levelContainerComp.containerTypeId);
      newContainerEnt.get('PositionComponent').position.set(
        levelContainerComp.startPosition.x,
        levelContainerComp.startPosition.y
      );

      this.add(newContainerEnt);
      this.entitySpatialGrid.add(newContainerEnt);

    }

    const levelMobComps = newLevelEnt.getAll('LevelMobComponent');
    let boss = null;

    for (let i = 0; i < levelMobComps.length; ++i) {

      const levelMobComp = levelMobComps[i];

      const newMobEnt = this.buildFromMobTemplate(levelMobComp.mobTypeId);

      const position = newMobEnt.get('PositionComponent');
      position.x = levelMobComp.startPosition.x;
      position.y = levelMobComp.startPosition.y;

      this.add(newMobEnt);
      this.entitySpatialGrid.add(newMobEnt);

      levelMobComp.currentEntityId = newMobEnt.id;

      const weaponArgs = MobMap.MobWeaponMap[levelMobComp.mobTypeId];

      if (weaponArgs) {

        const weaponEnt = this.buildFromWeaponTemplate(weaponArgs.typeId, weaponArgs.materialTypeId);
        newMobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = weaponEnt.id;

        this.add(weaponEnt);

      }

      const magicSpellTypeId = MobMap.MobMagicSpellMap[levelMobComp.mobTypeId];

      if (magicSpellTypeId) {

        const magicSpellEnt = this.buildFromMagicSpellTemplate(magicSpellTypeId);
        newMobEnt.get(
          'EntityReferenceComponent',
          c => c.typeId === Const.MagicSpellSlot.Memory
        ).entityId = magicSpellEnt.id;

        this.add(magicSpellEnt);

      }

      if (levelMobComp.isBoss) {
        boss = newMobEnt;
      }

    }

    if (boss) {

      console.log('boss');

      const tileMap = newLevelEnt.get('TileMapComponent');

      for (let i = 0; i < tileMap.doors.length; ++i) {

        const door = tileMap.doors[i];
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

  setCurrentLevel(levelName, fromLevelName, levelType) {

    const level = EntityFinders.findLevelByName(this.entities, levelName);

    if (level) {
      this.currentLevelEntity = level;
      return;
    }

    if (fromLevelName === 'world') {

      const world = this.worldEntity.get('WorldMapComponent');
      const data = world.getWorldDataByName(levelName);

      if (!data) {
        throw new Error('World data for levelName "' + levelName + '" not found.');
      }

      const templateVals = this.worldLevelTemplateValues[data.levelType];
      const isFirstLevel = data.levelNum === 0;
      const isFinalLevel = data.levelNum === world.worldTileCount - 1;
      const newLevel = LevelFactory.buildWorldLevel(
        levelName,
        templateVals.data,
        templateVals.texture,
        this.mobTemplateEntities,
        isFirstLevel,
        isFinalLevel
      );

      this.add(newLevel);
      data.levelEntityId = newLevel.id;
      this.currentLevelEntity = newLevel;

    } else {

      const exits = this._currentLevelEntity.getAll('ExitComponent');
      const exit = _.find(exits, g => g.toLevelName === levelName);
      const templateVals = this.worldLevelTemplateValues[exit.toLevelType];

      // creating a sub-level.
      const newLevel = LevelFactory.buildSubLevel(
        levelName,
        fromLevelName,
        templateVals.data,
        templateVals.texture,
        this.mobTemplateEntities
      );

      this.add(newLevel);
      this.currentLevelEntity = newLevel;

    }

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

    this.heroEntity.get('MovementComponent').zeroAll();
    this.heroEntity.get('PositionComponent').position.set(arrival.x, arrival.y);

  }

  add(entity) {
    this.entities.push(entity);

    return this;
  }

  remove(entity) {

    ArrayUtils.remove(this.entities, entity);

    this.entitySpatialGrid && this.entitySpatialGrid.remove(entity);

    this.emit('entity-manager.remove', entity);

    const emitters = entity.getAll('ParticleEmitterComponent');

    for (let i = 0; i < emitters.length; ++i) {

      const emitter = emitters[i];
      const particles = emitter.particles;

      for (let j = 0; j < particles.length; ++j) {
        particles[j].pdispose();
      }

      ArrayUtils.clear(emitter.particles);
      //emitter.particles = null;
    }

    ArrayUtils.clear(entity.tags);
    ArrayUtils.clear(entity.components);

  }

  removeAll(entities) {
    for (let i = 0; i < entities.length; ++i) {
      this.remove(entities[i]);
    }
  }

  buildFromMobTemplate(key) {
    return this._buildFromTemplate(this.mobTemplateEntities, key);
  }

  buildFromProjectileTemplate(key) {
    return this._buildFromTemplate(this.projectileTemplateEntities, key);
  }

  buildFromWeaponTemplate(weaponTypeId, weaponMaterialTypeId) {

    const template = this.weaponTemplateEntities[weaponTypeId][weaponMaterialTypeId];

    if (!template) {
      throw new Error(`Weapon template with keys "${weaponTypeId}" and "${weaponMaterialTypeId}" not found.`);
    }

    return template.clone();

  }

  buildFromArmorTemplate(armorType, material) {
    const templateEnt = this.armorTemplateEntities[armorType][material];

    if (!templateEnt) {
      throw new Error(`Armor template with keys "${armorType}" and "${material}" not found.`);
    }

    return templateEnt.clone();
  }

  buildFromContainerTemplate(key) {
    return this._buildFromTemplate(this.containerTemplateEntities, key);
  }

  buildFromItemTemplate(key) {
    return this._buildFromTemplate(this.itemTemplateEntities, key);
  }

  buildFromMagicSpellTemplate(key) {
    return this._buildFromTemplate(this.magicSpellTemplateEntities, key);
  }

  removeLevelItemComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelItemComponent', entity);
  }

  removeLevelMobComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelMobComponent', entity);
  }

  _removeLevelComponentRepresenting(typeName, entity) {
    const compRepresenting = _.find(this._currentLevelEntity.getAll(typeName), e => e.currentEntityId === entity.id);
    compRepresenting && this._currentLevelEntity.remove(compRepresenting);
  }

  _buildFromTemplate(map, key) {

    const templateEnt = map[key];

    if (!templateEnt) {
      throw new Error(`Template with key "${key}" not found.`);
    }

    return templateEnt.clone();

  }

  _getCellSize(value) {
    //TODO: put elsewhere and make better.
    if (value <= Const.ViewPortTileWidth)
      return value;

    return Const.ViewPortTileWidth;
  }

}
