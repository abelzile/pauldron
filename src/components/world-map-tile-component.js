import AnimatedSpriteComponent from './animated-sprite-component';

export default class WorldMapTileComponent extends AnimatedSpriteComponent {
  constructor(id, levelNum, levelType, tier, frames) {
    super(frames, id);
    this.levelNum = levelNum;
    this.levelType = levelType;
    this.tier = tier;
    this.levelEntityId = '';
    this.canBeVisited = false;
    this.isComplete = false;
  }
}
