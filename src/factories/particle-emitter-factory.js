import AttackHitEmitter from '../particles/emitters/attack-hit-emitter';

export default class ParticleEmitterFactory {
  constructor(textureData) {
    this.textureDict = textureData;
  }

  buildAttackHitEmitter(attackComponent) {
    return new AttackHitEmitter(this.textureDict['particles'].texture, attackComponent.colors);
  }
}
