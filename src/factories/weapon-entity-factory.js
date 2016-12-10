'use strict';
import * as _ from 'lodash';
import * as Pixi from 'pixi.js';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import AnimatedSpriteSettingsComponent from '../components/animated-sprite-settings-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import MeleeWeaponComponent from '../components/melee-weapon-component';
import RangedAttackComponent from '../components/ranged-attack-component';
import RangedWeaponComponent from '../components/ranged-weapon-component';
import StatisticComponent from '../components/statistic-component';


function buildAnimatedSpriteComponents(baseTexture, values) {

  const mcs = [];

  if (!values.animations) { return mcs; }

  const animations = values.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const component = new AnimatedSpriteComponent(frames);
    component.animationSpeed = desc.animationSpeed;
    component.anchor.x = values.anchor.x;
    component.anchor.y = values.anchor.y;
    component.pivot.x = values.pivot.x;
    component.pivot.y = values.pivot.y;

    mcs[i] = component

  }

  return mcs;

}

function buildAnimatedSpriteSettingsComponents(values) {

  const mcSettings = [];

  if (!values.settings) { return mcSettings; }

  const settings = values.settings;

  for (let i = 0; i < settings.length; ++i) {

    const setting = settings[i];
    const mcSetting = new AnimatedSpriteSettingsComponent(setting.id);

    if (setting.positionOffset) {
      mcSetting.positionOffset.x = setting.positionOffset.x;
      mcSetting.positionOffset.y = setting.positionOffset.y;
    }

    if (setting.rotation) {
      mcSetting.rotation = setting.rotation;
    }

    //TODO: other settings that could be in AnimatedSpriteSettingsComponent

    mcSettings[i] = mcSetting;

  }

  return mcSettings;

}

function buildInventoryIconComponent(baseTexture, values) {

  if (!values.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), values.icon));

  return new InventoryIconComponent(iconTexture, ...values.slots);

}

function buildLevelIconComponent(baseTexture, values) {

  if (!values.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), values.icon));

  return new LevelIconComponent(iconTexture);

}

function buildWeaponComponent(values) {

  const weaponStyleId = values.weaponStyleId;

  switch (weaponStyleId) {

    case 'melee':
      return new MeleeWeaponComponent(values.weaponTypeId,
                                      values.weaponMaterialTypeId,
                                      values.handednessId,
                                      values.attackShapeId,
                                      parseInt(values.gradientColor1, 16),
                                      parseInt(values.gradientColor2, 16));
    case 'ranged':
      return new RangedWeaponComponent(values.weaponTypeId, values.weaponMaterialTypeId, values.handednessId, values.projectileTypeId);
    default:
      throw new Error('Weapon resource file must define a weaponStyleId of "melee" or "ranged". Current value is ' + weaponStyleId);

  }


}

function buildAttackComponent(values) {

  const weaponStyleId = values.weaponStyleId;

  switch (weaponStyleId) {

    case 'melee':
      return new MeleeAttackComponent();
    case 'ranged':
      return new RangedAttackComponent();
    default:
      throw new Error('Weapon resource file must define a weaponStyleId of "melee" or "ranged". Current value is ' + weaponStyleId);

  }

}

function buildStatisticComponents(values) {

  const statistics = values.statistics;
  const stats = [];

  for (let i = 0; i < statistics.length; ++i) {

    const stat = statistics[i];

    stats[i] = new StatisticComponent(stat.name, stat.maxValue);

  }

  return stats;

}

export function buildWeapon(imageResources, weaponData) {

  let baseTexture;
  if (weaponData.baseTextureResourceId) {
    baseTexture = imageResources[weaponData.baseTextureResourceId].texture;
  }

  const entity = new Entity()
    .setTags('weapon')
    .add(buildAttackComponent(weaponData))
    .add(buildWeaponComponent(weaponData))
    .addRange(buildStatisticComponents(weaponData));

  if (baseTexture) {

    const invIconComp = buildInventoryIconComponent(baseTexture, weaponData);
    invIconComp && entity.add(invIconComp);

    const lvlIconComp = buildLevelIconComponent(baseTexture, weaponData);
    lvlIconComp && entity.add(lvlIconComp);

    const anims = buildAnimatedSpriteComponents(baseTexture, weaponData);
    if (anims.length > 0) {
      entity.addRange(anims)
    }

    const animSettings = buildAnimatedSpriteSettingsComponents(weaponData);
    if (animSettings.length > 0) {
      entity.addRange(animSettings);
    }

  }

  return entity;

}