import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import LevelAiSystem from './level-ai-system';
import Point from '../point';
import * as ScreenUtils from '../utils/screen-utils';


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

  processEnteringState(heroEnt, ents) {

    const aiComp = heroEnt.get('HeroComponent');

    if (!aiComp.hasStateChanged) { return; }

    aiComp.updatePreviousStateToCurrent();

    switch (aiComp.state) {

      case HeroComponent.State.Normal: {

        aiComp.timeLeftInCurrentState = HeroComponent.StateTime[HeroComponent.State.Normal];

        break;

      }
      case HeroComponent.State.KnockingBack: {

        aiComp.timeLeftInCurrentState = aiComp.transitionData.duration;

        const heroMovementComp = heroEnt.get('MovementComponent');
        heroMovementComp.movementAngle = aiComp.transitionData.angle;
        heroMovementComp.velocityVector.zero();
        heroMovementComp.directionVector.set(Math.cos(heroMovementComp.movementAngle), Math.sin(heroMovementComp.movementAngle));

        break;

      }
      case HeroComponent.State.Attacking: {

        aiComp.timeLeftInCurrentState = 0; // default

        const heroWeaponEntId = heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId;

        if (!heroWeaponEntId) { break; }

        const heroWeaponEnt = EntityFinders.findById(ents, heroWeaponEntId);

        if (!heroWeaponEnt) { break; }

        heroEnt.get('MovementComponent').zeroAll();

        const mousePosition = aiComp.transitionData.mousePosition;
        const heroPositionComp = heroEnt.get('PositionComponent');
        const weaponComp = heroWeaponEnt.get('WeaponComponent');
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mousePosition, heroPositionComp.position, this.renderer);
        const weaponStatCompsMap = heroWeaponEnt.getAllKeyed('StatisticComponent', 'name');

        aiComp.timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(weaponComp)) {

          case 'MeleeWeaponComponent': {

            const attackComp = heroWeaponEnt.get('MeleeAttackComponent');
            attackComp.init(new Point(heroPositionComp.position.x + 0.5, heroPositionComp.position.y + 0.5),
                            mouseTilePosition,
                            weaponStatCompsMap[Const.Statistic.Range].currentValue,
                            weaponStatCompsMap[Const.Statistic.Arc].currentValue,
                            weaponStatCompsMap[Const.Statistic.Duration].currentValue,
                            weaponStatCompsMap[Const.Statistic.Damage].currentValue,
                            weaponStatCompsMap[Const.Statistic.KnockBackDuration].currentValue);

            const mobEnts = EntityFinders.findMobs(this.entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt));

            for (const mobEnt of mobEnts) {

              if (!this.canBeAttacked(mobEnt)) { continue; }

              if (attackComp.containsHitEntityId(mobEnt.id)) { continue; }

              const mobPositionComp = mobEnt.get('PositionComponent');
              const mobBoundingRectComp = mobEnt.get('BoundingRectangleComponent');
              const mobPositionedBoundingRect = mobBoundingRectComp.rectangle.getOffsetBy(mobPositionComp.position);

              let done = false;

              for (const attackLine of attackComp.lines) {

                for (const sideLine of mobPositionedBoundingRect.sides) {

                  if (!attackLine.intersectsWith(sideLine)) { continue; }

                  const hitAngle = Math.atan2(mobPositionComp.position.y - heroPositionComp.position.y,
                                              mobPositionComp.position.x - heroPositionComp.position.x);

                  attackComp.addHit(mobEnt.id, hitAngle);

                  done = true;

                  break;

                }

                if (done) { break; }

              }

            }

            break;

          }
          case 'RangedWeaponComponent': {
            
            this.rangedWeaponAttack(this.entityManager, heroEnt, mouseTilePosition, heroWeaponEnt, 'RangedWeaponComponent');

            break;

          }

        }

        break;

      }
      case HeroComponent.State.CastingSpell: {

        aiComp.timeLeftInCurrentState = 0;

        const heroMagicSpellEntId = heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId;

        if (!heroMagicSpellEntId) { break; }

        const heroMagicSpellEnt = EntityFinders.findById(ents, heroMagicSpellEntId);

        if (!heroMagicSpellEnt) { break; }

        heroEnt.get('MovementComponent').zeroAll();

        const heroStatCompsMap = heroEnt.getAllKeyed('StatisticComponent', 'name');
        const magicPointsComp = heroStatCompsMap[Const.Statistic.MagicPoints];
        const heroSpellPoints = magicPointsComp.currentValue;
        const statEffectComps = heroMagicSpellEnt.getAll('StatisticEffectComponent');
        const spellCost = _.find(statEffectComps, c => c.name === Const.Statistic.MagicPoints).value;

        if (heroSpellPoints < Math.abs(spellCost)) { break; }

        magicPointsComp.currentValue += spellCost;

        const mousePos = aiComp.transitionData.mousePosition;
        const heroPositionComp = heroEnt.get('PositionComponent');
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(mousePos, heroPositionComp.position, this.renderer);
        const magicSpellStatCompsMap = heroMagicSpellEnt.getAllKeyed('StatisticComponent', 'name');
        const magicSpellComp = heroMagicSpellEnt.get('MagicSpellComponent');

        aiComp.timeLeftInCurrentState = magicSpellStatCompsMap[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(magicSpellComp)) {

          case 'RangedMagicSpellComponent':
          {

            //TODO: implement StatisticEffectComponents

            const projectileEnt = this.entityManager.buildFromProjectileTemplate(magicSpellComp.projectileType);
            this.entityManager.add(projectileEnt);

            const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
            const heroBoundingRectComp = heroEnt.get('BoundingRectangleComponent');

            const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
            const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

            const projectileStartPos = new Point(heroPositionComp.position.x + heroBoundingRectComp.rectangle.x + offsetX,
              heroPositionComp.position.y + heroBoundingRectComp.rectangle.y + offsetY);

            const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
            projectileAttackComp.init(heroEnt.id,
                                      projectileStartPos,
                                      mouseTilePosition,
                                      magicSpellStatCompsMap[Const.Statistic.Range].currentValue,
                                      magicSpellStatCompsMap[Const.Statistic.Damage].currentValue,
                                      magicSpellStatCompsMap[Const.Statistic.KnockBackDuration].currentValue);

            const projectilePositionComp = projectileEnt.get('PositionComponent');
            projectilePositionComp.position.setFrom(heroPositionComp.position);

            const projectileMovementComp = projectileEnt.get('MovementComponent');
            projectileMovementComp.movementAngle = projectileAttackComp.angle;
            projectileMovementComp.velocityVector.zero();
            projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                                       Math.sin(projectileMovementComp.movementAngle));

            break;

          }
          case 'SelfMagicSpellComponent':
          {

            for (const c of statEffectComps) {
              if (c.name !== Const.Statistic.MagicPoints && c.targetType === Const.TargetType.Self) {
                heroStatCompsMap[c.name].currentValue += c.value;
              }
            }

            break;

          }

        }

        break;

      }

    }

  }

  processState(gameTime, heroEnt, ents) {

    const aiComp = heroEnt.get('HeroComponent');

    switch (aiComp.state) {

      case HeroComponent.State.Normal:

        break;

      case HeroComponent.State.KnockingBack:
      case HeroComponent.State.Attacking:
      case HeroComponent.State.CastingSpell:

        if (!aiComp.hasTimeLeftInCurrentState) {
          aiComp.normal();
        }

        break;

    }

    aiComp.timeLeftInCurrentState -= gameTime;

  }

}