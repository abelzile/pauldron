'use strict';
import * as _ from 'lodash';
import Entity from '../entity';
import Factory from './factory';

export default class WeaponEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildWeapon(id) {
    const weaponData = this.entityDict[id];

    if (!weaponData) {
      throw new Error(`Invalid weapon type id: "${id}"`);
    }

    return new Entity()
      .setTags('weapon')
      .add(this.buildAttackComponent(id))
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .add(this.buildWeaponComponent(id))
      .add(this.buildCostComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildAnimatedSpriteSettingsComponents(id))
      .addRange(this.buildStatisticComponents(id));
  }

  buildHeroWeaponsForTier(tier) {
    return _.chain(this.entityDict)
      .filter(val => _.startsWith(val.id, 'hero_') && val.tier === tier)
      .map(val => this.buildWeapon(val.id))
      .value();
  }
}
