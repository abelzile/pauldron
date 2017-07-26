import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import EntityReferenceComponent from '../components/entity-reference-component';
import LevelAiSystem from './level-ai-system';
import StatisticComponent from '../components/statistic-component';
import Vector from '../vector';

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

        ai.timeLeftInCurrentState = this.getWarmupDuration(weapon);

        hero.get('MovementComponent').directionVector.zero();

        if (weapon.has('RangedAttackComponent')) {
          weapon.get('RangedAttackComponent').angle = this._calculateAttackAngle(hero);
        }

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

        ai.timeLeftInCurrentState = this.getWarmupDuration(magicSpell);

        hero.get('MovementComponent').directionVector.zero();

        if (magicSpell.has('RangedAttackComponent')) {
          magicSpell.get('RangedAttackComponent').angle = this._calculateAttackAngle(hero);
        }

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

        const mouseTilePosition = this._calculateMouseTilePosition(ai.transitionData.mousePosition, hero);
        const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(weapon.get('WeaponComponent'))) {
          case 'MeleeWeaponComponent': {
            const heroAttackOriginOffset = this._calculateHeroAttackOriginOffset(hero.get('PositionComponent'));

            weapon
              .get('MeleeAttackComponent')
              .init(
                heroAttackOriginOffset,
                mouseTilePosition,
                weaponStats[Const.Statistic.Range].currentValue,
                weaponStats[Const.Statistic.Arc].currentValue,
                weaponStats[Const.Statistic.Duration].currentValue,
                weaponStats[Const.Statistic.Damage].currentValue
              );

            heroAttackOriginOffset.pdispose();

            break;
          }
          case 'RangedWeaponComponent': {
            this.rangedAttack(
              hero,
              mouseTilePosition,
              weapon,
              weapon.get('RangedWeaponComponent'),
              weapon.get('RangedAttackComponent')
            );

            break;
          }
        }

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
        const mouseAttackOriginOffset = this._calculateMouseAttackOriginOffset(mousePosition);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
          mouseAttackOriginOffset,
          hero.get('PositionComponent').position
        );
        const weaponStats = magicSpell.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.CastingDuration].currentValue;

        const weaponComp = magicSpell.get('MagicSpellComponent');

        switch (ObjectUtils.getTypeName(weaponComp)) {
          case 'RangedMagicSpellComponent': {
            this.rangedAttack(
              hero,
              mouseTilePosition,
              magicSpell,
              magicSpell.get('RangedMagicSpellComponent'),
              magicSpell.get('RangedAttackComponent')
            );

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

  _calculateAttackAngle(hero) {
    const ai = hero.get('HeroComponent');
    const heroAttackOriginOffset = this._calculateHeroAttackOriginOffset(hero.get('PositionComponent'));
    const mouseTilePosition = this._calculateMouseTilePosition(ai.transitionData.mousePosition, hero);
    const angle = Math.atan2(
      mouseTilePosition.y - heroAttackOriginOffset.y,
      mouseTilePosition.x - heroAttackOriginOffset.x
    );

    heroAttackOriginOffset.pdispose();

    return angle;
  }

  _calculateHeroAttackOriginOffset(heroPosition) {
    return Vector.pnew(heroPosition.x + 0.5, heroPosition.y + 0.5);
  }

  _calculateMouseAttackOriginOffset(mousePosition) {
    const halfTile = Const.TilePixelSize * Const.ScreenScale / 2;
    return Vector.pnew(mousePosition.x - halfTile, mousePosition.y - halfTile);
  }

  _calculateMouseTilePosition(mousePosition, hero) {
    const mouseAttackOriginOffset = this._calculateMouseAttackOriginOffset(mousePosition);
    const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
      mouseAttackOriginOffset,
      hero.get('PositionComponent').position
    );

    mouseAttackOriginOffset.pdispose();

    return mouseTilePosition;
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
