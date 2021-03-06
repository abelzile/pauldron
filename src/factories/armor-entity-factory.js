'use strict';
import * as _ from 'lodash';
import Entity from '../entity';
import Factory from './factory';

export default class ArmorEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildArmor(id) {
    const heroArmorData = this.entityDict[id];

    if (!heroArmorData) {
      throw new Error(`Invalid hero armor type id: "${id}"`);
    }

    return new Entity()
      .setTags('armor', ...this._buildTags(heroArmorData))
      .add(this.buildArmorComponent(id))
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .add(this.buildCostComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildAnimatedSpriteSettingsComponents(id))
      .addRange(this.buildStatisticComponents(id));
  }

  _buildTags(data) {
    if (data.hasOwnProperty('armorTypeId')) {
      return [data.armorTypeId];
    }
    return [];
  }

  buildHeroArmorForTier(tier) {
    return _.chain(this.entityDict)
      .filter(val => _.startsWith(val.id, 'hero_') && val.tier === tier)
      .map(val => this.buildArmor(val.id))
      .value();
  }
}
