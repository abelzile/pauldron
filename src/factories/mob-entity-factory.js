'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import FacingComponent from '../components/facing-component';
import Factory from './factory';
import GraphicsComponent from '../components/graphics-component';
import MerchantComponent from '../components/merchant-component';
import MobComponent from '../components/mob-component';
import MoneyComponent from '../components/money-component';
import MovementComponent from '../components/movement-component';
import ParticleEmitterComponent from '../components/particle-emitter-component';
import PositionComponent from '../components/position-component';
import WakeUpEmitter from '../particles/emitters/wake-up-emitter';

export default class MobEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildMob(id) {
    const mobData = this.entityDict[id];

    if (!mobData) {
      throw new Error(`Invalid mob type id: "${id}"`);
    }

    const isMerchant = _.endsWith(id, '_merchant');

    const entity = new Entity();
    return entity
      .setTags('mob')
      .add(new FacingComponent())
      .add(new GraphicsComponent('debug'))
      .add(mobData.isHostile ? new GraphicsComponent('hp_bar') : null)
      .add(new MobComponent(id, mobData.isHostile))
      .add(isMerchant ? new MerchantComponent() : null)
      .add(new MovementComponent())
      .add(new PositionComponent())
      .add(this.buildMoneyComponent(id))
      .add(this.buildAiComponent(id))
      .add(this.buildBoundingRectComponent(id))
      .add(this.buildExperienceValueComponent(id))
      .add(this.buildShadowSpriteComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(isMerchant ? this.buildMerchantEntityReferenceComponents(id) : this.buildEntityReferenceComponents(id))
      .addRange(this.buildStatisticComponents(id))
      .add(
        mobData.isHostile
          ? new ParticleEmitterComponent(new WakeUpEmitter(this.textureDict['particles'].texture, entity))
          : null
      );
  }

  buildMoneyComponent(id) {
    const entityData = this.entityDict[id];

    return _.has(entityData, 'moneyValue') ? new MoneyComponent(entityData.moneyValue) : null;
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
