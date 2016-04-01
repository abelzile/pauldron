import * as Const from '../const';
import Entity from '../entity';
import MovieClipComponent from '../components/movie-clip-component';
import Pixi from 'pixi.js';
import PositionComponent from '../components/position-component';
import ContainerComponent from '../components/container-component';


export function buildContainerWoodChestTemplateEntity(resources) {

  const texture = resources['containers'].texture;

  const frames = [
    new Pixi.Texture(texture, new Pixi.Rectangle(0, 0, 16, 16)),
    new Pixi.Texture(texture, new Pixi.Rectangle(16, 0, 16, 16))
  ];

  return new Entity()
    .add(new ContainerComponent(Const.Container.WoodChest))
    .add(new MovieClipComponent(frames))
    .add(new PositionComponent())
    ;

}
