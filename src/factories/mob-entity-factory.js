'use strict';
import Entity from '../entity';
import FacingComponent from '../components/facing-component';
import Factory from './factory';
import GraphicsComponent from '../components/graphics-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import MerchantComponent from '../components/merchant-component';
import * as Const from '../const';
import EntityReferenceComponent from '../components/entity-reference-component';

export default class MobEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildMob(id) {
    const mobData = this.entityDict[id];

    if (!mobData) {
      throw new Error(`Invalid mob type id: "${id}"`);
    }

    const isMerchant = id.startsWith('merchant');

    return new Entity()
      .setTags('mob')
      .add(new FacingComponent())
      .add(new GraphicsComponent('debug'))
      .add(mobData.isHostile ? new GraphicsComponent('hp_bar') : null)
      .add(new MobComponent(id, mobData.isHostile))
      .add(isMerchant ? new MerchantComponent() : null)
      .add(new MovementComponent())
      .add(new PositionComponent())
      .add(this.buildAiComponent(id))
      .add(this.buildBoundingRectComponent(id))
      .add(this.buildExperienceValueComponent(id))
      .add(this.buildShadowSpriteComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(isMerchant ? this.buildMerchantEntityReferenceComponents(id) : this.buildEntityReferenceComponents(id))
      .addRange(this.buildStatisticComponents(id));
  }

  buildMerchantEntityReferenceComponents(id) {
    const refs = [];
    for (let i = 0; i < Const.MerchantStockSlotCount; ++i) {
      refs[i] = new EntityReferenceComponent(Const.MerchantSlot.Stock);
    }
    refs.push(new EntityReferenceComponent(Const.MerchantSlot.Buy));
    return refs;
  }
}
