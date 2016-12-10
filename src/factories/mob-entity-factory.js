'use strict';
import * as _ from 'lodash';
import * as Pixi from 'pixi.js';
import AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import AiSeekerComponent from '../components/ai-seeker-component';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceValueComponent from '../components/experience-value-component';
import FacingComponent from '../components/facing-component';
import GraphicsComponent from '../components/graphics-component';
import MobComponent from '../components/mob-component';
import MovementComponent from '../components/movement-component';
import PositionComponent from '../components/position-component';
import Rectangle from '../rectangle';
import SpriteComponent from '../components/sprite-component';
import StatisticComponent from '../components/statistic-component';


function buildAiComponent(mobData) {

  const id = mobData.aiId;

  switch (id) {

    case 'ai-random-wanderer':
      return new AiRandomWandererComponent();
    case 'ai-seeker':
      return new AiSeekerComponent();
    default:
      throw new Error('Mob resource file must define an aiId of "ai-random-wanderer" or "ai-seeker". Current value is "' + id + '".');

  }

}

function buildAnimatedSpriteComponents(baseTexture, mobData) {

  const mcs = [];

  const animations = mobData.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const animatedSpriteComponent = new AnimatedSpriteComponent(frames, desc.mobState);
    animatedSpriteComponent.animationSpeed = desc.animationSpeed;

    mcs[i] = animatedSpriteComponent

  }

  return mcs;

}

function buildShadowSpriteComponent(baseTexture, mobData) {
  return new SpriteComponent(new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), mobData.shadowFrame)), 'shadow');
}

function buildBoundingRectComponent(mobData) {
  return new BoundingRectangleComponent(_.assign(new Rectangle(), mobData.boundingRect));
}

function buildEntityReferenceComponents(mobData) {

  const slots = mobData.slots;
  const refs = [];

  for (let i = 0; i < slots.length; ++i) {
    refs[i] = new EntityReferenceComponent(slots[i]);
  }

  return refs;

}

function buildStatisticComponents(mobData) {

  const statistics = mobData.statistics;
  const stats = [];

  for (let i = 0; i < statistics.length; ++i) {

    const stat = statistics[i];

    stats[i] = new StatisticComponent(stat.name, stat.maxValue);

  }

  return stats;

}

function buildExperienceValueComponent(mobData) {
  return new ExperienceValueComponent(mobData.expValue);
}

function buildMobComponent(mobData) {
  return new MobComponent(mobData.id);
}

export function buildMob(imageResources, mobData) {

  let baseTexture;
  if (mobData.baseTextureResourceId) {
    baseTexture = imageResources[mobData.baseTextureResourceId].texture;
  }

  return new Entity()
    .setTags('mob')
    .add(new FacingComponent())
    .add(new GraphicsComponent('debug'))
    .add(new GraphicsComponent('hp_bar'))
    .add(new MovementComponent())
    .add(new PositionComponent())
    .add(buildAiComponent(mobData))
    .add(buildBoundingRectComponent(mobData))
    .add(buildExperienceValueComponent(mobData))
    .add(buildMobComponent(mobData))
    .add(buildShadowSpriteComponent(baseTexture, mobData))
    .addRange(buildAnimatedSpriteComponents(baseTexture, mobData))
    .addRange(buildEntityReferenceComponents(mobData))
    .addRange(buildStatisticComponents(mobData))
    ;

}