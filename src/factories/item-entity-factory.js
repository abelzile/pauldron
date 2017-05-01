import Entity from '../entity';
import Factory from './factory';
import ItemComponent from '../components/item-component';
import PositionComponent from '../components/position-component';

export default class ItemEntityFactory extends Factory {

  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildItem(id) {

    const itemData = this.entityDict[id];

    if (!itemData) {
      throw new Error(`Invalid item type id: "${id}"`);
    }

    return new Entity()
      .add(new ItemComponent(id))
      .add(new PositionComponent())
      .add(this.buildBoundingRectComponent(id))
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .add(this.buildShadowSpriteComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildStatisticEffectComponents(id));

  }

}
