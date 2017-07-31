import AttackHitEmitter from '../particles/emitters/attack-hit-emitter';
import ContainerOpenEmitter from '../particles/emitters/container-open-emitter';
import MobDeathEmitter from '../particles/emitters/mob-death-emitter';
import ShowLootEmitter from '../particles/emitters/show-loot-emitter';
import WakeUpEmitter from '../particles/emitters/wake-up-emitter';

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

  buildShowLootEmitter() {
    return new ShowLootEmitter(this.textureDict['particles'].texture);
  }

  buildContainerOpenEmitter() {
    return new ContainerOpenEmitter(this.textureDict['particles'].texture);
  }

  buildWakeUpEmitter() {
    return new WakeUpEmitter(this.textureDict['particles'].texture);
  }
}
