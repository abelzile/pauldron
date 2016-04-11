import * as HexGrid from '../hex-grid';
import LevelScreen from "./level-screen";
import LoadingScreen from './loading-screen';
import Screen from '../screen';
import WorldInputSystem from '../systems/world-input-system';
import WorldMapRenderSystem from '../systems/world-map-render-system';


export default class WorldScreen extends Screen {

  constructor() {

    super();

    this._worldInputSystem = undefined;
    this._worldMapRenderSystem = undefined;
    
  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;
    const hexLayout = this._buildHexGridLayout(renderer, entityManager, HexGrid.Point(9, 9));

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._worldMapRenderSystem = new WorldMapRenderSystem(this, renderer, entityManager, hexLayout);
    this._worldMapRenderSystem.initialize(entities);

    this._worldInputSystem = new WorldInputSystem(renderer, entityManager, hexLayout);
    this._worldInputSystem
        .on('world-input-system.travel', () => { LoadingScreen.load(this.screenManager, true, [ new LevelScreen() ]) })
        .on('world-input-system.cancel-travel', () => { LoadingScreen.load(this.screenManager, true, [ new LevelScreen() ]) });


  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

  }

  handleInput(gameTime, entities, input) {

    super.handleInput(gameTime, entities, input);

    this._worldInputSystem.process(gameTime, entities, input);

  }

  draw(gameTime, entities) {

    super.draw(gameTime, entities);

    this._worldMapRenderSystem.process(gameTime, entities);

  }

  _buildHexGridLayout(renderer, entityManager, hexSize) {

    const screenWidth = renderer.width;
    const screenHeight = renderer.height;
    const scale = renderer.globalScale;

    const hexHeight = hexSize.y * 2;
    const hexWidth = Math.sqrt(3) / 2 * hexHeight;

    const worldMapComp = entityManager.worldEntity.get('WorldMapComponent');

    const mapWidth = hexWidth * worldMapComp.worldData[0].length * scale;
    const mapHeight = hexHeight * worldMapComp.worldData.length * scale;

    return HexGrid.Layout(HexGrid.layout_pointy, hexSize, HexGrid.Point(((screenWidth - mapWidth) / 2) / scale, ((screenHeight - mapHeight) / 2) / scale));

  }

}