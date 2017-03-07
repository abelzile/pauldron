import * as _ from 'lodash';
import * as FunctionUtils from '../utils/function-utils';
import * as Pixi from 'pixi.js';
import AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import AiSeekerComponent from '../components/ai-seeker-component';
import AnimatedSpriteComponent from '../components/animated-sprite-component';
import AnimatedSpriteSettingsComponent from '../components/animated-sprite-settings-component';
import ArmorComponent from '../components/armor-component';
import BoundingRectangleComponent from '../components/bounding-rectangle-component';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceValueComponent from '../components/experience-value-component';
import InventoryIconComponent from '../components/inventory-icon-component';
import LevelIconComponent from '../components/level-icon-component';
import MeleeAttackComponent from '../components/melee-attack-component';
import MeleeWeaponComponent from '../components/melee-weapon-component';
import RangedAttackComponent from '../components/ranged-attack-component';
import RangedWeaponComponent from '../components/ranged-weapon-component';
import Rectangle from '../rectangle';
import SpriteComponent from '../components/sprite-component';
import StatisticComponent from '../components/statistic-component';
import StatisticEffectComponent from '../components/statistic-effect-component';
import * as ArrayUtils from '../utils/array-utils';
import ProjectileAttackComponent from '../components/projectile-attack-component';

export default class Factory {
  constructor(entityDict, textureDict) {
    if (!entityDict) {
      throw new Error('entityDict argument required.');
    }

    if (!textureDict) {
      throw new Error('textureDict argument required.');
    }

    this.entityDict = entityDict;
    this.textureDict = textureDict;
  }

  buildBoundingRectComponent(id) {
    const entityData = this.entityDict[id];

    return new BoundingRectangleComponent(_.assign(new Rectangle(), entityData.boundingRect));
  }

  buildAnimatedSpriteComponents(id) {
    const entityData = this.entityDict[id];
    const textureData = this.textureDict[entityData.baseTextureResourceId];
    const baseTexture = textureData ? textureData.texture : Pixi.Texture.EMPTY;

    const comps = _.map(entityData.animations, animationData => {
      const component = new AnimatedSpriteComponent(
        _.map(animationData.frames, frame => new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), frame))),
        animationData.name
      );

      component.animationSpeed = animationData.animationSpeed;

      return component;
    });

    if (comps.length === 0) {
      //comps.push(new AnimatedSpriteComponent(Const.EmptyTextureArray));
      return null;
    }

    return comps;
  }

  buildStatisticComponents(id) {
    const entityData = this.entityDict[id];

    return _.map(entityData.statistics, statData => new StatisticComponent(statData.name, statData.maxValue));
  }

  buildAiComponent(id) {
    const entityData = this.entityDict[id];

    const aiId = entityData.aiId;

    switch (aiId) {
      case 'ai-random-wanderer':
        return new AiRandomWandererComponent();
      case 'ai-seeker':
        return new AiSeekerComponent();
      default:
        throw new Error(
          `Resource file must define an aiId of "ai-random-wanderer" or "ai-seeker". Current value is "${aiId}".`
        );
    }
  }

  buildExperienceValueComponent(id) {
    const entityData = this.entityDict[id];

    return new ExperienceValueComponent(entityData.expValue);
  }

  buildShadowSpriteComponent(id) {
    const entityData = this.entityDict[id];
    const textureData = this.textureDict[entityData.baseTextureResourceId];
    const baseTexture = textureData ? textureData.texture : Pixi.Texture.EMPTY;

    return new SpriteComponent(
      new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), entityData.shadowFrame)),
      'shadow'
    );
  }

  buildEntityReferenceComponents(id) {
    const entityData = this.entityDict[id];

    return _.map(entityData.slots, slotId => new EntityReferenceComponent(slotId));
  }

  buildAttackComponent(id) {
    const entityData = this.entityDict[id];
    const weaponStyleId = entityData.weaponStyleId;

    switch (weaponStyleId) {
      case 'melee':
        return new MeleeAttackComponent(this._mapHexToIntColors(entityData.attackHitColors));
      case 'ranged':
        return new RangedAttackComponent();
      default:
        throw new Error(
          `Weapon resource file must define a weaponStyleId of "melee" or "ranged". Current value is ${weaponStyleId}`
        );
    }
  }

  buildProjectileAttackComponent(id) {
    const entityData = this.entityDict[id];
    return new ProjectileAttackComponent(this._mapHexToIntColors(entityData.attackHitColors));
  }

  buildWeaponComponent(id) {
    const entityData = this.entityDict[id];

    switch (entityData.weaponStyleId) {
      case 'melee':
        return new MeleeWeaponComponent(
          entityData.weaponTypeId,
          entityData.weaponMaterialTypeId,
          entityData.handednessId,
          entityData.attackShapeId,
          parseInt(entityData.attackGradientColor1, 16),
          parseInt(entityData.attackGradientColor2, 16)
        );
      case 'ranged':
        return new RangedWeaponComponent(
          entityData.weaponTypeId,
          entityData.weaponMaterialTypeId,
          entityData.handednessId,
          entityData.projectileTypeId
        );
      default:
        throw new Error(
          `Weapon resource file must define a weaponStyleId of "melee" or "ranged". Current value is ${entityData.weaponStyleId}`
        );
    }
  }

  buildInventoryIconComponent(id) {
    const entityData = this.entityDict[id];

    if (!entityData.icon) {
      return null;
    }

    const textureData = this.textureDict[entityData.baseTextureResourceId];
    const baseTexture = textureData ? textureData.texture : Pixi.Texture.EMPTY;
    const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), entityData.icon));

    return new InventoryIconComponent(iconTexture, ...entityData.slots);
  }

  buildLevelIconComponent(id) {
    const entityData = this.entityDict[id];

    if (!entityData.icon) {
      return null;
    }

    const textureData = this.textureDict[entityData.baseTextureResourceId];
    const baseTexture = textureData ? textureData.texture : Pixi.Texture.EMPTY;
    const iconTexture = new Pixi.Texture(baseTexture, _.assign(new Pixi.Rectangle(), entityData.icon));

    return new LevelIconComponent(iconTexture);
  }

  buildAnimatedSpriteSettingsComponents(id) {
    const entityData = this.entityDict[id];

    return _.map(entityData.settings, setting => {
      const mcSetting = new AnimatedSpriteSettingsComponent(setting.id);

      if (setting.positionOffset) {
        mcSetting.positionOffset.x = setting.positionOffset.x;
        mcSetting.positionOffset.y = setting.positionOffset.y;
      }

      if (setting.rotation) {
        mcSetting.rotation = setting.rotation;
      }

      if (setting.anchor) {
        mcSetting.anchor.x = setting.anchor.x;
        mcSetting.anchor.y = setting.anchor.y;
      }

      if (setting.pivot) {
        mcSetting.pivot.x = setting.pivot.x;
        mcSetting.pivot.y = setting.pivot.y;
      }

      //TODO: other settings that could be in AnimatedSpriteSettingsComponent

      return mcSetting;
    });
  }

  buildArmorComponent(id) {
    const entityData = this.entityDict[id];

    return new ArmorComponent(entityData.armorTypeId, entityData.armorMaterialTypeId, ...entityData.slots);
  }

  buildStatisticEffectComponents(id) {
    const entityData = this.entityDict[id];

    return _.map(entityData.statisticEffects, statEffect => {
      let onRemoveFromEntity;
      if (statEffect.onRemoveFromEntity) {
        onRemoveFromEntity = FunctionUtils.buildFromString(statEffect.onRemoveFromEntity);
      }

      return new StatisticEffectComponent(
        statEffect.name,
        statEffect.value,
        statEffect.timeLeft,
        statEffect.targetType,
        statEffect.statisticEffectValue,
        statEffect.effectTimeType,
        onRemoveFromEntity
      );
    });
  }

  _mapHexToIntColors(hexColors) {
    let intColors = [];

    if (hexColors && hexColors.length > 0) {
      intColors = ArrayUtils.map(hexColors, hexString => parseInt(hexString, 16));
    }

    return intColors;
  }
}
