'use strict';
import * as _ from 'lodash';
import * as Const from '../const';

export function getCurrentStatisticValues(entity, statfilter, effectFilter) {
  const statsMap = entity.getAllKeyValueMap('StatisticComponent', 'name', 'currentValue', statfilter);
  const effects = entity.getAll(
    'StatisticEffectComponent',
    c => effectFilter(c) && c.effectTimeType === Const.EffectTimeType.Temporary
  );

  for (let i = 0; i < effects.length; ++i) {
    const effect = effects[i];

    if (!_.has(statsMap, effect.name)) {
      continue;
    }

    statsMap[effect.name] += effect.value;
  }

  return statsMap;
}

export function getPositionedBoundingRect(entity) {
  if (!entity) {
    throw new Error('entity argument required.');
  }

  const posComp = entity.get('PositionComponent');

  if (!posComp) {
    throw new Error('Entity does not have PositionComponent.');
  }

  const boundingRectComp = entity.get('BoundingRectangleComponent');

  if (!boundingRectComp) {
    throw new Error('Entity does not have BoundingRectangleComponent.');
  }

  return boundingRectComp.rectangle.getOffsetBy(posComp.position);
}
