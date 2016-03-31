import _ from 'lodash';
import Digger from './digger';
import Ground from './ground';


export default class Generator {

  generate(caveSize, maxDiggerCount, diggerSpawnChance) {

    const ground = new Ground(caveSize);
    const diggers = [];
    diggers.push(new Digger(ground, ground.caveSize / 2.0, ground.caveSize / 2.0));

    while (diggers.length < maxDiggerCount) {

      for (let i = diggers.length; i-- > 0;) {

        const digger = diggers[i];

        if (digger.isActive) {

          digger.dig();
          digger.move(false);

          if (Math.random() < diggerSpawnChance) {
            diggers.push(digger.spawnNew());
          }

        }

      }

      if (!_.some(diggers, digger => digger.isActive === true) && diggers.length < maxDiggerCount) {

        // reanimate youngest digger and force move.
        const digger = _.last(diggers);
        digger.isActive = true;
        digger.move(true);

      }

    }

    ground.clearBadPatterns();

    return ground.dirt;

  }

}
