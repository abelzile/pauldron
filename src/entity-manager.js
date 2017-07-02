import * as _ from 'lodash';
import * as ArrayUtils from './utils/array-utils';
import * as Const from './const';
import * as EntityFinders from './entity-finders';
import * as ObjectUtils from './utils/object-utils';
import Entity from './entity';
import EventEmitter from 'eventemitter2';
import InteractionDelayComponent from './components/interaction-delay-component';
import SpatialGrid from './spatial-grid';
import EntityReferenceComponent from './components/entity-reference-component';
import WorldMapTileComponent from './components/world-map-tile-component';

export default class EntityManager extends EventEmitter {
  constructor(
    levelEntityFactory,
    armorEntityFactory,
    containerEntityFactory,
    itemEntityFactory,
    magicSpellEntityFactory,
    mobEntityFactory,
    projectileEntityFactory,
    weaponEntityFactory,
    particleEmitterFactory,
    moneyEntityFactory,
    lootTypeDict,
    containerDropTypeLootDict
  ) {
    super();

    this.entities = [];
    this.levelEntityFactory = levelEntityFactory;
    this.armorEntityFactory = armorEntityFactory;
    this.containerEntityFactory = containerEntityFactory;
    this.itemEntityFactory = itemEntityFactory;
    this.magicSpellEntityFactory = magicSpellEntityFactory;
    this.mobEntityFactory = mobEntityFactory;
    this.projectileEntityFactory = projectileEntityFactory;
    this.weaponEntityFactory = weaponEntityFactory;
    this.particleEmitterFactory = particleEmitterFactory;
    this.moneyEntityFactory = moneyEntityFactory;
    this._currentLevelEntity = null;
    this._heroEntity = null;
    this._worldEntity = null;
    this._mobTemplateEntities = Object.create(null);
    this._mobWeaponMap = Object.create(null);
    this._mobMagicSpellMap = Object.create(null);
    this._lootTypeDict = lootTypeDict;
    this._containerDropTypeLootDict = containerDropTypeLootDict;
    this._entitySpatialGrid = null;

    _.forOwn(this.mobEntityFactory.entityDict, (val, key) => {
      this._mobTemplateEntities[key] = this.mobEntityFactory.buildMob(key);
      this._mobWeaponMap[key] = val.weapon;
    });
  }

  get heroEntity() {
    if (!this._heroEntity) {
      this._heroEntity = EntityFinders.findById(this.entities, Const.EntityId.Hero);
    }
    return this._heroEntity;
  }

  get worldEntity() {
    if (!this._worldEntity) {
      this._worldEntity = EntityFinders.findById(this.entities, Const.EntityId.World);
    }
    return this._worldEntity;
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
      EntityFinders.findWeapons(this.entities),
      EntityFinders.findMonies(this.entities)
    );

    const hero = this.heroEntity;
    const heroEntRefs = hero.getAll('EntityReferenceComponent');

    _.remove(oldLevelEnts, e => _.some(heroEntRefs, c => c.entityId === e.id));

    this.removeAll(oldLevelEnts);

    const levelItems = newLevelEnt.getAll('LevelItemComponent');
    for (const levelItem of levelItems) {
      const newItemEnt = this.buildItem(levelItem.itemTypeId);
      newItemEnt.get('PositionComponent').position.set(levelItem.startPosition.x, levelItem.startPosition.y);

      this.add(newItemEnt);
      this._entitySpatialGrid.add(newItemEnt);

      levelItem.currentEntityId = newItemEnt.id;
    }

    const levelContainers = newLevelEnt.getAll('LevelContainerComponent');
    for (const levelContainer of levelContainers) {
      const newContainer = this.buildContainer(levelContainer.containerTypeId);
      newContainer
        .get('PositionComponent')
        .position.set(levelContainer.startPosition.x, levelContainer.startPosition.y);

      this.add(newContainer);
      this._entitySpatialGrid.add(newContainer);

      levelContainer.currentEntityId = newContainer.id;
    }

    const levelMobComps = newLevelEnt.getAll('LevelMobComponent');
    let boss = null;

    for (const levelMobComp of levelMobComps) {
      const mobTypeId = levelMobComp.mobTypeId;
      const newMobEnt = this.buildMob(mobTypeId);
      const position = newMobEnt.get('PositionComponent');
      position.x = levelMobComp.startPosition.x;
      position.y = levelMobComp.startPosition.y;

      this.add(newMobEnt);
      this._entitySpatialGrid.add(newMobEnt);

      levelMobComp.currentEntityId = newMobEnt.id;

      if (newMobEnt.has('MerchantComponent')) {
        this._equipMerchant(mobTypeId, newMobEnt, newLevelEnt);
      } else {
        this._equipMob(mobTypeId, newMobEnt);
      }

      if (levelMobComp.isBoss) {
        boss = newMobEnt;
      }

      const emitters = newMobEnt.getAll('ParticleEmitterComponent');
      if (!_.isEmpty(emitters)) {
        for (const emitter of emitters) {
          emitter.init(position.position);
        }
      }
    }

    if (boss) {
      const doors = newLevelEnt.get('DoorsComponent');

      for (const door of doors.doors) {
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

    this._entitySpatialGrid.update();

    this._currentLevelEntity = newLevelEnt;
  }

  _equipMob(mobTypeId, mob) {
    const weaponId = this._mobWeaponMap[mobTypeId];

    if (weaponId) {
      const hand1Slot = mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);
      if (hand1Slot) {
        const weapons = this.buildWeapon(weaponId);
        hand1Slot.entityId = weapons.id;
        this.add(weapons);
      }
    }

    const magicSpellTypeId = this._mobMagicSpellMap[mobTypeId];

    if (magicSpellTypeId) {
      const memorySlot = mob.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory);
      if (memorySlot) {
        const magicSpell = this.buildMagicSpell(magicSpellTypeId);
        memorySlot.entityId = magicSpell.id;
        this.add(magicSpell);
      }
    }
  }

  _equipMerchant(mobTypeId, mob, level) {
    const levelTier = level.get('TierComponent').tier;
    const minTier = _.minBy(this._worldEntity.getAll('WorldMapTileComponent'), WorldMapTileComponent.getTier).tier;
    const maxTier = _.maxBy(this._worldEntity.getAll('WorldMapTileComponent'), WorldMapTileComponent.getTier).tier;
    const itemsForSaleTier = _.clamp(levelTier + 1, minTier, maxTier);
    const items = this._buildMerchantItems(mobTypeId, itemsForSaleTier);
    const stockSlots = mob.getAll('EntityReferenceComponent', EntityReferenceComponent.isMerchantStockSlot);

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const icon = item.get('InventoryIconComponent');
      icon.allowedSlotTypes = _.map(icon.allowedSlotTypes, s => '~' + s);
      icon.allowedSlotTypes.push(Const.MerchantSlot.Stock, Const.MerchantSlot.Buy);
      stockSlots[i].entityId = item.id;
      this.add(item);
    }
  }

  _buildMerchantItems(mobTypeId, tier) {
    switch (mobTypeId) {
      case Const.Mob.WeaponMerchant:
        return this.weaponEntityFactory.buildHeroWeaponsForTier(tier);
      case Const.Mob.ArmorMerchant:
        return this.armorEntityFactory.buildHeroArmorForTier(tier);
      default:
        throw new Error(`"${mobTypeId}" is not a valid merchant mob type.`);
    }
  }

  getEntitiesAdjacentToHero() {
    this._entitiesAdjacentToHero =
      this._entitiesAdjacentToHero || this._entitySpatialGrid.getAdjacentEntities(this.heroEntity);
    return this._entitiesAdjacentToHero;
  }

  entitySpatialGridUpdate() {
    this._entitiesAdjacentToHero = null;
    this._entitySpatialGrid.update();
  }

  entitySpatialGridAdd(entity) {
    this._entitySpatialGrid.add(entity);
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
        const tiles = this.worldEntity.getAll('WorldMapTileComponent');
        const tileData = _.find(tiles, tile => tile.id === levelName);

        if (!tileData) {
          throw new Error(`World data for levelName "${levelName}" not found.`);
        }

        const isFirstLevel = tileData.levelNum === 0;
        const isFinalLevel = tileData.levelNum === tiles.length - 1;
        level = this.levelEntityFactory.buildWorldLevel(
          tileData,
          this._mobTemplateEntities,
          isFirstLevel,
          isFinalLevel
        );

        tileData.levelEntityId = level.id;

        this._positionHero(null, level);
      } else {
        const exits = this._currentLevelEntity.getAll('ExitComponent');
        const exit = _.find(exits, g => g.toLevelName === levelName);

        if (Entity.is(exit, 'ToBossExitComponent')) {
          console.log('build boss level');

          const tiles = this.worldEntity.getAll('WorldMapTileComponent');
          const data = _.find(tiles, tile => tile.id === this._currentLevelEntity.get('NameComponent').name);
          const isFinalLevel = data.levelNum === tiles.length - 1;

          level = this.levelEntityFactory.buildBossLevel(
            levelName,
            exit.toLevelType,
            fromLevelName,
            this._mobTemplateEntities,
            isFinalLevel
          );
        } else {
          // creating a sub-level.
          level = this.levelEntityFactory.buildSubLevel(
            levelName,
            exit.toLevelType,
            fromLevelName,
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

    this._entitySpatialGrid = new SpatialGrid(width, height, this._getCellSize(width));
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

    this._entitySpatialGrid && this._entitySpatialGrid.remove(entity);

    this.emit('remove', entity);

    this.removeParticleEmitters(entity);

    entity.clear();
  }

  removeParticleEmitters(entity) {
    const emitters = entity.getAll('ParticleEmitterComponent');

    if (emitters.length === 0) {
      return;
    }

    for (let i = emitters.length; i-- > 0; ) {
      const emitter = emitters[i];
      entity.remove(emitter);
      this.moveParticleEmitterToHolder(entity, emitter);
    }
  }

  moveParticleEmitterToHolder(entity, emitter) {
    const holder = EntityFinders.findById(this.entities, Const.EntityId.DeletedEntityEmitterHolder);
    emitter.emitter.pause();
    holder.add(emitter);
  }

  removeAll(entities) {
    for (const entity of entities) {
      this.remove(entity);
    }
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

  buildArmor(id) {
    return this.armorEntityFactory.buildArmor(id);
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

  removeLevelContainerComponentRepresenting(entity) {
    this._removeLevelComponentRepresenting('LevelContainerComponent', entity);
  }

  buildLoot(containerEntity) {
    const container = containerEntity.get('ContainerComponent');
    const heroLvl = this.heroEntity.get('ExperienceComponent').level;

    const lootTypes = this._containerDropTypeLootDict[container.dropTypeId];
    if (!lootTypes || lootTypes.length === 0) {
      throw new Error(`No loot types found for container drop type "${container.dropTypeId}".`);
    }

    const lootTypeId = ArrayUtils.selectWeighted(lootTypes).id;

    const loots = this._lootTypeDict[lootTypeId];
    if (!loots || loots.length === 0) {
      throw new Error(`No loot found for loot type "${lootTypeId}".`);
    }

    const filteredLoots = loots.filter(loot => loot.min <= heroLvl && loot.max >= heroLvl);
    if (filteredLoots.length === 0) {
      throw new Error(`No loot found for loot type "${lootTypeId}" for hero level ${heroLvl}`);
    }

    const lootId = _.sample(filteredLoots).id;

    return this._buildLoot(lootTypeId, lootId);
  }

  _buildLoot(lootTypeId, lootId) {
    let loot = null;

    switch (lootTypeId) {
      case Const.LootType.Healing:
        loot = this.buildItem(lootId);
        break;
      default:
        throw new Error(`No build function found for lootTypeId "${lootTypeId}".`);
    }

    loot.add(new InteractionDelayComponent(1000));

    return loot;
  }

  buildMonies(amount) {
    return this.moneyEntityFactory.buildMonies(amount);
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
