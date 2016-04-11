import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EnumUtils from "../utils/enum-utils";
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
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

    const buttonEnts = EntityFinders.findWorldMapButtons(entities);
    const mousePoint = input.getMousePosition();

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    const worldData = worldMapComp.worldData;

    const worldMapPointerEnt = EntityFinders.findWorldMapPointer(entities);
    const worldMapPointerComp = worldMapPointerEnt.get('WorldMapPointerComponent');

    if (this._isButtonClicked(buttonEnts, mousePoint)) {

      const buttonText = this._getClickedButton(buttonEnts, mousePoint);

      switch (buttonText) {

        case Const.WorldButtonText.Travel:

          const pointedToHex = worldMapPointerComp.pointedToHex;
          const data = worldData[pointedToHex.r][pointedToHex.q];

          this._entityManager.currentLevelEntity = EntityFinders.findById(entities, data.levelEntityId);
          
          this.emit('world-input-system.travel');

          break;

        case Const.WorldButtonText.Cancel:

          this.emit('world-input-system.cancel-travel');

          break;

      }

      return;

    }

    const scale = this._renderer.globalScale;

    const selectedHex = HexGrid.hex_round(HexGrid.pixel_to_hex(this._hexLayout, HexGrid.Point(mousePoint.x / scale, mousePoint.y / scale)));

    console.log(selectedHex);

    if (selectedHex.q < 0 || selectedHex.r < 0 || selectedHex.q >= worldData[0].length || selectedHex.r >= worldData.length) {
      console.log('invalid hex selected (not in world)');
      return;
    }

    const currentLevelHex = worldMapComp.getHexWithLevelEntityId(this._entityManager.currentLevelEntity.id); //this._getCurrentLevelHex();

    let selectedHexValid = (selectedHex.q === currentLevelHex.q && selectedHex.r === currentLevelHex.r && selectedHex.s === currentLevelHex.s);

    if (!selectedHexValid) {

      for (let i = 0; i < 6; ++i) {

        const hexNeighbor = HexGrid.hex_neighbor(currentLevelHex, i);

        if (hexNeighbor.q === selectedHex.q && hexNeighbor.r === selectedHex.r && hexNeighbor.s === selectedHex.s) {
          selectedHexValid = true;
          break;
        }

      }

    }

    console.log(JSON.stringify(selectedHex) + ' is ' + !!selectedHexValid);

    if (selectedHexValid) {
      worldMapPointerComp.pointedToHex = selectedHex;
    }

  }

  _isButtonClicked(buttonEnts, mousePoint) {
    return !!this._getClickedButton(buttonEnts, mousePoint);
  }

  _getClickedButton(buttonEnts, mousePoint) {

    for (const btnEnt of buttonEnts) {

      const btnComp = btnEnt.get('WorldMapButtonComponent');

      if (btnComp.sprite.containsPoint(mousePoint)) {
        return btnComp.text;
      }

    }
    
    return '';
    
  }

}