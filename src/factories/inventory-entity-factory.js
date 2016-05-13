"use strict";
import * as Const from '../const';
import _ from 'lodash';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import InventoryBackgroundComponent from '../components/inventory-background-component';
import InventoryCurrentEntityReferenceComponent from '../components/inventory-current-entity-reference-component';
import InventoryHeroTextComponent from '../components/inventory-hero-text-component';
import InventoryItemTextComponent from '../components/inventory-item-text-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import Pixi from 'pixi.js';

function buildHeaderText(title) {

  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;

  const line1 = leftDeco + ' ' + title + ' ' + rightDeco;
  const line2 = Const.Char.BoxDrawingsLightHorizontal.repeat(20)
    + ' '
    + Const.Char.WhiteLeftPointingSmallTriangle
    + Const.Char.WhiteDiamondContainingBlackSmallDiamond
    + Const.Char.WhiteRightPointingSmallTriangle
    + ' '
    + Const.Char.BoxDrawingsLightHorizontal.repeat(20);

  return line1 + Const.Char.LF + line2;

}

export function buildInventoryEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;

  const frames = [
    new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(17, 0, 5, 5))
  ];

  const invEnt = new Entity()
    .add(new DialogHeaderComponent(buildHeaderText('Inventory'), Const.HeaderTextStyle, 1, frames))
    .add(new InventoryBackgroundComponent())
    .add(new InventoryCurrentEntityReferenceComponent())
    .add(new InventoryHeroTextComponent('', Const.InventoryBodyTextStyle, 1 / 3))
    .add(new InventoryItemTextComponent('', Const.InventoryBodyTextStyle, 1 / 3))
    ;

  for (const slotType of _.values(Const.InventorySlot)) {

    switch (slotType) {

      case Const.InventorySlot.Backpack:
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, '', _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        }
        break;

      case Const.InventorySlot.Hotbar:
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, i === 0 ? slotType : i + 1, _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        }
        break;

      default:
        invEnt.add(new InventorySlotComponent(slotType, '', _.clone(Const.InventoryBodyTextStyle), 1 / 3));
        break;

    }

  }

  return invEnt;

}