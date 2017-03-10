import AttackHitEmitter from '../particles/emitters/attack-hit-emitter';
import MobDeathEmitter from '../particles/emitters/mob-death-emitter';

export default class ParticleEmitterFactory {
  constructor(textureData) {
    this.textureDict = textureData;
  }

  buildAttackHitEmitter(colors) {
    return new AttackHitEmitter(this.textureDict['particles'].texture, colors);
  }

  buildMobDeathEmitter(mobSize) {
    return new MobDeathEmitter(this.textureDict['particles'].texture, mobSize);
  }
}
