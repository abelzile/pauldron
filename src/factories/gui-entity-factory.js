'use strict';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import TextComponent from '../components/text-component';
import CurrentEntityReferenceComponent from '../components/current-entity-reference-component';
import DialogHeaderComponent from '../components/dialog-header-component';
import Entity from '../entity';
import EntityReferenceComponent from '../components/entity-reference-component';
import GraphicsComponent from '../components/graphics-component';
import LevelStatisticBarComponent from '../components/level-statistic-bar-component';
import LevelTextDisplayComponent from '../components/level-text-display-component';
import ListItemComponent from '../components/list-item-component';
import SpriteButtonComponent from '../components/sprite-button-component';
import SpriteComponent from '../components/sprite-component';
import TextButtonComponent from '../components/text-button-component';

export function buildMainMenuGui(imageResources) {
  const guiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const buttonCornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  return new Entity(Const.EntityId.MainMenuGui)
    .add(new DialogHeaderComponent(undefined, undefined, undefined, null, cornerDecoTexture))
    .add(
      new TextButtonComponent('new_game', buttonCornerDecoTexture, 'New Game', {
        font: '16px Silkscreen',
        tint: 0xffffff,
        align: 'center'
      })
    );
}

export function buildLevelGui(imageResources) {
  const guiTexture = imageResources['gui'].texture;
  const hpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 20, 10, 9));
  const mpIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(10, 20, 10, 9));
  const moneyIconTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(20, 20, 10, 9));
  const levelUpStyle = { font: '16px Silkscreen', tint: Const.Color.GoodAlertYellow };
  const levelNameStyle = { font: '16px Silkscreen', tint: Const.Color.White };
  const leftDeco = Const.Char.WhiteLeftPointingSmallTriangle + Const.Char.WhiteDiamondContainingBlackSmallDiamond;
  const rightDeco = Const.Char.WhiteDiamondContainingBlackSmallDiamond + Const.Char.WhiteRightPointingSmallTriangle;
  const levelUpText = leftDeco + ' Level Up! ' + rightDeco;

  return new Entity(Const.EntityId.LevelGui)
    .add(new TextComponent(levelUpText, levelUpStyle, 1, 'level_up'))
    .add(new TextComponent('1', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_label_0'))
    .add(new TextComponent('2', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_label_1'))
    .add(new TextComponent('3', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_label_2'))
    .add(new TextComponent('4', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_label_3'))
    .add(new TextComponent('5', Const.InventoryBodyTextStyle, 1 / 3, 'hotbar_label_4'))
    .add(new TextComponent('', levelNameStyle, 1, 'level_name'))
    .add(new GraphicsComponent('hotbar_border_0'))
    .add(new GraphicsComponent('hotbar_border_1'))
    .add(new GraphicsComponent('hotbar_border_2'))
    .add(new GraphicsComponent('hotbar_border_3'))
    .add(new GraphicsComponent('hotbar_border_4'))
    .add(new LevelStatisticBarComponent(Const.Statistic.HitPoints, hpIconTexture))
    .add(new LevelStatisticBarComponent(Const.Statistic.MagicPoints, mpIconTexture))
    .add(new LevelTextDisplayComponent(moneyIconTexture, '', Const.HeaderTextStyle, 'money'));
}

export function buildVictorySplashGui(imageResources) {
  const guiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const buttonCornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  return new Entity(Const.EntityId.VictoryGui)
    .add(new DialogHeaderComponent(undefined, undefined, undefined, null, cornerDecoTexture))
    .add(
      new TextButtonComponent('victory', buttonCornerDecoTexture, 'Congratulations!', {
        font: '16px Silkscreen',
        tint: 0xffffff,
        align: 'center'
      })
    );
}

export function buildDefeatSplashGui(imageResources) {
  const guiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const buttonCornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  return new Entity(Const.EntityId.DefeatGui)
    .add(new DialogHeaderComponent(undefined, undefined, undefined, null, cornerDecoTexture))
    .add(
      new TextButtonComponent('defeat', buttonCornerDecoTexture, 'Defeat!\nClick to try again.', {
        font: '16px Silkscreen',
        tint: 0xff0000,
        align: 'center'
      })
    );
}

export function buildCharacterCreationGui(imageResources, characterClassListCtrl, characterClasses) {
  const hairCount = 10;
  const bodyCount = 7;

  const guiTexture = imageResources['gui'].texture;
  const baseHeroTexture = imageResources['hero'].texture;
  const cornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const buttonCornerDecoTexture = new Pixi.Texture(guiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  const underline =
    Const.Char.BoxDrawingsLightHorizontal.repeat(12) +
    Const.Char.WhiteLeftPointingSmallTriangle +
    Const.Char.WhiteDiamondContainingBlackSmallDiamond +
    Const.Char.WhiteRightPointingSmallTriangle +
    Const.Char.BoxDrawingsLightHorizontal.repeat(12);

  const gui = new Entity(Const.EntityId.CharacterCreationGui)
    .add(
      new DialogHeaderComponent(
        ScreenUtils.buildHeading1Text('Create Your Character'),
        Const.HeaderTextStyle,
        1,
        null,
        cornerDecoTexture
      )
    )
    .add(new TextComponent('Select Appearance\n' + underline, Const.BasicTextStyle, 1, 'select_appearance'))
    .add(new TextComponent('Select Class\n' + underline, Const.BasicTextStyle, 1, 'select_class'))
    .add(
      new SpriteButtonComponent(
        'randomize_hero',
        buttonCornerDecoTexture,
        new Pixi.Texture(guiTexture, new Pixi.Rectangle(41, 0, 9, 9))
      )
    )
    .add(new TextButtonComponent('next', buttonCornerDecoTexture, 'Next >', Const.BasicTextStyle, 1))
    .add(new EntityReferenceComponent('character_class_list_control', characterClassListCtrl.id));

  for (let i = 0; i < bodyCount; ++i) {
    const x = i * 16;

    const standingFrame = [new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 0, 16, 16))];

    const walkingFrames = [
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 16, 16, 16)),
      new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 32, 16, 16))
    ];

    const faceNeutralFrames = [new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 64, 16, 16))];

    const faceAttackFrames = [new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 80, 16, 16))];

    const faceKnockbackFrames = [new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(x, 96, 16, 16))];

    const standing = new AnimatedSpriteComponent(standingFrame, 'body_standing_' + i);
    standing.animationSpeed = 0.15;

    const walking = new AnimatedSpriteComponent(walkingFrames, 'body_walking_' + i);
    walking.animationSpeed = 0.15;

    const faceNeutral = new AnimatedSpriteComponent(faceNeutralFrames, 'face_neutral_' + i);
    faceNeutral.animationSpeed = 0.15;

    const faceAttack = new AnimatedSpriteComponent(faceAttackFrames, 'face_attack_' + i);
    faceAttack.animationSpeed = 0.15;

    const faceKnockback = new AnimatedSpriteComponent(faceKnockbackFrames, 'face_knockback_' + i);
    faceKnockback.animationSpeed = 0.15;

    gui.add(standing).add(walking).add(faceNeutral).add(faceAttack).add(faceKnockback);
  }

  gui
    .add(new TextButtonComponent('prev_body', buttonCornerDecoTexture, '<', Const.BasicTextStyle, 1))
    .add(new TextButtonComponent('next_body', buttonCornerDecoTexture, '>', Const.BasicTextStyle, 1));

  for (let i = 0; i < hairCount; ++i) {
    const hairFrames = [new Pixi.Texture(baseHeroTexture, new Pixi.Rectangle(i * 16, 48, 16, 16))];

    gui.add(new AnimatedSpriteComponent(hairFrames, 'hair_' + i));
  }

  gui
    .add(new TextButtonComponent('prev_hair', buttonCornerDecoTexture, '<', Const.BasicTextStyle, 1))
    .add(new TextButtonComponent('next_hair', buttonCornerDecoTexture, '>', Const.BasicTextStyle, 1));

  characterClassListCtrl.add(new GraphicsComponent('selected_item_bg'));
  for (const cc of characterClasses) {
    const characterClassComponent = cc.get('CharacterClassComponent');
    characterClassListCtrl.add(
      new ListItemComponent(characterClassComponent.typeId, characterClassComponent.name, Const.BasicTextStyle, 1)
    );
  }

  return gui;
}

export function buildAbilitiesGui(imageResources) {
  const dialogGuiTexture = imageResources['gui'].texture;
  const cornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(0, 0, 16, 16));
  const memorizedCursorTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(84, 0, 20, 20));
  const buttonCornerDecoTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(104, 0, 4, 4));

  const gui = new Entity(Const.EntityId.AbilitiesGui)
    .add(new TextComponent('', Const.BasicTextStyle, 1, 'skill_points'))
    .add(new TextComponent('', Const.BasicTextStyle, 1, 'attribute_points'))
    .add(
      new TextComponent(ScreenUtils.buildHeading2Text('Attributes\n', 12), Const.BasicTextStyle, 1, 'attributes')
    )
    .add(new TextComponent(ScreenUtils.buildHeading2Text('Skills\n', 40), Const.BasicTextStyle, 1, 'skills'))
    .add(new CurrentEntityReferenceComponent())
    .add(
      new DialogHeaderComponent(
        ScreenUtils.buildHeading1Text('Abilities'),
        Const.HeaderTextStyle,
        1,
        null,
        cornerDecoTexture
      )
    )
    .add(new GraphicsComponent('borders'))
    .add(new SpriteComponent(memorizedCursorTexture, 'memorized_cursor'))
    .add(new TextButtonComponent('close_btn', buttonCornerDecoTexture, 'Close', Const.BasicTextStyle, 1));

  const addBtnTexture = new Pixi.Texture(dialogGuiTexture, new Pixi.Rectangle(77, 0, 7, 7));

  for (let i = 0; i < 99; ++i) {
    gui.add(new SpriteComponent(addBtnTexture, 'add_btn_' + i));
  }

  for (const key of Object.keys(Const.Attribute)) {
    const keyStr = Const.Attribute[key];
    gui
      .add(new TextComponent(keyStr, Const.BasicTextStyle, undefined, 'label_' + keyStr))
      .add(new TextComponent('', Const.BasicTextStyle, 2, 'value_' + keyStr))
      .add(new SpriteButtonComponent('add_attribute_btn_' + keyStr, null, addBtnTexture, 0, 0));
  }

  return gui;
}

export function buildListControl(...items) {
  const listCtrl = new Entity();

  for (let i = 0; i < items.length; ++i) {
    const valTextPair = items[i].split(';');
    listCtrl.add(new ListItemComponent(valTextPair[0], valTextPair[1], Const.BasicTextStyle));
  }

  return listCtrl;
}
