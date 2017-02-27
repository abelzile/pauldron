'use strict';
import Entity from '../entity';
import FacingComponent from '../components/facing-component';
import Factory from './factory';
import GraphicsComponent from '../components/graphics-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';

export default class MobEntityFactory extends Factory {

  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildMob(id) {

    const mobData = this.entityDict[id];

    if (!mobData) {
      throw new Error(`Invalid mob type id: "${id}"`);
    }

    return new Entity()
      .setTags('mob')
      .add(new FacingComponent())
      .add(new GraphicsComponent('debug'))
      .add(new GraphicsComponent('hp_bar'))
      .add(new MobComponent(id))
      .add(new MovementComponent())
      .add(new PositionComponent())
      .add(this.buildAiComponent(id))
      .add(this.buildBoundingRectComponent(id))
      .add(this.buildExperienceValueComponent(id))
      .add(this.buildShadowSpriteComponent(id))
      .addRange(this.buildAnimatedSpriteComponents(id))
      .addRange(this.buildEntityReferenceComponents(id))
      .addRange(this.buildStatisticComponents(id));

  }

}
