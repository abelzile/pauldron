import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import Point from '../point';
import Rectangle from '../rectangle';
import System from '../system';


export default class LevelAiHeroSystem extends System {

  constructor(renderer, entityManager) {

    super();

    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(ents) {
  }

  processEntities(gameTime, ents) {

    this._processEnteringState(ents);

    this._processState(gameTime);

  }

  _processEnteringState(ents) {

    const heroEnt = this._entityManager.heroEntity;
    const aiComp = heroEnt.get('HeroComponent');

    if (!aiComp.hasStateChanged) { return; }

    aiComp.updatePreviousStateToCurrent();

    switch (aiComp.state) {

      case HeroComponent.State.Normal: {

        aiComp.timeLeftInCurrentState = HeroComponent.StateTime[HeroComponent.State.Normal];

        break;

      }
      case HeroComponent.State.KnockingBack: {

        const heroMovementComp = heroEnt.get('MovementComponent');
        heroMovementComp.movementAngle = aiComp.transitionData.hitAngle;
        heroMovementComp.velocityVector.zero();
        heroMovementComp.directionVector.set(Math.cos(heroMovementComp.movementAngle),
                                             Math.sin(heroMovementComp.movementAngle));

        aiComp.timeLeftInCurrentState = HeroComponent.StateTime[HeroComponent.State.KnockingBack]; //TODO: should get from aiComp.transitionData.(knockbackTime or whatevs).

        break;

      }
      case HeroComponent.State.Attacking: {

        const heroWeaponEntId = heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId;

        if (!heroWeaponEntId) { break; }

        const heroWeaponEnt = EntityFinders.findById(ents, heroWeaponEntId);

        if (!heroWeaponEnt) { break; }

        heroEnt.get('MovementComponent').zeroAll();

        const mousePosition = aiComp.transitionData.mousePosition;
        const heroPositionComp = heroEnt.get('PositionComponent');
        const weaponComp = heroWeaponEnt.getFirst('MeleeWeaponComponent', 'RangedWeaponComponent');
        const mouseTilePosition = this._translateScreenPositionToTilePosition(mousePosition, heroPositionComp);
        const weaponStatCompsMap = heroWeaponEnt.getAllKeyed('StatisticComponent', 'name');

        switch (ObjectUtils.getTypeName(weaponComp)) {

          case 'MeleeWeaponComponent': {

            const attackComp = heroWeaponEnt.get('MeleeAttackComponent');
            attackComp.setAttack(new Point(heroPositionComp.position.x + 0.5, heroPositionComp.position.y + 0.5),
                                 mouseTilePosition,
                                 weaponStatCompsMap[Const.Statistic.Range].currentValue,
                                 weaponStatCompsMap[Const.Statistic.Arc].currentValue,
                                 weaponStatCompsMap[Const.Statistic.Duration].currentValue,
                                 weaponStatCompsMap[Const.Statistic.Damage].currentValue);

            const mobEnts = EntityFinders.findMobs(this._entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt),
                                                   'AiRandomWandererComponent');

            for (const mobEnt of mobEnts) {

              if (!this._allowedToAttack(mobEnt)) { continue; }

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

            const projectileEnt = this._entityManager.buildFromProjectileTemplate(weaponComp.projectile);
            this._entityManager.add(projectileEnt);

            const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
            const heroBoundingRectComp = heroEnt.get('BoundingRectangleComponent');

            const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
            const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

            const projectileStartPos = new Point(heroPositionComp.position.x + heroBoundingRectComp.rectangle.x + offsetX,
              heroPositionComp.position.y + heroBoundingRectComp.rectangle.y + offsetY);

            const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
            projectileAttackComp.set(heroEnt.id,
                                     projectileStartPos,
                                     mouseTilePosition,
                                     weaponStatCompsMap[Const.Statistic.Range].currentValue,
                                     weaponStatCompsMap[Const.Statistic.Damage].currentValue);

            const projectilePositionComp = projectileEnt.get('PositionComponent');
            projectilePositionComp.position.setFrom(heroPositionComp.position);

            const projectileMovementComp = projectileEnt.get('MovementComponent');
            projectileMovementComp.movementAngle = projectileAttackComp.angle;
            projectileMovementComp.velocityVector.zero();
            projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                                       Math.sin(projectileMovementComp.movementAngle));

            break;

          }

        }

        aiComp.timeLeftInCurrentState = weaponStatCompsMap[Const.Statistic.Duration].currentValue;

        break;

      }
      case HeroComponent.State.CastingSpell: {

        const heroMagicSpellEntId = heroEnt.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId;

        if (!heroMagicSpellEntId) { break; }

        const heroMagicSpellEnt = EntityFinders.findById(ents, heroMagicSpellEntId);

        if (!heroMagicSpellEnt) { break; }

        const statEffectComps = heroMagicSpellEnt.getAll('StatisticEffectComponent');
        const heroStatCompsMap = heroEnt.getAllKeyed('StatisticComponent', 'name');

        const magicPointsComp = heroStatCompsMap[Const.Statistic.MagicPoints];
        const heroSpellPoints = magicPointsComp.currentValue;
        const spellCost = _.find(statEffectComps, c => c.name === Const.Statistic.MagicPoints).value;

        if (heroSpellPoints < Math.abs(spellCost)) { break; } // can't cast. not enough mp.
        
        magicPointsComp.currentValue += spellCost;

        heroEnt.get('MovementComponent').zeroAll();

        const mousePosition1 = aiComp.transitionData.mousePosition;
        const heroPositionComp = heroEnt.get('PositionComponent');
        const mouseTilePosition = this._translateScreenPositionToTilePosition(mousePosition1, heroPositionComp);
        const magicSpellStatCompsMap = heroMagicSpellEnt.getAllKeyed('StatisticComponent', 'name');
        const magicSpellComp = heroMagicSpellEnt.getFirst('RangedMagicSpellComponent', 'SelfMagicSpellComponent');

        switch (ObjectUtils.getTypeName(magicSpellComp)) {

          case 'RangedMagicSpellComponent': {

            //TODO: implement StatisticEffectComponents

            const projectileEnt = this._entityManager.buildFromProjectileTemplate(magicSpellComp.projectileType);
            this._entityManager.add(projectileEnt);

            const projectileBoundingRectComp = projectileEnt.get('BoundingRectangleComponent');
            const heroBoundingRectComp = heroEnt.get('BoundingRectangleComponent');

            const offsetX = (heroBoundingRectComp.rectangle.width - projectileBoundingRectComp.rectangle.width) / 2;
            const offsetY = (heroBoundingRectComp.rectangle.height - projectileBoundingRectComp.rectangle.height) / 2;

            const projectileStartPos = new Point(heroPositionComp.position.x + heroBoundingRectComp.rectangle.x + offsetX,
              heroPositionComp.position.y + heroBoundingRectComp.rectangle.y + offsetY);

            const projectileAttackComp = projectileEnt.get('ProjectileAttackComponent');
            projectileAttackComp.set(heroEnt.id,
                                     projectileStartPos,
                                     mouseTilePosition,
                                     magicSpellStatCompsMap[Const.Statistic.Range].currentValue,
                                     magicSpellStatCompsMap[Const.Statistic.Damage].currentValue);

            const projectilePositionComp = projectileEnt.get('PositionComponent');
            projectilePositionComp.position.setFrom(heroPositionComp.position);

            const projectileMovementComp = projectileEnt.get('MovementComponent');
            projectileMovementComp.movementAngle = projectileAttackComp.angle;
            projectileMovementComp.velocityVector.zero();
            projectileMovementComp.directionVector.set(Math.cos(projectileMovementComp.movementAngle),
                                                       Math.sin(projectileMovementComp.movementAngle));

            break;

          }
          case 'SelfMagicSpellComponent': {

            for (const c of statEffectComps) {
              if (c.name !== Const.Statistic.MagicPoints && c.targetType === Const.TargetType.Self) {
                heroStatCompsMap[c.name].currentValue += c.value;
              }
            }

            break;

          }

        }

        aiComp.timeLeftInCurrentState = magicSpellStatCompsMap[Const.Statistic.Duration].currentValue;

        break;

      }

    }

  }

  _processState(gameTime) {

    const heroEnt = this._entityManager.heroEntity;
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

  _translateScreenPositionToTilePosition(screenPosition, heroPositionComp) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const tilePxSize = this._renderer.tilePxSize;
    const scale = this._renderer.globalScale;

    const screenTileWidth = screenWidth / tilePxSize / scale;
    const screenTileHeight = screenHeight / tilePxSize / scale;

    const leftTile = heroPositionComp.position.x - (screenTileWidth / 2);
    const topTile = heroPositionComp.position.y - (screenTileHeight / 2);

    const screenTilePosX = leftTile + (screenPosition.x / tilePxSize / scale);
    const screenTilePosY = topTile + (screenPosition.y / tilePxSize / scale);

    return new Point(screenTilePosX, screenTilePosY);

  }

  _allowedToAttack(mobEnt) {

    //TODO:Fix this.
    const aiComp = mobEnt.getFirst('AiRandomWandererComponent', 'AiSeekerComponent');
    return (aiComp.state !== 'knockingBack'); //Const.AiState.KnockingBack);

  }

}