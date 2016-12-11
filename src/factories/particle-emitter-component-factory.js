'use strict';
import * as Pixi from 'pixi.js';
import ParticleEmitterComponent from '../components/particle-emitter-component';
import Vector from '../vector';

export function buildParticleEmitterGroup(imageResources, emitterGroupData) {

  const comps = [];
  const emitters = emitterGroupData.emitters;

  for (let i = 0; i < emitters.length; ++i) {

    const emitter = emitters[i];
    const baseTexture = imageResources[emitter.baseTextureResourceId].texture;

    const textures = [];
    const textureFrames = emitter.textureFrames;

    for (let j = 0; j < textureFrames.length; ++j) {
      textures[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), textureFrames[j]));
    }

    comps[i] = new ParticleEmitterComponent(
      textures,
      _.assign(new Vector(), emitter.position),
      _.assign(new Vector(), emitter.velocity),
      emitter.acceleration,
      _.assign(new Vector(), emitter.centerOffset),
      emitter.spread,
      emitter.maxParticles,
      emitter.emissionRate,
      emitter.maxParticleAge,
      emitter.moving,
      emitter.fadeOutAlpha,
      parseInt(emitter.tint || "ffffff", 16));

  }

  return comps;

}