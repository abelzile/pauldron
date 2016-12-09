'use strict';
import * as Pixi from 'pixi.js';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import ArmorComponent from '../components/armor-component';
import Entity from '../entity';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import StatisticComponent from '../components/statistic-component';


function buildAnimatedSpriteComponents(baseTexture, armorData) {

  const mcs = [];

  if (!armorData.animations) { return mcs; }

  const animations = armorData.animations;

  for (let i = 0; i < animations.length; ++i) {

    const desc = animations[i];

    const frames = [];
    for (let j = 0; j < desc.frames.length; ++j) {
      frames[j] = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), desc.frames[j]));
    }

    const component = new AnimatedSpriteComponent(frames);
    component.animationSpeed = desc.animationSpeed;
    /*component.anchor.x = armorData.anchor.x;
    component.anchor.y = armorData.anchor.y;
    component.pivot.x = armorData.pivot.x;
    component.pivot.y = armorData.pivot.y;*/

    mcs[i] = component

  }

  return mcs;

}

function buildInventoryIconComponent(baseTexture, armorData) {

  if (!armorData.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), armorData.icon));

  return new InventoryIconComponent(iconTexture, ...armorData.slots);

}

function buildLevelIconComponent(baseTexture, armorData) {

  if (!armorData.icon) { return null; }

  const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), armorData.icon));

  return new LevelIconComponent(iconTexture);

}

function buildStatistics(armorData) {

  const statistics = armorData.statistics;
  const stats = [];

  for (let i = 0; i < statistics.length; ++i) {

    const stat = statistics[i];

    stats[i] = new StatisticComponent(stat.name, stat.maxValue);

  }

  return stats;

}

function buildArmorComponent(armorData) {
  return new ArmorComponent(armorData.armorTypeId, armorData.armorMaterialTypeId, ...armorData.slots);
}

export function buildHeroArmor(imageResources, armorData) {

  let baseTexture;
  if (armorData.baseTextureResourceId) {
    baseTexture = imageResources[armorData.baseTextureResourceId].texture;
  }

  const entity = new Entity()
    .setTags('armor')
    .add(buildArmorComponent(armorData))
    .addRange(buildStatistics(armorData));

  if (baseTexture) {

    const invIconComp = buildInventoryIconComponent(baseTexture, armorData);
    invIconComp && entity.add(invIconComp);

    const lvlIconComp = buildLevelIconComponent(baseTexture, armorData);
    lvlIconComp && entity.add(lvlIconComp);

    const anims = buildAnimatedSpriteComponents(baseTexture, armorData);
    if (anims.length > 0) {
      entity.addRange(anims)
    }

  }

  return entity;

}