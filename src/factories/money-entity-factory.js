import * as _ from 'lodash';
import Entity from '../entity';
import Factory from './factory';
import PositionComponent from '../components/position-component';
import MoneyComponent from '../components/money-component';

export default class MoneyEntityFactory extends Factory {
  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
    this._moneyData = _.map(["money_1", "money_2", "money_3", "money_4"], (id) => this.entityDict[id]);
    this._moneyData.sort((a, b) => { return a.moneyValue - b.moneyValue; })
  }

  buildMonies(amount) {

    let ids = [];

    while (amount > 0) {

      for (let i = this._moneyData.length; i --> 0; ) {

        const data = this._moneyData[i];

        if (data.moneyValue <= amount) {
          ids.push(data.id);
          amount -= data.moneyValue;
          break;
        }

      }

    }

    const ents = [];

    for (let i = 0; i < ids.length; ++i) {
      const id = ids[i];
      const itemData = this.entityDict[id];

      if (!itemData) {
        throw new Error(`Invalid item type id: "${id}"`);
      }

      ents[i] = new Entity()
        .setTags('money')
        .add(new MoneyComponent(itemData.moneyValue))
        .add(new PositionComponent())
        .add(this.buildBoundingRectComponent(id))
        .add(this.buildShadowSpriteComponent(id))
        .addRange(this.buildAnimatedSpriteComponents(id))
        ;
    }

    return ents;
  }
}