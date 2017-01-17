'use strict';
import * as _ from 'lodash';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import RangedMagicSpellComponent from '../components/ranged-magic-spell-component';
import SelfMagicSpellComponent from '../components/self-magic-spell-component';
import StatisticComponent from '../components/statistic-component';
import StatisticEffectComponent from '../components/statistic-effect-component';
import Vector from '../vector';


const actionFuncs = Object.create(null);
actionFuncs['melee'] = function(hero, mouseWorldPosition, mouseScreenPosition) {

  const m = hero.get('MovementComponent');
  const p = hero.get('PositionComponent');
  m.movementAngle = Math.atan2(mouseWorldPosition.y - p.position.y, mouseWorldPosition.x - p.position.x);
  m.velocityVector.zero();
  m.directionVector.x = Math.cos(m.movementAngle);
  m.directionVector.y = Math.sin(m.movementAngle);

  const attack = this.get('MeleeAttackComponent');

  if (!attack) { return; }

  const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
  let heroAttackOriginOffset = Vector.pnew(p.x + .5, p.y + .5);
  let mouseAttackOriginOffset = Vector.pnew(mouseScreenPosition.x - halfTile, mouseScreenPosition.y - halfTile);
  const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, p.position);
  const stats = this.getAllKeyed('StatisticComponent', 'name');

  attack.init(heroAttackOriginOffset,
              mouseTilePosition,
              stats[Const.Statistic.Range].currentValue,
              stats[Const.Statistic.Arc].currentValue,
              stats[Const.Statistic.Duration].currentValue,
              stats[Const.Statistic.Damage].currentValue,
              stats[Const.Statistic.KnockBackDuration].currentValue);

  heroAttackOriginOffset.pdispose();
  heroAttackOriginOffset = null;

  mouseAttackOriginOffset.pdispose();
  mouseAttackOriginOffset = null;

};


function buildFunc(str) {

  if (!str) { return _.noop; }

  let args = str.substring(str.indexOf('(') + 1, str.indexOf(')'));
  args = _.trim(args);

  let argsArray = [];
  if (args.length > 0) {
    argsArray = _.map(args.split(','), _.trim);
  }

  let body = str.substring(str.indexOf('{') + 1, str.lastIndexOf('}'));

  return argsArray.length === 0 ? new Function(body) : new Function(argsArray, body);

}

function buildMagicSpellComponent(spellData) {

  switch (spellData.spellStyleId) {

    case 'self':

      let actionFunc;
      if (spellData.actionFuncId) {
        actionFunc = actionFuncs[spellData.actionFuncId];
      }

      return new SelfMagicSpellComponent(spellData.id,
                                         actionFunc,
                                         spellData.attackShapeId,
                                         parseInt(spellData.gradientColor1, 16),
                                         parseInt(spellData.gradientColor2, 16));

    case 'ranged':
      return new RangedMagicSpellComponent(spellData.id, spellData.projectileTypeId, spellData.projectileCount);
    default:
      throw new Error('spellData requires a spellStyleId value of "self" or "ranged". Current value is "' + spellData.spellStyleId + '"');

  }

}

function buildInventoryIconComponent(baseTexture, values) {

  if (!values.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), values.icon));

  return new InventoryIconComponent(iconTexture, ...values.slots);

}

function buildLevelIconComponent(baseTexture, values) {

  if (!values.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), values.icon));

  return new LevelIconComponent(iconTexture);

}

function buildStatisticComponents(spellData) {

  const statistics = spellData.statistics;
  const stats = [];

  for (let i = 0; i < statistics.length; ++i) {

    const stat = statistics[i];

    stats[i] = new StatisticComponent(stat.name, stat.maxValue);

  }

  return stats;

}

function buildStatisticEffectComponents(spellData) {

  const statisticEffects = spellData.statisticEffects;
  const statEffects = [];

  for (let i = 0; i < statisticEffects.length; ++i) {

    const statEffect = statisticEffects[i];

    let onRemoveFromEntity;
    if (statEffect.onRemoveFromEntity) {
      onRemoveFromEntity = buildFunc(statEffect.onRemoveFromEntity);
    }

    statEffects[i] = new StatisticEffectComponent(statEffect.name,
                                                  statEffect.value,
                                                  statEffect.timeLeft,
                                                  statEffect.targetType,
                                                  statEffect.statisticEffectValue,
                                                  statEffect.effectTimeType,
                                                  onRemoveFromEntity);

  }

  return statEffects;

}

function buildAnimatedSpriteComponents(baseTexture, spellData) {

  const mcs = [];

  if (!spellData.animations) { return mcs; }

  const animations = spellData.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const component = new AnimatedSpriteComponent(frames);

    if (desc.animationSpeed) {
      component.animationSpeed = desc.animationSpeed;
    }

    if (spellData.anchor) {
      component.anchor.x = spellData.anchor.x;
      component.anchor.y = spellData.anchor.y;
    }

    if (spellData.pivot) {
      component.pivot.x = spellData.pivot.x;
      component.pivot.y = spellData.pivot.y;
    }

    mcs[i] = component

  }

  return mcs;

}

export function buildMagicSpell(imageResources, spellData) {

  let baseTexture;
  if (spellData.baseTextureResourceId) {
    baseTexture = imageResources[spellData.baseTextureResourceId].texture;
  }

  const entity = new Entity()
    .add(buildInventoryIconComponent(baseTexture, spellData))
    .add(buildLevelIconComponent(baseTexture, spellData))
    .add(buildMagicSpellComponent(spellData))
    //.addRange(buildAnimatedSpriteComponents(baseTexture, spellData)) // is this required? if so, must update code to hide appropriately in mob-render-system load.
    .addRange(buildStatisticComponents(spellData))
    .addRange(buildStatisticEffectComponents(spellData))
    ;

  if (spellData.isMeleeAttackSpell) {
    entity.add(new MeleeAttackComponent());
  }

  return entity;

}