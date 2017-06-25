'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import TextComponent from '../components/text-component';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import InventorySlotComponent from '../components/inventory-slot-component';

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
    .add(new CurrentEntityReferenceComponent())
    .add(new TextComponent('', Const.InventoryBodyTextStyle, 1 / 3, 'hero_text'))
    .add(new TextComponent('', Const.InventoryBodyTextStyle, 1 / 3, 'item_text'))
    .add(new TextComponent('1', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_1'))
    .add(new TextComponent('2', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_2'))
    .add(new TextComponent('3', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_3'))
    .add(new TextComponent('4', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_4'))
    .add(new TextComponent('5', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_5'));

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
