'use strict';
import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import Entity from '../entity';
import Factory from './factory';
import MeleeAttackComponent from '../components/melee-attack-component';
import StatisticComponent from '../components/statistic-component';
import Vector from '../vector';
import SelfMagicSpellComponent from '../components/self-magic-spell-component';
import RangedMagicSpellComponent from '../components/ranged-magic-spell-component';

export default class MagicSpellEntityFactory extends Factory {

  constructor(entityDict, textureDict) {

    super(entityDict, textureDict);

    this.actionFuncs = Object.create(null);
    this.actionFuncs['melee'] = function(hero, mouseWorldPosition, mouseScreenPosition) {

      const m = hero.get('MovementComponent');
      const p = hero.get('PositionComponent');
      m.movementAngle = Math.atan2(mouseWorldPosition.y - p.position.y, mouseWorldPosition.x - p.position.x);
      m.velocityVector.zero();

      const attack = this.get('MeleeAttackComponent');

      if (!attack) {
        return;
      }

      const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
      let heroAttackOriginOffset = Vector.pnew(p.x + .5, p.y + .5);
      let mouseAttackOriginOffset = Vector.pnew(mouseScreenPosition.x - halfTile, mouseScreenPosition.y - halfTile);
      const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, p.position);
      const stats = this.getAllKeyed('StatisticComponent', 'name');

      attack.init(
        heroAttackOriginOffset,
        mouseTilePosition,
        stats[Const.Statistic.Range].currentValue,
        stats[Const.Statistic.Arc].currentValue,
        stats[Const.Statistic.Duration].currentValue,
        stats[Const.Statistic.Damage].currentValue,
        stats[Const.Statistic.KnockBackDuration].currentValue
      );

      heroAttackOriginOffset.pdispose();
      heroAttackOriginOffset = null;

      mouseAttackOriginOffset.pdispose();
      mouseAttackOriginOffset = null;

    };

  }

  buildMagicSpell(id) {

    const spellData = this.entityDict[id];

    if (!spellData) {
      throw new Error(`Invalid spell type id: "${id}"`);
    }

    return new Entity()
      .add(spellData.isMeleeAttackSpell ? new MeleeAttackComponent() : null)
      .add(this.buildInventoryIconComponent(id))
      .add(this.buildLevelIconComponent(id))
      .add(this.buildMagicSpellComponent(id))
      .addRange(this.buildStatisticComponents(id))
      .addRange(this.buildStatisticEffectComponents(id))

  }

  buildMagicSpellComponent(id) {

    const entityData = this.entityDict[id];

    switch (entityData.spellStyleId) {

      case 'self':

        let actionFunc;
        if (entityData.actionFuncId) {
          actionFunc = this.actionFuncs[entityData.actionFuncId];
        }

        return new SelfMagicSpellComponent(entityData.id,
          actionFunc,
          entityData.attackShapeId,
          parseInt(entityData.attackGradientColor1, 16),
          parseInt(entityData.attackGradientColor2, 16));

      case 'ranged':
        return new RangedMagicSpellComponent(entityData.id, entityData.projectileTypeId, entityData.projectileCount);
      default:
        throw new Error(`spellData requires a spellStyleId value of "self" or "ranged". Current value is "${entityData.spellStyleId}"`);

    }

  }

}
