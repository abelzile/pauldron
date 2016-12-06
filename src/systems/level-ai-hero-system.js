import * as _ from 'lodash';
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

    if (!ai.hasStateChanged) { return; }

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
        movement.directionVector.x = Math.cos(movement.movementAngle);
        movement.directionVector.y = Math.sin(movement.movementAngle);

        break;

      }
      case HeroComponent.State.Attacking: {

        ai.timeLeftInCurrentState = 0; // default

        const weapon = EntityFinders.findById(ents, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (!weapon) { break; }

        hero.get('MovementComponent').zeroAll();

        const mousePosition = ai.transitionData.mousePosition;
        const heroPosition = hero.get('PositionComponent');
        const weaponComp = weapon.get('WeaponComponent');

        //Offsets required to move attack origin from hero top left to hero center.
        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const heroAttackOriginOffset = Vector.pnew(heroPosition.x + .5, heroPosition.y + .5);
        const mouseAttackOriginOffset = Vector.pnew(mousePosition.x - halfTile, mousePosition.y - halfTile);

        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, heroPosition.position);
        const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(weaponComp)) {

          case 'MeleeWeaponComponent': {

            const attack = weapon.get('MeleeAttackComponent');
            attack.init(heroAttackOriginOffset,
                        mouseTilePosition,
                        weaponStats[Const.Statistic.Range].currentValue,
                        weaponStats[Const.Statistic.Arc].currentValue,
                        weaponStats[Const.Statistic.Duration].currentValue,
                        weaponStats[Const.Statistic.Damage].currentValue,
                        weaponStats[Const.Statistic.KnockBackDuration].currentValue);

            break;

          }
          case 'RangedWeaponComponent': {

            this.rangedWeaponAttack(hero, mouseTilePosition, weapon, 'RangedWeaponComponent');

            break;

          }

        }

        heroAttackOriginOffset.pdispose();
        mouseAttackOriginOffset.pdispose();

        break;

      }
      case HeroComponent.State.CastingSpell: {

        ai.timeLeftInCurrentState = 0;

        const magicSpell = EntityFinders.findById(ents, hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId);

        if (!magicSpell) { break; }

        hero.get('MovementComponent').zeroAll();

        if (!this.canCastSpell(hero, magicSpell)) { break; }

        const effects = magicSpell.getAll('StatisticEffectComponent');

        const mousePos = ai.transitionData.mousePosition;
        const heroPosition = hero.get('PositionComponent');

        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const mouseAttackOriginOffset = Vector.pnew(mousePos.x - halfTile, mousePos.y - halfTile);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, heroPosition.position);

        const magicSpellStats = magicSpell.getAllKeyed('StatisticComponent', 'name');
        const magicSpellComp = magicSpell.get('MagicSpellComponent');

        ai.timeLeftInCurrentState = magicSpellStats[Const.Statistic.CastingDuration].currentValue;

        switch (ObjectUtils.getTypeName(magicSpellComp)) {

          case 'RangedMagicSpellComponent': {

            this._applyEffects(hero, effects, Const.TargetType.Self);

            const projectile = this.entityManager.buildFromProjectileTemplate(magicSpellComp.projectileType);
            this.entityManager.add(projectile);

            const projectileBoundingRectComp = projectile.get('BoundingRectangleComponent');
            const heroBoundingRectComp = hero.get('BoundingRectangleComponent');

            const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
            const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

            const projectileStartPos = Vector.pnew(heroPosition.x + heroBoundingRectComp.rectangle.x + offsetX,
                                                   heroPosition.y + heroBoundingRectComp.rectangle.y + offsetY);

            const projectileAttack = projectile.get('ProjectileAttackComponent');
            projectileAttack.init(hero.id,
                                  projectileStartPos,
                                  mouseTilePosition,
                                  magicSpellStats[Const.Statistic.Range].currentValue,
                                  magicSpellStats[Const.Statistic.Damage].currentValue,
                                  magicSpellStats[Const.Statistic.KnockBackDuration].currentValue);

            const projectilePosition = projectile.get('PositionComponent');
            projectilePosition.position.setFrom(heroPosition.position);

            const projectileMovement = projectile.get('MovementComponent');
            projectileMovement.movementAngle = projectileAttack.angle;
            projectileMovement.velocityVector.zero();
            projectileMovement.directionVector.x = Math.cos(projectileMovement.movementAngle);
            projectileMovement.directionVector.y = Math.sin(projectileMovement.movementAngle);

            this.initProjectileParticleEmitter(projectile.get('ParticleEmitterComponent'), projectilePosition.position, projectileMovement.movementAngle);

            if (magicSpellComp.projectileCount === 1) { break; }

            const tick = Const.RadiansOf22Point5Degrees
            let halfMax = Math.floor(magicSpellComp.projectileCount / 2);
            let mainAngle = projectileAttack.angle;

            for (let j = 0; j < 2; ++j) {

              for (let i = 0; i < halfMax; ++i) {

                mainAngle = (j % 2 === 0) ? mainAngle + tick : mainAngle - tick;

                const p = projectile.clone();
                this.entityManager.add(p);

                const a = p.get('ProjectileAttackComponent');
                a.angle = mainAngle;

                const m = p.get('MovementComponent');
                m.movementAngle = mainAngle;
                m.velocityVector.zero();
                m.directionVector.x = Math.cos(m.movementAngle);
                m.directionVector.y = Math.sin(m.movementAngle);

                this.initProjectileParticleEmitter(p.get('ParticleEmitterComponent'), p.get('PositionComponent').position, mainAngle);

              }

              mainAngle = projectileAttack.angle;

            }

            projectileStartPos.pdispose();

            break;

          }
          case 'SelfMagicSpellComponent': {

            this._applyEffects(hero, effects, Const.TargetType.Self);

            magicSpellComp.actionFunc.call(magicSpell, hero, mouseTilePosition, mousePos);

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