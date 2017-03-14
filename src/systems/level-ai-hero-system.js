import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import LevelAiSystem from './level-ai-system';
import Vector from '../vector';

export default class LevelAiHeroSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {

    super(renderer, entityManager);

    this._heroArr = [ this.entityManager.heroEntity ];

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

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
      case HeroComponent.State.Attacking: {

        ai.timeLeftInCurrentState = 0; // default

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
        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const heroAttackOriginOffset = Vector.pnew(heroPosition.x + .5, heroPosition.y + .5);
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
              weaponStats[Const.Statistic.Damage].currentValue/*,
              weaponStats[Const.Statistic.KnockBackDuration].currentValue*/
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

        const effects = magicSpell.getAll('StatisticEffectComponent');
        this._applyEffects(hero, effects, Const.TargetType.Self);

        const mousePosition = ai.transitionData.mousePosition;
        const heroPosition = hero.get('PositionComponent');
        const weaponComp = magicSpell.get('MagicSpellComponent');
        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const heroAttackOriginOffset = Vector.pnew(heroPosition.x + .5, heroPosition.y + .5);
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

    const casterStats = caster.getAllKeyed('StatisticComponent', 'name');
    const magicPointsComp = casterStats[Const.Statistic.MagicPoints];
    const casterSpellPoints = magicPointsComp.currentValue;
    const mpComp = magicSpell.get('StatisticEffectComponent', c => c.name === Const.Statistic.MagicPoints);
    const spellCost = mpComp.value;

    return casterSpellPoints >= Math.abs(spellCost);

  }

  processState(gameTime, hero, entities) {

    const ai = hero.get('HeroComponent');

    switch (ai.state) {

      case HeroComponent.State.Standing:
      case HeroComponent.State.Walking:

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

  _applyEffects(target, effects, targetType) {

    for (let i = 0; i < effects.length; ++i) {

      const effect = effects[i];

      if (effect.targetType === targetType) {

        target.add(effect.clone());

      }

    }

  }

}