import ContainerComponent from '../components/container-component';
import Entity from '../entity';
import Factory from './factory';
import PositionComponent from '../components/position-component';

export default class ContainerEntityFactory extends Factory {

  constructor(entityDict, textureDict) {
    super(entityDict, textureDict);
  }

  buildContainer(id) {

    const containerData = this.entityDict[id];

    if (!containerData) {
      throw new Error(`Invalid container type id: "${id}"`);
    }

    return new Entity()
      .add(new ContainerComponent(id))
      .add(new PositionComponent())
      .addRange(this.buildAnimatedSpriteComponents(id));

  }

}
