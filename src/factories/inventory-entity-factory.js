'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import InventoryBackgroundComponent from '../components/inventory-background-component';
import InventorySlotComponent from '../components/inventory-slot-component';
import BitmapTextComponent from '../components/bitmap-text-component';

export function buildInventoryGui(imageResources) {
  const dialogGuiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const frames = [new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(16, 0, 7, 7))];
  const invEnt = new Entity(Const.EntityId.InventoryGui)
    .add(
      new DialogHeaderComponent(
        ScreenUtils.buildHeading1Text('Inventory'),
        Const.HeaderTextStyle,
        1,
        frames,
        cornerDecoTexture
      )
    )
    .add(new InventoryBackgroundComponent())
    .add(new CurrentEntityReferenceComponent())
    .add(new BitmapTextComponent('', Const.InventoryBodyTextStyle, 1 / 3, 'hero_text'))
    .add(new BitmapTextComponent('', Const.InventoryBodyTextStyle, 1 / 3, 'item_text'))
    .add(new BitmapTextComponent('1', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_1'))
    .add(new BitmapTextComponent('2', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_2'))
    .add(new BitmapTextComponent('3', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_3'))
    .add(new BitmapTextComponent('4', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_4'))
    .add(new BitmapTextComponent('5', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_5'));

  for (const slotType of _.values(Const.InventorySlot)) {
    const slotLabel = StringUtils.formatIdString(slotType);

    switch (slotType) {
      case Const.InventorySlot.Backpack: {
        for (let i = 0; i < Const.BackpackSlotCount; ++i) {
          invEnt.add(new InventorySlotComponent(slotType, slotLabel, Const.InventoryBodyTextStyle, 1 / 3));
        }
        break;
      }
      case Const.InventorySlot.Hotbar: {
        for (let i = 0; i < Const.HotbarSlotCount; ++i) {
          invEnt.add(
            new InventorySlotComponent(slotType, i === 0 ? slotLabel : i + 1, Const.InventoryBodyTextStyle, 1 / 3)
          );
        }
        break;
      }
      default: {
        invEnt.add(new InventorySlotComponent(slotType, slotLabel, Const.InventoryBodyTextStyle, 1 / 3));
        break;
      }
    }
  }

  return invEnt;
}
