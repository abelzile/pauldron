'use strict';
import DefeatTextComponent from '../components/defeat-text-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import MainMenuItemSpriteComponent from '../components/main-menu-item-sprite-component';
import * as Pixi from 'pixi.js';
import VictoryTextComponent from '../components/victory-text-component';
import * as ScreenUtils from '../utils/screen-utils';
import * as Const from '../const';
import CharacterCreationComponent from '../components/character-creation-component';
import MovieClipComponent from '../components/movie-clip-component';
import TextButtonComponent from '../components/text-button-component';
import SpriteComponent from '../components/sprite-component';
import ListItemComponent from '../components/list-item-component';
import EntityReferenceComponent from '../components/entity-reference-component';
import GraphicsComponent from '../components/graphics-component';
import BitmapTextComponent from '../components/bitmap-text-component';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';
import SpriteButtonComponent from '../components/sprite-button-component';


export function buildMainMenuEntity(imageResources) {

  const dialogGuiTexture = imageResources['gui'].texture;

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

export function buildCharacterCreationGui(imageResources, characterClassListCtrl, characterClasses) {

  const hairCount = 10;
  const bodyCount = 7;

  const dialogGuiTexture = imageResources['gui'].texture;
  const baseHeroTexture = imageResources['hero'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  const underline = Const.Char.BoxDrawingsLightHorizontal.repeat(12) +
    Const.Char.WhiteLeftPointingSmallTriangle +
    Const.Char.WhiteDiamondContainingBlackSmallDiamond +
    Const.Char.WhiteRightPointingSmallTriangle +
    Const.Char.BoxDrawingsLightHorizontal.repeat(12);

  const gui = new Entity(Const.EntityId.CharacterCreationGui)
    .add(new DialogHeaderComponent(ScreenUtils.buildHeading1Text('Create Your Character'), Const.HeaderTextStyle, 1, null, cornerDecoTexture))
    .add(new BitmapTextComponent('Select Appearance\n' + underline, Const.WorldMapButtonTextStyle, 1, 'select_appearance'))
    .add(new BitmapTextComponent('Select Class\n' + underline, Const.WorldMapButtonTextStyle, 1, 'select_class'))
    .add(new SpriteButtonComponent('randomize_hero', buttonCornerDecoTexture, new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(41, 0, 9, 9))))
    .add(new TextButtonComponent('next', buttonCornerDecoTexture, 'Next >', Const.WorldMapButtonTextStyle, 1))
    .add(new EntityReferenceComponent('character_class_list_control', characterClassListCtrl.id))
    ;

  for (let i = 0; i < bodyCount; ++i) {

    const x = i * 16;

    const standingFrame = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 0, 16, 16)),
    ];

    const walkingFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 16, 16, 16)),
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 32, 16, 16)),
    ];

    const faceNeutralFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 64, 16, 16)),
    ];

    const faceAttackFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 80, 16, 16)),
    ];

    const faceKnockbackFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 96, 16, 16)),
    ];

    const standing = new MovieClipComponent(standingFrame, 'body_standing_' + i);
    standing.animationSpeed = 0.15;

    const walking = new MovieClipComponent(walkingFrames, 'body_walking_' + i);
    walking.animationSpeed = 0.15;

    const faceNeutral = new MovieClipComponent(faceNeutralFrames, 'face_neutral_' + i);
    faceNeutral.animationSpeed = 0.15;

    const faceAttack = new MovieClipComponent(faceAttackFrames, 'face_attack_' + i);
    faceAttack.animationSpeed = 0.15;

    const faceKnockback = new MovieClipComponent(faceKnockbackFrames, 'face_knockback_' + i);
    faceKnockback.animationSpeed = 0.15;

    gui.add(standing)
       .add(walking)
       .add(faceNeutral)
       .add(faceAttack)
       .add(faceKnockback)
       ;

  }

  gui
    .add(new TextButtonComponent('prev_body', buttonCornerDecoTexture, '<', Const.WorldMapButtonTextStyle, 1))
    .add(new TextButtonComponent('next_body', buttonCornerDecoTexture, '>', Const.WorldMapButtonTextStyle, 1));

  for (let i = 0; i < hairCount; ++i) {

    const hairFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(i * 16, 48, 16, 16))
    ];

    gui.add(new MovieClipComponent(hairFrames, 'hair_' + i));

  }

  gui
    .add(new TextButtonComponent('prev_hair', buttonCornerDecoTexture, '<', Const.WorldMapButtonTextStyle, 1))
    .add(new TextButtonComponent('next_hair', buttonCornerDecoTexture, '>', Const.WorldMapButtonTextStyle, 1));

  characterClassListCtrl.add(new GraphicsComponent('selected_item_bg'));
  for (const cc of characterClasses) {

    const characterClassComponent = cc.get('CharacterClassComponent');
    characterClassListCtrl.add(new ListItemComponent(characterClassComponent.typeId,
                                                     characterClassComponent.name,
                                                     Const.WorldMapButtonTextStyle,
                                                     1));

  }

  return gui;

}

export function buildAbilitiesGui(imageResources) {

  const dialogGuiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const memorizedCursorTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(84, 0, 20, 20));
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  const gui = new Entity(Const.EntityId.AbilitiesGui)
    .add(new BitmapTextComponent('.', Const.WorldMapButtonTextStyle, 1, 'skill_points'))
    .add(new BitmapTextComponent(ScreenUtils.buildHeading2Text('Attributes', 12), Const.WorldMapButtonTextStyle, 1, 'attributes'))
    .add(new BitmapTextComponent(ScreenUtils.buildHeading2Text('Skills', 40), Const.WorldMapButtonTextStyle, 1, 'skills'))
    .add(new CurrentEntityReferenceComponent())
    .add(new DialogHeaderComponent(ScreenUtils.buildHeading1Text('Abilities'), Const.HeaderTextStyle, 1, null, cornerDecoTexture))
    .add(new GraphicsComponent('borders'))
    .add(new SpriteComponent(memorizedCursorTexture, 'memorized_cursor'))
    .add(new TextButtonComponent('close_btn', buttonCornerDecoTexture, 'Close', Const.WorldMapButtonTextStyle, 1))
    ;

  const addBtnTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(77, 0, 7, 7));

  for (let i = 0; i < 99; ++i) {
    gui.add(new SpriteComponent(addBtnTexture, 'add_btn_' + i));
  }

  return gui;

}

export function buildListControl(...items) {

  const listCtrl = new Entity();

  for (const item of items) {

    const valTextPair = item.split(';');

    listCtrl.add(new ListItemComponent(valTextPair[0], valTextPair[1], Const.WorldMapButtonTextStyle));

  }

  return listCtrl;

}