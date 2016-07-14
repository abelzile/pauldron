'use strict';
import DefeatTextComponent from '../components/defeat-text-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import MainMenuItemSpriteComponent from '../components/main-menu-item-sprite-component';
import Pixi from 'pixi.js';
import VictoryTextComponent from '../components/victory-text-component';
import * as ScreenUtils from '../utils/screen-utils';
import * as Const from '../const';
import CharacterCreationComponent from '../components/character-creation-component';
import MovieClipComponent from '../components/movie-clip-component';
import TextButtonComponent from '../components/text-button-component';
import SpriteComponent from '../components/sprite-component';


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

export function buildCharacterCreationGuiEntity(imageResources) {

  const dialogGuiTexture = imageResources['dialog_gui'].texture;
  const baseHeroTexture = imageResources['hero'].texture;

  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));

  const guiEntity = new Entity()
    .add(new CharacterCreationComponent())
    .add(new DialogHeaderComponent(ScreenUtils.buildDialogHeaderText('Create Your Character'), Const.HeaderTextStyle, 1, null, cornerDecoTexture))
    .add(new SpriteComponent(new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(41, 0, 9, 9)), 'random_hero'))
    .add(new TextButtonComponent('Start', Const.WorldMapButtonTextStyle, 1, 'start'))
    ;

  for (let i = 0; i < 5; ++i) {

    const hero1Frames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(i * 16, 0, 16, 16))
    ];

    guiEntity.add(new MovieClipComponent(hero1Frames, 'hero_body_' + i));

  }

  guiEntity
    .add(new TextButtonComponent('<', Const.WorldMapButtonTextStyle, 1, 'prev_body'))
    .add(new TextButtonComponent('>', Const.WorldMapButtonTextStyle, 1, 'next_body'));

  for (let i = 0; i < 9; ++i) {

    const hairFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(i * 16, 80, 16, 16))
    ];

    guiEntity.add(new MovieClipComponent(hairFrames, 'hero_hair_' + i));

  }

  guiEntity
    .add(new TextButtonComponent('<', Const.WorldMapButtonTextStyle, 1, 'prev_hair'))
    .add(new TextButtonComponent('>', Const.WorldMapButtonTextStyle, 1, 'next_hair'));

  return guiEntity;

}