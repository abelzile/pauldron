'use strict';
import Entity from '../entity';
import Factory from './factory';

export default class ArmorEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildHeroArmor(id) {
    const heroArmorData = this.entityDict[id];

    if (!heroArmorData) {
      throw new Error(`Invalid hero armor type id: "${id}"`);
    }

    return new Entity()
      .setTags('armor')
      .add(this.buildArmorComponent(id))
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildStatisticComponents(id));
  }
}
