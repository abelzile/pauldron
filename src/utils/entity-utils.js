'use strict';
import _ from 'lodash';
import * as Const from '../const';


export function getCurrentStatisticValues(entity, statfilter, effectFilter) {

  const statsMap = entity.getAllKeyValueMap('StatisticComponent', 'name', 'currentValue', statfilter);
  const effects = entity.getAll('StatisticEffectComponent', c => effectFilter(c) && c.effectTimeType === Const.EffectTimeType.Temporary);

  for (const effect of effects) {

    if (!_.has(statsMap, effect.name)) { continue; }

    statsMap[effect.name] += effect.value;

  }

  return statsMap;

}