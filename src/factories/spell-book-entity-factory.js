'use strict';
import * as Const from '../const';
import * as ScreenUtils from '../utils/screen-utils';
import * as StringUtils from '../utils/string-utils';
import _ from 'lodash';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import Pixi from 'pixi.js';
import SpellBookBackgroundComponent from '../components/spell-book-background-component';
import SpellBookSlotComponent from '../components/spell-book-slot-component';
import SpellBookMemorizedTextComponent from '../components/spell-book-memorized-text-component';
import SpellBookHoverTextComponent from '../components/spell-book-hover-text-component';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';


export function buildSpellBookEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const frames = [
    new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(16, 0, 7, 7))
  ];

  const sbEnt = new Entity()
          .add(new DialogHeaderComponent(ScreenUtils.buildDialogHeaderText('Spell Book'), Const.HeaderTextStyle, 1, frames, cornerDecoTexture))
          .add(new SpellBookBackgroundComponent())
          .add(new SpellBookHoverTextComponent('', Const.InventoryBodyTextStyle, 1 / 3))
          .add(new SpellBookMemorizedTextComponent('', Const.InventoryBodyTextStyle, 1 / 3))
          .add(new CurrentEntityReferenceComponent())
          ;

  for (const slotType of _.values(Const.MagicSpellSlot)) {

    const slotLabel = StringUtils.formatIdString(slotType);

    switch (slotType) {

      case Const.MagicSpellSlot.SpellBook:
        for (let i = 0; i < Const.MagicSpellBookSlotCount; ++i) {
          sbEnt.add(new SpellBookSlotComponent(slotType, slotLabel, Const.SpellBookTextStyle, 1 / 3));
        }
        break;

      default:
        sbEnt.add(new SpellBookSlotComponent(slotType, slotLabel, Const.SpellBookTextStyle, 1 / 3));
        break;

    }

  }

  return sbEnt;

}