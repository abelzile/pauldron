import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import _ from 'lodash';
import LevelAiSystem from './level-ai-system';
import Point from '../point';


export default class LevelAiHeroSystem extends LevelAiSystem {

  constructor(renderer, entityManager) {

    super(renderer, entityManager);

    this._heroEntArr = [ this.entityManager.heroEntity ];

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

  aiEntitiesToProcess() {
    return this._heroEntArr;
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
        movement.directionVector.set(Math.cos(movement.movementAngle), Math.sin(movement.movementAngle));

        break;

      }
      case HeroComponent.State.Attacking: {

        ai.timeLeftInCurrentState = 0; // default

        const weapon = EntityFinders.findById(ents, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

        if (!weapon) { break; }

        hero.get('MovementComponent').zeroAll();

        const mousePosition = ai.transitionData.mousePosition;
        const heroPositionComp = hero.get('PositionComponent');
        const weaponComp = weapon.get('WeaponComponent');

        //Offsets required to move attack origin from hero top left to hero center.
        const halfTile = (Const.TilePixelSize * Const.ScreenScale) / 2;
        const heroAttackOriginOffset = new Point(heroPositionComp.x + .5, heroPositionComp.y + .5);
        const mouseAttackOriginOffset = new Point(mousePosition.x - halfTile, mousePosition.y - halfTile);

        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mouseAttackOriginOffset, heroPositionComp.position);
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

            const mobs = EntityFinders.findMobs(this.entityManager.entitySpatialGrid.getAdjacentEntities(hero));

            for (const mob of mobs) {

              if (!this.canBeAttacked(mob)) { continue; }

              if (attack.containsHitEntityId(mob.id)) { continue; }

              const mobPositionComp = mob.get('PositionComponent');
              const mobBoundingRectComp = mob.get('BoundingRectangleComponent');
              const mobPositionedBoundingRect = mobBoundingRectComp.rectangle.getOffsetBy(mobPositionComp.position);

              let done = false;

              for (const attackLine of attack.lines) {

                for (const sideLine of mobPositionedBoundingRect.sides) {

                  if (!attackLine.intersectsWith(sideLine)) { continue; }

                  const hitAngle = Math.atan2(mobPositionComp.y - heroPositionComp.y, mobPositionComp.x - heroPositionComp.x);

                  attack.addHit(mob.id, hitAngle);

                  done = true;

                  break;

                }

                if (done) { break; }

              }

            }

            break;

          }
          case 'RangedWeaponComponent': {
            
            this.rangedWeaponAttack(hero, mouseTilePosition, weapon, 'RangedWeaponComponent');

            break;

          }

        }

        break;

      }
      case HeroComponent.State.CastingSpell: {

        ai.timeLeftInCurrentState = 0;

        const magicSpell = EntityFinders.findById(ents, hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId);

        if (!magicSpell) { break; }

        hero.get('MovementComponent').zeroAll();

        const heroStats= hero.getAllKeyed('StatisticComponent', 'name');
        const magicPointsComp = heroStats[Const.Statistic.MagicPoints];
        const heroSpellPoints = magicPointsComp.currentValue;
        const statEffects = magicSpell.getAll('StatisticEffectComponent');
        const spellCost = _.find(statEffects, c => c.name === Const.Statistic.MagicPoints).value;

        if (heroSpellPoints < Math.abs(spellCost)) { break; }

        magicPointsComp.currentValue += spellCost;

        const mousePos = ai.transitionData.mousePosition;
        const heroPositionComp = hero.get('PositionComponent');
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mousePos, heroPositionComp.position);
        const magicSpellStats = magicSpell.getAllKeyed('StatisticComponent', 'name');
        const magicSpellComp = magicSpell.get('MagicSpellComponent');

        ai.timeLeftInCurrentState = magicSpellStats[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(magicSpellComp)) {

          case 'RangedMagicSpellComponent':
          {

            //TODO: implement StatisticEffectComponents

            const projectile = this.entityManager.buildFromProjectileTemplate(magicSpellComp.projectileType);
            this.entityManager.add(projectile);

            const projectileBoundingRectComp = projectile.get('BoundingRectangleComponent');
            const heroBoundingRectComp = hero.get('BoundingRectangleComponent');

            const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
            const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

            const projectileStartPos = new Point(heroPositionComp.x + heroBoundingRectComp.rectangle.x + offsetX,
                                                 heroPositionComp.y + heroBoundingRectComp.rectangle.y + offsetY);

            const projectileAttack = projectile.get('ProjectileAttackComponent');
            projectileAttack.init(hero.id,
                                  projectileStartPos,
                                  mouseTilePosition,
                                  magicSpellStats[Const.Statistic.Range].currentValue,
                                  magicSpellStats[Const.Statistic.Damage].currentValue,
                                  magicSpellStats[Const.Statistic.KnockBackDuration].currentValue);

            const projectilePosition = projectile.get('PositionComponent');
            projectilePosition.position.setFrom(heroPositionComp.position);

            const projectileMovement = projectile.get('MovementComponent');
            projectileMovement.movementAngle = projectileAttack.angle;
            projectileMovement.velocityVector.zero();
            projectileMovement.directionVector.set(Math.cos(projectileMovement.movementAngle), Math.sin(projectileMovement.movementAngle));

            break;

          }
          case 'SelfMagicSpellComponent':
          {

            for (const c of statEffects) {
              if (c.name !== Const.Statistic.MagicPoints && c.targetType === Const.TargetType.Self) {
                heroStats[c.name].currentValue += c.value;
              }
            }

            break;

          }

        }

        break;

      }

    }

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

}