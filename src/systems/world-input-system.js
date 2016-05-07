import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EnumUtils from "../utils/enum-utils";
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import System from '../system';
import Rectangle from '../rectangle';


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

    const gui = EntityFinders.findWorldMapGui(entities);

    const btnComps = gui.getAll('TextButtonComponent');

    const mousePoint = input.getMousePosition();

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    const worldData = worldMapComp.worldData;

    const worldMapPointerComp = gui.get('WorldMapPointerComponent');

    if (this._isButtonClicked(btnComps, mousePoint)) {

      const btnComp = this._getClickedButton(btnComps, mousePoint);

      switch (btnComp.bitmapTextComponent.sprite.text) {

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

    //console.log(selectedHex);

    if (selectedHex.q < 0 || selectedHex.r < 0 || selectedHex.q >= worldData[0].length || selectedHex.r >= worldData.length) {
      //console.log('invalid hex selected (not in world)');
      return;
    }

    const currentLevelHex = worldMapComp.getHexWithLevelEntityId(this._entityManager.currentLevelEntity.id);

    let selectedHexValid = HexGrid.hex_equals(selectedHex, currentLevelHex);

    if (!selectedHexValid) {

      for (let i = 0; i < 6; ++i) {

        const hexNeighbor = HexGrid.hex_neighbor(currentLevelHex, i);

        if (HexGrid.hex_equals(hexNeighbor, selectedHex)) {
          selectedHexValid = true;
          break;
        }

      }

    }

    //console.log(JSON.stringify(selectedHex) + ' is ' + !!selectedHexValid);

    if (selectedHexValid) {
      worldMapPointerComp.pointedToHex = selectedHex;
    }

  }

  _isButtonClicked(btnComps, mousePoint) {
    return !!this._getClickedButton(btnComps, mousePoint);
  }

  _getClickedButton(btnComps, mousePoint) {

    const scale = this._renderer.globalScale;

    return _.find(btnComps, c => {

      const sprite = c.bitmapTextComponent.sprite;
      const rect = new Rectangle(sprite.position.x * scale, sprite.position.y * scale, sprite.textWidth * scale, sprite.textHeight * scale);

      return (rect.intersectsWith(mousePoint));

    });

  }

}