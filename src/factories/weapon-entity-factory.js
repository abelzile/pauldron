'use strict';
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
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildAnimatedSpriteSettingsComponents(id))
      .addRange(this.buildStatisticComponents(id));

  }

}
