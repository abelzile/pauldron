'use strict';
import DefeatTextComponent from '../components/defeat-text-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import MainMenuItemSpriteComponent from '../components/main-menu-item-sprite-component';
import Pixi from 'pixi.js';
import VictoryTextComponent from '../components/victory-text-component';


export function buildMainMenuEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;

  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));

  return new Entity()
    .add(new DialogHeaderComponent(undefined, undefined, undefined, null, cornerDecoTexture))
    .add(new MainMenuItemSpriteComponent('New Game', {
      font: '16px Silkscreen',
      tint: 0xffffff,
      align: 'center'
    }))
    .add(new MainMenuItemSpriteComponent('Continue', {
      font: '16px Silkscreen',
      tint: 0xffffff,
      align: 'center'
    }));
}

/*export function buildMainMenuNewGameMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('New Game', {
      font: '16px Silkscreen',
      tint: 0xffffff,
      align: 'center'
    }));

}

export function buildMainMenuContinueMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('Continue', {
      font: '16px Silkscreen',
        tint: 0xffffff,
        align: 'center'
    }));

}*/

export function buildVictorySplashEntity(resources) {

  return new Entity()
    .add(new VictoryTextComponent('Congratulations!\nClick to play again!',
                                  {
                                    font: '16px silkscreennormal',
                                    fill: '#ffffff',
                                    align: 'center'
                                  }));

}

export function buildDefeatSplashEntity(resources) {

  return new Entity()
    .add(new DefeatTextComponent('You have been defeated.\nClick to try again.',
                                 {
                                   font: '16px silkscreennormal',
                                   fill: '#ff0000',
                                   align: 'center'
                                 }));

}