import AnimatedSpriteComponent from './animated-sprite-component';

export default class WorldMapTileComponent extends AnimatedSpriteComponent {
  constructor(id, levelNum, levelType, difficulty, frames) {
    super(frames, id);
    this.levelNum = levelNum;
    this.levelType = levelType;
    this.difficulty = difficulty;
    this.levelEntityId = '';
    this.isVisited = false;
    this.isComplete = false;
  }
}
