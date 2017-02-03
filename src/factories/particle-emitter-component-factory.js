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

    const tintInts = [];
    buildTints(emitter, tintInts);

    comps[i] = new ParticleEmitterComponent(
      textures,
      new Vector(),
      new Vector(),
      emitter.acceleration,
      emitter.angle,
      _.assign(new Vector(), emitter.offset || new Vector()),
      emitter.spread,
      emitter.maxParticles,
      emitter.emissionRate,
      emitter.maxParticleAge,
      emitter.moving,
      emitter.fadeOutAlpha,
      tintInts,
      emitter.activeFrames,
      emitter.alpha
    );

  }

  return comps;

}

function buildTints(emitter, outTintInts) {

  if (!emitter.tints) {
    outTintInts[0] = parseInt("ffffff", 16);
  } else {
    for (let i = 0; i < emitter.tints.length; ++i) {
      outTintInts[i] = parseInt(emitter.tints[i], 16);
    }
  }

}