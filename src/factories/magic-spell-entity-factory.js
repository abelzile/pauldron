import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import ChargeAttackComponent from '../components/charge-attack-component';
import ChargeEmitter from '../particles/emitters/charge-emitter';
import Entity from '../entity';
import Factory from './factory';
import ParticleEmitterComponent from '../components/particle-emitter-component';
import RangedMagicSpellComponent from '../components/ranged-magic-spell-component';
import SelfMagicSpellComponent from '../components/self-magic-spell-component';
import SlashAttackComponent from '../components/slash-attack-component';
import StatisticComponent from '../components/statistic-component';
import Vector from '../vector';

export default class MagicSpellEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);

    this.actionFuncs = {
      charge: function(hero, mouseWorldPosition, mouseScreenPosition) {
        const m = hero.get('MovementComponent');
        const p = hero.get('PositionComponent');
        m.movementAngle = Math.atan2(mouseWorldPosition.y - p.position.y, mouseWorldPosition.x - p.position.x);
        m.velocityVector.zero();

        const attack = this.get('ChargeAttackComponent');

        if (!attack) {
          return;
        }

        const halfTile = Const.TilePixelSize * Const.ScreenScale / 2;
        let attackOriginOffset = Vector.pnew(p.x + 0.5, p.y + 0.5);
        let mouseAttackOriginOffset = Vector.pnew(mouseScreenPosition.x - halfTile, mouseScreenPosition.y - halfTile);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
          mouseAttackOriginOffset,
          p.position
        );
        const stats = this.getAllKeyed('StatisticComponent', 'name');

        attack.init(
          attackOriginOffset,
          mouseTilePosition,
          stats[Const.Statistic.Range].currentValue,
          stats[Const.Statistic.Arc].currentValue,
          stats[Const.Statistic.Duration].currentValue,
          stats[Const.Statistic.Damage].currentValue
        );

        const particleTexture = textureDict['particles'].texture;
        const particleEmitterComponent = new ParticleEmitterComponent(new ChargeEmitter(particleTexture, hero));
        hero.add(particleEmitterComponent);
        particleEmitterComponent.emitter.start();

        attackOriginOffset.pdispose();
        attackOriginOffset = null;

        mouseAttackOriginOffset.pdispose();
        mouseAttackOriginOffset = null;
      }
    };
  }

  buildMagicSpell(id) {
    const spellData = this.entityDict[id];

    if (!spellData) {
      throw new Error(`Invalid spell type id: "${id}"`);
    }

    const entity = new Entity();
    entity
      .add(this.buildSpellAttackComponent(id))
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .add(this.buildMagicSpellComponent(id))
      .addRange(this.buildStatisticComponents(id))
      .addRange(this.buildStatisticEffectComponents(id))
      .add(this.buildMagicSpellParticleEmitterComponent(id, entity));

    return entity;
  }

  buildSpellAttackComponent(id) {
    const entityData = this.entityDict[id];

    if (!entityData.isMeleeAttackSpell) {
      return null;
    }

    switch (entityData.attackShapeId) {
      case 'slash':
        return new SlashAttackComponent();
      case 'charge':
        return new ChargeAttackComponent();
      default:
        throw new Error(
          `Weapon resource file must define an attackShapeId of "slash" or "charge". Current value is ${entityData.attackShapeId}`
        );
    }
  }

  buildMagicSpellComponent(id) {
    const entityData = this.entityDict[id];

    switch (entityData.spellStyleId) {
      case 'self':
        let actionFunc;
        if (entityData.actionFuncId) {
          actionFunc = this.actionFuncs[entityData.actionFuncId];
        }

        return new SelfMagicSpellComponent(
          entityData.id,
          actionFunc,
          entityData.attackShapeId,
          parseInt(entityData.attackGradientColor1, 16),
          parseInt(entityData.attackGradientColor2, 16)
        );

      case 'ranged':
        return new RangedMagicSpellComponent(entityData.id, entityData.projectileTypeId, entityData.projectileCount);
      default:
        throw new Error(
          `spellData requires a spellStyleId value of "self" or "ranged". Current value is "${entityData.spellStyleId}"`
        );
    }
  }

  buildMagicSpellParticleEmitterComponent(id, entity) {
    const particleTexture = this.textureDict['particles'].texture;

    switch (id) {
      case 'charge':
        return null; //new ParticleEmitterComponent(new ChargeEmitter(particleTexture, entity));
      default:
        return null;
    }
  }
}
