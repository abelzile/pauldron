import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HexGrid from '../hex-grid';
import System from '../system';


export default class WorldInputSystem extends System {

  constructor(renderer, entityManager, hexLayout) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;
    this._hexLayout = hexLayout;

  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }
    
    if (this.processButtons(entities, input)) {
      return;
    }

    const mousePoint = input.getMousePosition();
    
    const scale = this._renderer.globalScale;

    const selectedHex = HexGrid.hex_round(HexGrid.pixel_to_hex(this._hexLayout, HexGrid.Point(mousePoint.x / scale, mousePoint.y / scale)));

    console.log(selectedHex);
    
    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');

    const worldData = worldMapComp.worldData;

    if (selectedHex.q < 0 || selectedHex.r < 0 || selectedHex.q >= worldData[0].length || selectedHex.r >= worldData.length) {
      console.log('invalid hex selected (not in world)');
      return;
    }

    const worldMapPointerComp = worldEnt.get('WorldMapPointerComponent');

    const currentLevelHex = worldMapComp.getHexWithLevelEntityId(this._entityManager.currentLevelEntity.id); //this._getCurrentLevelHex();

    let selectedHexValid = false;

    for (let i = 0; i < 6; ++i) {

      const hexNeighbor = HexGrid.hex_neighbor(currentLevelHex, i);

      if (hexNeighbor.q === selectedHex.q && hexNeighbor.r === selectedHex.r && hexNeighbor.s === selectedHex.s) {
        selectedHexValid = true;
        break;
      }

    }

    console.log(JSON.stringify(selectedHex) + ' is ' + !!selectedHexValid);

    if (selectedHexValid) {
      worldMapPointerComp.pointedToHex = selectedHex;
    }

  }

  processButtons(entities, input) {
    
    const mousePoint = input.getMousePosition();

    const worldMapButtonEnts = EntityFinders.findWorldMapButtons(entities);

    for (const btnEnt of worldMapButtonEnts) {

      const btnComp = btnEnt.get('WorldMapButtonComponent');

      if (!btnComp.sprite.containsPoint(mousePoint)) { continue; }

      switch (btnComp.text) {

        case 'Travel':

          console.log('GO!');

          return true;

      }

    }
    
    return false;
    
  }

}