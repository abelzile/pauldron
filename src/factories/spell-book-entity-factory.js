"use strict";
import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import _ from 'lodash';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import Pixi from 'pixi.js';
import SpellBookBackgroundComponent from '../components/spell-book-background-component';
import SpellBookSlotComponent from '../components/spell-book-slot-component';
import * as StringUtils from "../utils/string-utils";


export function buildSpellBookEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;

  const frames = [
    new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(17, 0, 5, 5))
  ];

  const sbEnt = new Entity()
          .add(new DialogHeaderComponent(ScreenUtils.buildDialogHeaderText('Spell Book'), Const.HeaderTextStyle, 1, frames))
          .add(new SpellBookBackgroundComponent())
    ;

  for (const slotType of _.values(Const.MagicSpellSlot)) {

    const slotLabel = StringUtils.formatIdString(slotType);

    switch (slotType) {

      case Const.MagicSpellSlot.SpellBook:
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          sbEnt.add(new SpellBookSlotComponent(slotType, slotLabel, Const.SpellBookTextStyle, 1 / 3));
        }
        break;

      /*case  Const.MagicSpellSlot.Hotbar:
        for (let i = 0; i < Const.MagicSpellHotbarSlotCount; ++i) {
          sbEnt.add(new SpellBookSlotComponent(slotType, slotLabel, Const.SpellBookTextStyle, 1 / 3));
        }
        break;*/

      default:
        sbEnt.add(new SpellBookSlotComponent(slotType, slotLabel, Const.SpellBookTextStyle, 1 / 3));
        break;

    }

  }

  return sbEnt;

}