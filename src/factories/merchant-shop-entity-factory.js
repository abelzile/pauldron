'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import * as StringUtils from '../utils/string-utils';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import GraphicsComponent from '../components/graphics-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';

export function buildMerchantShopGui(imageResources) {
  const dialogGuiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const frames = [new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(16, 0, 7, 7))];
  const gui = new Entity(Const.EntityId.MerchantShopGui)
    .add(
      new DialogHeaderComponent(
        ScreenUtils.buildHeading1Text('Wandering Merchant'),
        Const.HeaderTextStyle,
        1,
        frames,
        cornerDecoTexture
      )
    )
    .add(new GraphicsComponent('background'))
    .add(new CurrentEntityReferenceComponent())
    ;

  const slotTypes = [Const.InventorySlot.Backpack, Const.MerchantSlot.Stock];
  const slotCounts = [Const.BackpackSlotCount, Const.MerchantStockSlotCount];

  for (let i = 0; i < slotTypes.length; ++i) {
    const slotType = slotTypes[i];
    const slotCount = slotCounts[i];

    for (let j = 0; j < slotCount; ++j) {
      gui.add(
        new InventorySlotComponent(slotType, StringUtils.formatIdString(slotType), Const.InventoryBodyTextStyle, 1 / 3)
      );
    }
  }

  gui.add(
    new InventorySlotComponent(
      Const.MerchantSlot.Buy,
      StringUtils.formatIdString(Const.MerchantSlot.Buy),
      Const.InventoryBodyTextStyle,
      1 / 3
    )
  );
  gui.add(
    new InventorySlotComponent(
      Const.MerchantSlot.Sell,
      StringUtils.formatIdString(Const.MerchantSlot.Sell),
      Const.InventoryBodyTextStyle,
      1 / 3
    )
  );

  //perhaps in the future...
  /*const equipSlots = _.values(Const.EquipableInventorySlot);
  for (let i = 0; i < equipSlots.length; ++i) {
    const slotType = equipSlots[i];
    const slotLabel = StringUtils.formatIdString(slotType);
    gui.add(new InventorySlotComponent(slotType, slotLabel, Const.InventoryBodyTextStyle, 1 / 3));
  }*/

  return gui;
}
