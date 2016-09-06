import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import * as EntityFinders from './entity-finders';
import * as MobMap from './mob-weapon-map';
import _ from 'lodash';
import EventEmitter from 'eventemitter2';
import SpatialGrid from './spatial-grid';


export default class EntityManager extends EventEmitter {

  constructor() {

    super();

    this._currentLevelEntity = undefined;
    this._previousLevelEntityId = '';

    this._armorTemplateEntities = Object.create(null);
    this._containerTemplateEntities = Object.create(null);
    this._itemTemplateEntities = Object.create(null);
    this._magicSpellTemplateEntities = Object.create(null);
    this._mobTemplateEntities = Object.create(null);
    this._projectileTemplateEntities = Object.create(null);
    this._weaponTemplateEntities = Object.create(null);

    this.entities = [];
    this.entitySpatialGrid = undefined;
    this.game = undefined;
    this.heroEntity = undefined;
    this.worldEntity = undefined;

  }

  get previousLevelEntityId() { return this._previousLevelEntityId; }

  get currentLevelEntity() { return this._currentLevelEntity; }
  set currentLevelEntity(value) {

    const oldLevelEnt = this._currentLevelEntity;
    const newLevelEnt = value;

    this._positionHero(oldLevelEnt, newLevelEnt);

    this._createEntitySpatialGrid(newLevelEnt);

    const oldLevelEnts = [].concat(EntityFinders.findContainers(this.entities),
                                   EntityFinders.findItems(this.entities),
                                   EntityFinders.findProjectiles(this.entities),
                                   EntityFinders.findWeapons(this.entities),
                                   EntityFinders.findMobs(this.entities),
                                   EntityFinders.findArmors(this.entities));

    const heroEntRefComps = this.heroEntity.getAll('EntityReferenceComponent');

    _.remove(oldLevelEnts, e => _.some(heroEntRefComps, c => c.entityId === e.id));

    this.removeAll(oldLevelEnts);

    const levelItemComps = newLevelEnt.getAll('LevelItemComponent');

    for (const levelItemComp of levelItemComps) {

      const newItemEnt = this.buildFromItemTemplate(levelItemComp.itemTypeId);
      newItemEnt.get('PositionComponent').position.set(levelItemComp.startPosition.x, levelItemComp.startPosition.y);

      this.add(newItemEnt);
      this.entitySpatialGrid.add(newItemEnt);

      levelItemComp.currentEntityId = newItemEnt.id;

    }

    const levelContainerComps = newLevelEnt.getAll('LevelContainerComponent');

    for (const levelContainerComp of levelContainerComps) {

      const newContainerEnt = this.buildFromContainerTemplate(levelContainerComp.containerTypeId);
      newContainerEnt.get('PositionComponent').position.set(levelContainerComp.startPosition.x, levelContainerComp.startPosition.y);

      this.add(newContainerEnt);
      this.entitySpatialGrid.add(newContainerEnt);

    }

    const levelMobComps = newLevelEnt.getAll('LevelMobComponent');

    for (const levelMobComp of levelMobComps) {

      const newMobEnt = this.buildFromMobTemplate(levelMobComp.mobTypeId);

      const position = newMobEnt.get('PositionComponent');
      position.position.x = levelMobComp.startPosition.x;
      position.position.y = levelMobComp.startPosition.y;
      
      this.add(newMobEnt);
      this.entitySpatialGrid.add(newMobEnt);

      levelMobComp.currentEntityId = newMobEnt.id;
      
      const weaponArgs = MobMap.MobWeaponMap[levelMobComp.mobTypeId];
      
      if (weaponArgs) {
        
        const weaponEnt = this.buildFromWeaponTemplate(weaponArgs.weaponTypeId, weaponArgs.weaponMaterialTypeId);
        newMobEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = weaponEnt.id;

        this.add(weaponEnt);
        
      }

      const magicSpellTypeId = MobMap.MobMagicSpellMap[levelMobComp.mobTypeId];
      
      if (magicSpellTypeId) {
        
        const magicSpellEnt = this.buildFromMagicSpellTemplate(magicSpellTypeId);
        newMobEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId = magicSpellEnt.id;
        
        this.add(magicSpellEnt);                
        
      }
      
    }

    this.entitySpatialGrid.update();

    if (this._currentLevelEntity) {
      this._previousLevelEntityId = this._currentLevelEntity.id;
    }

    this._currentLevelEntity = newLevelEnt;

  }

  _createEntitySpatialGrid(newLevelEntity) {

    const tileMapComp = newLevelEntity.get('TileMapComponent');
    const height = tileMapComp.collisionLayer.length;
    const width = tileMapComp.collisionLayer[0].length;

    this.entitySpatialGrid = new SpatialGrid(width, height, this._getCellSize(width));

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

    this.heroEntity.get('MovementComponent').zeroAll();
    this.heroEntity.get('PositionComponent').position.set(gatewayComp.position.x + 1, gatewayComp.position.y); //TODO: make better

  }

  get armorTemplateEntities() { return this._armorTemplateEntities; }

  get containerTemplateEntities() { return this._containerTemplateEntities; }

  get itemTemplateEntities() { return this._itemTemplateEntities; }

  get magicSpellTemplateEntities() { return this._magicSpellTemplateEntities; }

  get mobTemplateEntities() { return this._mobTemplateEntities; }

  get projectileTemplateEntities() { return this._projectileTemplateEntities; }

  get weaponTemplateEntities() { return this._weaponTemplateEntities; }

  add(entity) {

    this.entities.push(entity);

    return this;

  }

  remove(entity) {

    ArrayUtils.remove(this.entities, entity);

    if (this.entitySpatialGrid) {
      this.entitySpatialGrid.remove(entity);
    }

    this.emit('entity-manager.remove', entity);

  }

  removeAll(entities) {
    _.forEach(entities, e => { this.remove(e); });
  }

  buildFromMobTemplate(key) {
    return this._buildFromTemplate(this._mobTemplateEntities, key);
  }

  buildFromProjectileTemplate(key) {
    return this._buildFromTemplate(this._projectileTemplateEntities, key);
  }

  buildFromWeaponTemplate(weaponTypeId, weaponMaterialTypeId) {

    const template = this._weaponTemplateEntities[weaponTypeId][weaponMaterialTypeId];

    if (!template) { throw new Error(`Weapon template with keys "${weaponTypeId}" and "${weaponMaterialTypeId}" not found.`); }

    return template.clone();

  }

  buildFromArmorTemplate(armorType, material) {

    const templateEnt = this._armorTemplateEntities[armorType][material];

    if (!templateEnt) { throw new Error(`Armor template with keys "${armorType}" and "${material}" not found.`); }

    return templateEnt.clone();
    
  }

  buildFromContainerTemplate(key) {
    return this._buildFromTemplate(this._containerTemplateEntities, key);
  }

  buildFromItemTemplate(key) {
    return this._buildFromTemplate(this._itemTemplateEntities, key);
  }
  
  buildFromMagicSpellTemplate(key) {
    return this._buildFromTemplate(this._magicSpellTemplateEntities, key);
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

    if (!templateEnt) { throw new Error(`Template with key "${key}" not found.`); }

    return templateEnt.clone();

  }

  _getCellSize(value) {

    //TODO: put elsewhere and make better.

    if (value <= 32) return value;

    return 32;

  }

}

