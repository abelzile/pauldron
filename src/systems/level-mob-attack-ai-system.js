import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import EntityReferenceComponent from '../components/entity-reference-component';
import LevelMobAiSystem from './level-mob-ai-system';
import StatisticComponent from '../components/statistic-component';
import Vector from '../vector';

export default class LevelMobAttackAiSystem extends LevelMobAiSystem {
  constructor(entityManager) {
    super(entityManager);
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {}

  processEntities(gameTime, entities, input) {
    const mobs = EntityFinders.findMobs(entities);
    mobs.unshift(this.entityManager.heroEntity);

    for (const mob of mobs) {
      this.processEnteringState(mob, entities);
      this.processState(gameTime, mob, entities);
    }
  }

  processEnteringState(mob, entities) {
    const hero = this.entityManager.heroEntity;
    const ai = mob.get('MobAttackAiComponent');

    if (!ai.hasStateChanged) {
      return;
    }

    ai.updatePreviousStateToCurrent();

    switch (ai.state) {
      case Const.MobAttackAiState.Ready:
        break;
      case Const.MobAttackAiState.AttackWarmingUp: {
        switch (ai.mobAttackAiType) {
          case Const.MobMovementAiType.Hero: {
            const weapon = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
            );

            if (!weapon) {
              ai.timeLeftInCurrentState = 0;
              break;
            }

            ai.timeLeftInCurrentState = this.getWarmupDuration(weapon);

            if (weapon.has('RangedAttackComponent')) {
              weapon.get('RangedAttackComponent').angle = this._calculateAttackAngle(hero);
            }

            break;
          }
          default: {
            this.faceToward(mob, hero);

            const attackImplement = this.selectAttackImplement(mob, entities);

            if (attackImplement.has('RangedAttackComponent')) {
              const attackerCenter = EntityUtils.getPositionedBoundingRect(mob).getCenter();
              attackerCenter.x -= 0.5; // assumption is projectile is always 1 tile in size.
              attackerCenter.y -= 0.5;

              attackImplement
                .get('RangedAttackComponent')
                .setAngle(attackerCenter, hero.get('PositionComponent').position);
            }

            ai.timeLeftInCurrentState = this.getWarmupDuration(attackImplement);

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.AttackCoolingDown: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            break;
          }
          default: {
            ai.timeLeftInCurrentState = ai.stateTime[Const.MobAttackAiState.AttackCoolingDown];

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.Attacking: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            ai.timeLeftInCurrentState = 0;

            const weapon = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
            );

            if (!weapon) {
              break;
            }

            const mouseTilePosition = this._calculateMouseTilePosition(ai.transitionData.mousePosition, hero);
            const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');

            ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

            switch (ObjectUtils.getTypeName(weapon.get('WeaponComponent'))) {
              case 'MeleeWeaponComponent': {
                weapon.get('MeleeAttackComponent').init(
                  EntityUtils.getPositionedBoundingRect(hero).getCenter(), //heroAttackOriginOffset,
                  mouseTilePosition,
                  weaponStats[Const.Statistic.Range].currentValue,
                  weaponStats[Const.Statistic.Arc].currentValue,
                  weaponStats[Const.Statistic.Duration].currentValue,
                  weaponStats[Const.Statistic.Damage].currentValue
                );

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
          default: {
            this.faceToward(mob, hero);

            ai.timeLeftInCurrentState = 0;

            const attackImplement = this.selectAttackImplement(mob, entities);

            if (!attackImplement) {
              break;
            }

            const weaponStats = attackImplement.getAllKeyed('StatisticComponent', 'name');

            if (
              !this.canBeAttacked(hero) ||
              !this.isInRange(mob, hero, weaponStats[Const.Statistic.Range].currentValue)
            ) {
              break;
            }

            ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

            const weaponComp = attackImplement.getOfFirstMatchingType('WeaponComponent', 'RangedMagicSpellComponent');

            switch (weaponComp.constructor.name) {
              case 'MeleeWeaponComponent': {
                this.meleeWeaponAttack(mob, hero, attackImplement);

                break;
              }
              case 'RangedMagicSpellComponent': {
                if (this.trySpendSpellPoints(mob, attackImplement)) {
                  this.rangedAttack(
                    mob,
                    hero,
                    attackImplement,
                    attackImplement.get('RangedMagicSpellComponent'),
                    attackImplement.get('RangedAttackComponent')
                  );
                }

                break;
              }
              case 'RangedWeaponComponent': {
                this.rangedAttack(
                  mob,
                  hero,
                  attackImplement,
                  attackImplement.get('RangedWeaponComponent'),
                  attackImplement.get('RangedAttackComponent')
                );

                break;
              }
            }
            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.CastingWarmingUp: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            const magicSpell = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
            );

            if (!magicSpell || !this._canCastSpell(hero, magicSpell)) {
              ai.timeLeftInCurrentState = 0;
              break;
            }

            ai.timeLeftInCurrentState = this.getWarmupDuration(magicSpell);

            if (magicSpell.has('RangedAttackComponent')) {
              magicSpell.get('RangedAttackComponent').angle = this._calculateAttackAngle(hero);
            }

            break;
          }
          default: {
            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.Casting: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            ai.timeLeftInCurrentState = 0;

            const magicSpell = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
            );

            if (!magicSpell) {
              break;
            }

            if (!this._canCastSpell(hero, magicSpell)) {
              break;
            }

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
          default: {
            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.CastingCoolingDown: {
        break;
      }
    }
  }

  processState(gameTime, mob, entities) {
    const ai = mob.get('MobAttackAiComponent');
    const hero = this.entityManager.heroEntity;
    const movementAi = mob.get('MobMovementAiComponent');

    switch (ai.state) {
      case Const.MobAttackAiState.Ready: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            break;
          }
          default: {
            if (
              movementAi.state === Const.MobMovementAiState.Moving ||
              movementAi.state === Const.MobMovementAiState.Waiting
            ) {
              const mobHand1Slot = mob.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);
              const mobWeapon = mobHand1Slot ? EntityFinders.findById(entities, mobHand1Slot.entityId) : null;

              if (
                mobWeapon &&
                this.canBeAttacked(hero) &&
                this.canSee(this.entityManager.currentLevelEntity, mob, hero)
              ) {
                const range = mobWeapon.get('StatisticComponent', StatisticComponent.isRange).currentValue;

                if (this.isInRange(mob, hero, range)) {
                  ai.attackWarmUp();
                  break;
                }
              }
            }

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.AttackWarmingUp: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            const mousePosition = ai.transitionData.mousePosition;

            if (!ai.hasTimeLeftInCurrentState) {
              ai.attack(mousePosition);
            }

            if (ai.transitionData && ai.transitionData.mousePosition) {
              this.setFacing(hero);
            }

            break;
          }
          default: {
            const attackImplement = this.selectAttackImplement(mob, entities);

            if (!attackImplement) {
              break;
            }

            const heroWeapon = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
            );

            if (this.hitByWeapon(mob, heroWeapon)) {
              break;
            }

            if (!this.canBeAttacked(hero)) {
              ai.ready();
              break;
            }

            if (!ai.hasTimeLeftInCurrentState) {
              ai.attack();
            }

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.AttackCoolingDown: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            break;
          }
          default: {
            const heroWeapon = EntityFinders.findById(
              entities,
              hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
            );

            if (this.hitByWeapon(mob, heroWeapon)) {
              break;
            }

            if (!ai.hasTimeLeftInCurrentState) {
              ai.ready();
            }

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.Attacking: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            if (!ai.hasTimeLeftInCurrentState) {
              ai.ready();
            }

            if (ai.transitionData && ai.transitionData.mousePosition) {
              this.setFacing(hero);
            }

            break;
          }
          default: {
            if (!ai.hasTimeLeftInCurrentState) {
              ai.attackCoolDown();
            }

            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.CastingWarmingUp: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            if (!ai.hasTimeLeftInCurrentState) {
              ai.cast(ai.transitionData.mousePosition);
            }

            if (ai.transitionData && ai.transitionData.mousePosition) {
              this.setFacing(hero);
            }

            break;
          }
          default: {
            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.Casting: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            if (!ai.hasTimeLeftInCurrentState) {
              ai.ready();
            }

            if (ai.transitionData && ai.transitionData.mousePosition) {
              this.setFacing(hero);
            }

            break;
          }
          default: {
            break;
          }
        }

        break;
      }
      case Const.MobAttackAiState.CastingCoolingDown: {
        switch (ai.mobAttackAiType) {
          case Const.MobAttackAiType.Hero: {
            break;
          }
          default: {
            break;
          }
        }

        break;
      }
    }

    ai.timeLeftInCurrentState -= gameTime;
  }

  setFacing(hero) {
    const ai = hero.get('MobAttackAiComponent');
    const heroPosition = hero.get('PositionComponent');
    const mouseTilePosition = this._calculateMouseTilePosition(ai.transitionData.mousePosition, hero);
    const facing = hero.get('FacingComponent');
    if (mouseTilePosition.x > heroPosition.x) {
      facing.facing = Const.Direction.East;
    } else {
      facing.facing = Const.Direction.West;
    }
  }

  _calculateAttackAngle(hero) {
    const ai = hero.get('MobAttackAiComponent');
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

  _canCastSpell(caster, magicSpell) {
    if (!caster || !magicSpell) {
      return false;
    }

    const mp = caster.get('StatisticComponent', c => c.name === Const.Statistic.MagicPoints);
    const mpCost = magicSpell.get('StatisticEffectComponent', c => c.name === Const.Statistic.MagicPoints);

    return mp.currentValue >= Math.abs(mpCost.value);
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
