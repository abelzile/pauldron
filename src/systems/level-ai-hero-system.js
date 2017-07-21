import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import LevelAiSystem from './level-ai-system';
import Vector from '../vector';
import StatisticComponent from '../components/statistic-component';
import EntityReferenceComponent from '../components/entity-reference-component';

export default class LevelAiHeroSystem extends LevelAiSystem {
  constructor(renderer, entityManager) {
    super(renderer, entityManager);

    this._heroArr = [this.entityManager.heroEntity];
  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {}

  aiEntitiesToProcess() {
    return this._heroArr;
  }

  processEnteringState(hero, ents) {
    const ai = hero.get('HeroComponent');

    if (!ai.hasStateChanged) {
      return;
    }

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {
      case HeroComponent.State.Standing: {
        ai.timeLeftInCurrentState = HeroComponent.StateTime[HeroComponent.State.Standing];

        break;
      }
      case HeroComponent.State.Walking: {
        ai.timeLeftInCurrentState = HeroComponent.StateTime[HeroComponent.State.Walking];

        break;
      }
      case HeroComponent.State.KnockingBack: {
        ai.timeLeftInCurrentState = ai.transitionData.duration;

        const movement = hero.get('MovementComponent');
        movement.movementAngle = ai.transitionData.angle;
        movement.velocityVector.zero();

        break;
      }
      case HeroComponent.State.AttackWarmingUp: {
        const weapon = EntityFinders.findById(
          ents,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (!weapon) {
          ai.timeLeftInCurrentState = 0;
          break;
        }

        const warmUpDuration = weapon.get('StatisticComponent', c => c.name === Const.Statistic.WarmUpDuration);
        const duration = (warmUpDuration) ? warmUpDuration.maxValue : 500;

        hero.get('MovementComponent').zeroAll();

        ai.timeLeftInCurrentState = duration; //HeroComponent.StateTime[HeroComponent.State.AttackWarmingUp];

        break;
      }
      case HeroComponent.State.Attacking: {
        ai.timeLeftInCurrentState = 0;

        const weapon = EntityFinders.findById(
          ents,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (!weapon) {
          break;
        }

        hero.get('MovementComponent').zeroAll();

        const mousePosition = ai.transitionData.mousePosition;
        const heroPosition = hero.get('PositionComponent');
        const weaponComp = weapon.get('WeaponComponent');
        const halfTile = Const.TilePixelSize * Const.ScreenScale / 2;
        const heroAttackOriginOffset = Vector.pnew(heroPosition.x + 0.5, heroPosition.y + 0.5);
        const mouseAttackOriginOffset = Vector.pnew(mousePosition.x - halfTile, mousePosition.y - halfTile);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
          mouseAttackOriginOffset,
          heroPosition.position
        );
        const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(weaponComp)) {
          case 'MeleeWeaponComponent': {
            const attack = weapon.get('MeleeAttackComponent');
            attack.init(
              heroAttackOriginOffset,
              mouseTilePosition,
              weaponStats[Const.Statistic.Range].currentValue,
              weaponStats[Const.Statistic.Arc].currentValue,
              weaponStats[Const.Statistic.Duration].currentValue,
              weaponStats[Const.Statistic.Damage].currentValue
            );

            break;
          }
          case 'RangedWeaponComponent': {
            this.rangedAttack(hero, mouseTilePosition, weapon, 'RangedWeaponComponent');

            break;
          }
        }

        heroAttackOriginOffset.pdispose();
        mouseAttackOriginOffset.pdispose();

        break;
      }
      case HeroComponent.State.CastingSpellWarmingUp: {
        const magicSpell = EntityFinders.findById(
          ents,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
        );

        if (!magicSpell || !this.canCastSpell(hero, magicSpell)) {
          ai.timeLeftInCurrentState = 0;
          break;
        }

        const warmUpDuration = magicSpell.get('StatisticComponent', c => c.name === Const.Statistic.WarmUpDuration);
        const duration = (warmUpDuration) ? warmUpDuration.maxValue : 500;

        hero.get('MovementComponent').zeroAll();

        ai.timeLeftInCurrentState = duration; //HeroComponent.StateTime[HeroComponent.State.AttackWarmingUp];

        break;
      }
      case HeroComponent.State.CastingSpell: {
        ai.timeLeftInCurrentState = 0;

        const magicSpell = EntityFinders.findById(
          ents,
          hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
        );

        if (!magicSpell) {
          break;
        }

        if (!this.canCastSpell(hero, magicSpell)) {
          break;
        }

        hero.get('MovementComponent').zeroAll();

        this._addSpellStatisticEffects(hero, magicSpell);
        this._spendMagicPoints(hero, magicSpell);

        const mousePosition = ai.transitionData.mousePosition;
        const heroPosition = hero.get('PositionComponent');
        const weaponComp = magicSpell.get('MagicSpellComponent');
        const halfTile = Const.TilePixelSize * Const.ScreenScale / 2;
        const heroAttackOriginOffset = Vector.pnew(heroPosition.x + 0.5, heroPosition.y + 0.5);
        const mouseAttackOriginOffset = Vector.pnew(mousePosition.x - halfTile, mousePosition.y - halfTile);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
          mouseAttackOriginOffset,
          heroPosition.position
        );
        const weaponStats = magicSpell.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.CastingDuration].currentValue;

        switch (ObjectUtils.getTypeName(weaponComp)) {
          case 'RangedMagicSpellComponent': {
            this.rangedAttack(hero, mouseTilePosition, magicSpell, 'RangedMagicSpellComponent');

            break;
          }
          case 'SelfMagicSpellComponent': {
            weaponComp.actionFunc.call(magicSpell, hero, mouseTilePosition, mousePosition);

            break;
          }
        }

        mouseAttackOriginOffset.pdispose();

        break;
      }
    }
  }

  canCastSpell(caster, magicSpell) {
    if (!caster || !magicSpell) {
      return false;
    }

    const mp = caster.get('StatisticComponent', c => c.name === Const.Statistic.MagicPoints);
    const mpCost = magicSpell.get('StatisticEffectComponent', c => c.name === Const.Statistic.MagicPoints);

    return mp.currentValue >= Math.abs(mpCost.value);
  }

  processState(gameTime, hero, entities) {
    const ai = hero.get('HeroComponent');

    switch (ai.state) {
      case HeroComponent.State.Standing:
      case HeroComponent.State.Walking:
        break;
      case HeroComponent.State.AttackWarmingUp:
        if (!ai.hasTimeLeftInCurrentState) {
          ai.attack(ai.transitionData.mousePosition);
        }
        break;
      case HeroComponent.State.CastingSpellWarmingUp:
        if (!ai.hasTimeLeftInCurrentState) {
          ai.castSpell(ai.transitionData.mousePosition);
        }
        break;
      case HeroComponent.State.KnockingBack:
      case HeroComponent.State.Attacking:
      case HeroComponent.State.CastingSpell:
        if (!ai.hasTimeLeftInCurrentState) {
          ai.stand();
        }
        break;
    }

    ai.timeLeftInCurrentState -= gameTime;
  }

  _addSpellStatisticEffects(caster, magicSpell) {
    caster.addRange(
      magicSpell
        .getAll('StatisticEffectComponent')
        .filter(c => c.targetType === Const.TargetType.Self && c.name !== Const.Statistic.MagicPoints)
        .map(c => c.clone())
    );
  }

  _spendMagicPoints(caster, magicSpell) {
    const mp = caster.get('StatisticComponent', StatisticComponent.isMagicPoints);
    const mpCost = magicSpell.get('StatisticEffectComponent', StatisticComponent.isMagicPoints);

    mp.currentValue -= Math.abs(mpCost.value);

    if (mp.currentValue < 0) {
      mp.currentValue = 0;
    }
  }
}
