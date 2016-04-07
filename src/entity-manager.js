import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import * as EntityFinders from './entity-finders';
import _ from 'lodash';
import EventEmitter from 'eventemitter2';
import MobWeaponMap from './mob-weapon-map';
import SpatialGrid from './spatial-grid';


export default class EntityManager extends EventEmitter {

  constructor() {

    super();

    this._game = undefined;
    this._entities = [];
    this._worldEntity = undefined;
    this._heroEntity = undefined;
    this._currentLevelEntity = undefined;
    this._previousLevelEntityId = '';
    this._entitySpatialGrid = undefined;
    this._mobTemplateEntities = Object.create(null);
    this._weaponTemplateEntities = Object.create(null);
    this._projectileTemplateEntities = Object.create(null);
    this._armorTemplateEntities = Object.create(null);
    this._containerTemplateEntities = Object.create(null);
    this._itemTemplateEntities = Object.create(null);

  }

  get game() { return this._game; }
  set game(val) { this._game = val; }

  get entities() { return this._entities; }
  
  get worldEntity() { return this._worldEntity; }
  set worldEntity(value) { this._worldEntity = value; }

  get heroEntity() { return this._heroEntity; }
  set heroEntity(value) { this._heroEntity = value; }

  get previousLevelEntityId() { return this._previousLevelEntityId; }

  get currentLevelEntity() { return this._currentLevelEntity; }
  set currentLevelEntity(value) {

    const oldLevelEnt = this._currentLevelEntity;
    const newLevelEnt = value;

    this._positionHero(oldLevelEnt, newLevelEnt);

    this._createEntitySpatialGrid(newLevelEnt);

    const oldLevelEnts = [].concat(EntityFinders.findContainers(this._entities),
                                   EntityFinders.findItems(this._entities),
                                   EntityFinders.findProjectiles(this._entities),
                                   EntityFinders.findWeapons(this._entities),
                                   EntityFinders.findMobs(this._entities));

    const heroEntRefComps = this._heroEntity.getAll('EntityReferenceComponent');

    _.remove(oldLevelEnts, e => _.some(heroEntRefComps, c => c.entityId === e.id));

    this.removeAll(oldLevelEnts);

    const levelItemComps = newLevelEnt.getAll('LevelItemComponent');

    for (const levelItemComp of levelItemComps) {

      const newItemEnt = this.buildFromItemTemplate(levelItemComp.itemTypeId);
      newItemEnt.get('PositionComponent').position.set(levelItemComp.startPosition.x, levelItemComp.startPosition.y);

      this.add(newItemEnt);
      this._entitySpatialGrid.add(newItemEnt);

      levelItemComp.currentEntityId = newItemEnt.id;

    }

    const levelContainerComps = newLevelEnt.getAll('LevelContainerComponent');

    for (const levelContainerComp of levelContainerComps) {

      const newContainerEnt = this.buildFromContainerTemplate(levelContainerComp.containerTypeId);
      newContainerEnt.get('PositionComponent').position.set(levelContainerComp.startPosition.x, levelContainerComp.startPosition.y);

      this.add(newContainerEnt);
      this._entitySpatialGrid.add(newContainerEnt);

    }

    const levelMobComps = newLevelEnt.getAll('LevelMobComponent');

    for (const levelMobComp of levelMobComps) {

      const newMobWeaponEnt = this.buildFromWeaponTemplate(MobWeaponMap[levelMobComp.mobTypeId]);

      const newMobEnt = this.buildFromMobTemplate(levelMobComp.mobTypeId);
      newMobEnt.get('PositionComponent').position.set(levelMobComp.startPosition.x, levelMobComp.startPosition.y);
      newMobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = newMobWeaponEnt.id;

      this.add(newMobEnt);
      this.add(newMobWeaponEnt);
      this._entitySpatialGrid.add(newMobEnt);

      levelMobComp.currentEntityId = newMobEnt.id;

    }

    this._entitySpatialGrid.update();

    if (this._currentLevelEntity) {
      this._previousLevelEntityId = this._currentLevelEntity.id;
    }

    this._currentLevelEntity = newLevelEnt;

  }

  _createEntitySpatialGrid(newLevelEntity) {

    const tileMapComp = newLevelEntity.get('TileMapComponent');
    const height = tileMapComp.collisionLayer.length;
    const width = tileMapComp.collisionLayer[0].length;

    this._entitySpatialGrid = new SpatialGrid(width, height, this._getCellSize(width));

  }

  _positionHero(oldLevelEnt, newLevelEnt) {

    let oldLevelNameComp;
    let oldGatewayComps;

    if (oldLevelEnt) {
      oldLevelNameComp = oldLevelEnt.get('NameComponent');
      oldGatewayComps = oldLevelEnt.getAll('GatewayComponent');
    }

    const newLevelNameComp = newLevelEnt.get('NameComponent');
    const newGatewayComps = newLevelEnt.getAll('GatewayComponent');

    let gatewayComp;
    if (oldLevelNameComp) {
      gatewayComp = _.find(newGatewayComps, gw => gw.fromLevelName === newLevelNameComp.name && gw.toLevelName === oldLevelNameComp.name);
    }

    if (!gatewayComp) {
      gatewayComp = newGatewayComps[0];
    }

    this._heroEntity.get('MovementComponent').zeroAll();
    this._heroEntity.get('PositionComponent').position.set(gatewayComp.position.x + 1, gatewayComp.position.y); //TODO: make better

  }

  get entitySpatialGrid() { return this._entitySpatialGrid; }

  get mobTemplateEntities() { return this._mobTemplateEntities; }

  get weaponTemplateEntities() { return this._weaponTemplateEntities; }

  get projectileTemplateEntities() { return this._projectileTemplateEntities; }

  get armorTemplateEntities() { return this._armorTemplateEntities; }

  get containerTemplateEntities() { return this._containerTemplateEntities; }

  get itemTemplateEntities() { return this._itemTemplateEntities; }

  add(entity) {

    this._entities.push(entity);

    return this;

  }

  remove(entity) {

    ArrayUtils.remove(this._entities, entity);

    if (this._entitySpatialGrid) {
      this._entitySpatialGrid.remove(entity);
    }

    this.emit('entity-manager.remove', entity);

  }

  removeAll(entities) {
    _.each(entities, e => { this.remove(e); });
  }

  buildFromMobTemplate(key) {
    return this._buildFromTemplate(this._mobTemplateEntities, key);
  }

  buildFromProjectileTemplate(key) {
    return this._buildFromTemplate(this._projectileTemplateEntities, key);
  }

  buildFromWeaponTemplate(key) {
    return this._buildFromTemplate(this._weaponTemplateEntities, key);
  }

  buildFromArmorTemplate(key) {
    return this._buildFromTemplate(this._armorTemplateEntities, key);
  }

  buildFromContainerTemplate(key) {
    return this._buildFromTemplate(this._containerTemplateEntities, key);
  }

  buildFromItemTemplate(key) {
    return this._buildFromTemplate(this._itemTemplateEntities, key);
  }

  removeLevelItemComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelItemComponent', entity);
  }

  removeLevelMobComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelMobComponent', entity);
  }

  _removeLevelComponentRepresenting(typeName, entity) {

    _.chain(this._currentLevelEntity.getAll(typeName))
     .filter({ currentEntityId: entity.id })
     .each(c => { this._currentLevelEntity.remove(c); })
     .value();

  }

  _buildFromTemplate(map, key) {

    const templateEnt = map[key];

    if (!templateEnt) { throw new Error('Template with key "' + key + '" not found.'); }

    return templateEnt.clone();

  }

  _getCellSize(value) {

    //TODO: put elsewhere and make better.

    if (value <= 32) return value;

    return 32;

  }

}

