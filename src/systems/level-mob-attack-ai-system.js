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
        //TODO
        break;
      case Const.MobAttackAiState.AttackWarmingUp: {
        this._enteringAttackWarmingUp(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.Attacking: {
        this._enteringAttacking(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.AttackCoolingDown: {
        this._enteringAttackCoolingDown(mob);
        break;
      }
      case Const.MobAttackAiState.CastingWarmingUp: {
        this._enteringCastingWarmingUp(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.Casting: {
        this._enteringCasting(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.CastingCoolingDown: {
        //TODO
        break;
      }
    }
  }

  processState(gameTime, mob, entities) {
    const ai = mob.get('MobAttackAiComponent');
    const hero = this.entityManager.heroEntity;

    switch (ai.state) {
      case Const.MobAttackAiState.Ready: {
        this._doReady(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.AttackWarmingUp: {
        this._doAttackWarmingUp(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.Attacking: {
        this._doAttacking(mob, hero);
        break;
      }
      case Const.MobAttackAiState.AttackCoolingDown: {
        this._doAttackCoolingDown(entities, mob, hero);
        break;
      }
      case Const.MobAttackAiState.CastingWarmingUp: {
        this._doCastingWarmingUp(mob, hero);
        break;
      }
      case Const.MobAttackAiState.Casting: {
        this._doCasting(mob, hero);
        break;
      }
      case Const.MobAttackAiState.CastingCoolingDown: {
        this._doCastingCoolingDown(mob);
        break;
      }
    }

    ai.timeLeftInCurrentState -= gameTime;
  }

  _enteringCasting(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        ai.timeLeftInCurrentState = 0;

        const magicSpell = EntityFinders.findById(
          entities,
          target.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
        );

        if (!magicSpell) {
          break;
        }

        if (!this._canCastSpell(target, magicSpell)) {
          break;
        }

        this._addSpellStatisticEffects(target, magicSpell);
        this._spendMagicPoints(target, magicSpell);

        const mousePosition = ai.transitionData.mousePosition;
        const mouseAttackOriginOffset = this._calculateMouseAttackOriginOffset(mousePosition);
        const mouseTilePosition = ScreenUtils.translateScreenPositionToWorldPosition(
          mouseAttackOriginOffset,
          target.get('PositionComponent').position
        );
        const spellStats = magicSpell.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = spellStats[Const.Statistic.CastingDuration].currentValue;

        const spellComp = magicSpell.get('MagicSpellComponent');

        switch (ObjectUtils.getTypeName(spellComp)) {
          case 'RangedMagicSpellComponent': {
            this.rangedAttack(
              target,
              mouseTilePosition,
              magicSpell,
              magicSpell.get('RangedMagicSpellComponent'),
              magicSpell.get('RangedAttackComponent')
            );

            break;
          }
          case 'SelfMagicSpellComponent': {
            spellComp.actionFunc.call(magicSpell, target, mouseTilePosition, mousePosition);
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
  }

  _enteringCastingWarmingUp(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        const magicSpell = EntityFinders.findById(
          entities,
          target.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
        );

        if (!magicSpell || !this._canCastSpell(target, magicSpell)) {
          ai.timeLeftInCurrentState = 0;
          break;
        }

        ai.timeLeftInCurrentState = this.getWarmupDuration(magicSpell);

        if (magicSpell.has('RangedAttackComponent')) {
          magicSpell.get('RangedAttackComponent').angle = this._calculateAttackAngle(target);
        }

        break;
      }
      default: {
        break;
      }
    }
  }

  _enteringAttacking(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        ai.timeLeftInCurrentState = 0;

        const weapon = EntityFinders.findById(
          entities,
          target.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (!weapon) {
          break;
        }

        const mouseTilePosition = this._calculateMouseTilePosition(ai.transitionData.mousePosition, target);
        const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        switch (ObjectUtils.getTypeName(weapon.get('WeaponComponent'))) {
          case 'MeleeWeaponComponent': {
            weapon.get('MeleeAttackComponent').init(
              EntityUtils.getPositionedBoundingRect(target).getCenter(),
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
              target,
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
        this.faceToward(mob, target);

        ai.timeLeftInCurrentState = 0;

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (!attackImplement) {
          break;
        }

        const weaponStats = attackImplement.getAllKeyed('StatisticComponent', 'name');

        if (
          !this.canBeAttacked(target) ||
          !this.isInRange(mob, target, weaponStats[Const.Statistic.Range].currentValue)
        ) {
          break;
        }

        ai.timeLeftInCurrentState = weaponStats[Const.Statistic.Duration].currentValue;

        const weaponComp = attackImplement.getOfFirstMatchingType('WeaponComponent', 'RangedMagicSpellComponent');

        switch (weaponComp.constructor.name) {
          case 'MeleeWeaponComponent': {
            this.meleeWeaponAttack(mob, target, attackImplement);

            break;
          }
          case 'RangedMagicSpellComponent': {
            if (this.trySpendSpellPoints(mob, attackImplement)) {
              this.rangedAttack(
                mob,
                target,
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
              target,
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
  }

  _enteringAttackCoolingDown(mob) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        break;
      }
      default: {
        ai.timeLeftInCurrentState = ai.stateTime[Const.MobAttackAiState.AttackCoolingDown];
        break;
      }
    }
  }

  _enteringAttackWarmingUp(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobMovementAiType.Hero: {
        const weapon = EntityFinders.findById(
          entities,
          target.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
        );

        if (!weapon) {
          ai.timeLeftInCurrentState = 0;
          break;
        }

        ai.timeLeftInCurrentState = this.getWarmupDuration(weapon);

        if (weapon.has('RangedAttackComponent')) {
          weapon.get('RangedAttackComponent').angle = this._calculateAttackAngle(target);
        }

        break;
      }
      default: {
        this.faceToward(mob, target);

        const attackImplement = this.selectAttackImplement(mob, entities);

        if (attackImplement.has('RangedAttackComponent')) {
          const attackerCenter = EntityUtils.getPositionedBoundingRect(mob).getCenter();
          attackerCenter.x -= 0.5; // assumption is projectile is always 1 tile in size.
          attackerCenter.y -= 0.5;

          attackImplement
            .get('RangedAttackComponent')
            .setAngle(attackerCenter, target.get('PositionComponent').position);
        }

        ai.timeLeftInCurrentState = this.getWarmupDuration(attackImplement);

        break;
      }
    }
  }

  _doCastingCoolingDown(mob) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        break;
      }
      default: {
        break;
      }
    }
  }

  _doCasting(mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        if (!ai.hasTimeLeftInCurrentState) {
          ai.ready();
        }

        if (ai.transitionData && ai.transitionData.mousePosition) {
          this.setFacing(target);
        }

        break;
      }
      default: {
        break;
      }
    }
  }

  _doCastingWarmingUp(mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        if (!ai.hasTimeLeftInCurrentState) {
          ai.cast(ai.transitionData.mousePosition);
        }

        if (ai.transitionData && ai.transitionData.mousePosition) {
          this.setFacing(target);
        }

        break;
      }
      default: {
        break;
      }
    }
  }

  _doAttacking(mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        if (!ai.hasTimeLeftInCurrentState) {
          ai.ready();
        }

        if (ai.transitionData && ai.transitionData.mousePosition) {
          this.setFacing(target);
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
  }

  _doAttackCoolingDown(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        break;
      }
      default: {
        const heroWeapon = EntityFinders.findById(
          entities,
          target.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
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
  }

  _doAttackWarmingUp(entities, mob, target) {
    const ai = mob.get('MobAttackAiComponent');

    switch (ai.mobAttackAiType) {
      case Const.MobAttackAiType.Hero: {
        const mousePosition = ai.transitionData.mousePosition;

        if (!ai.hasTimeLeftInCurrentState) {
          ai.attack(mousePosition);
        }

        if (ai.transitionData && ai.transitionData.mousePosition) {
          this.setFacing(target);
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
          target.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
        );

        if (this.hitByWeapon(mob, heroWeapon)) {
          break;
        }

        if (!this.canBeAttacked(target)) {
          ai.ready();
          break;
        }

        if (!ai.hasTimeLeftInCurrentState) {
          ai.attack();
        }

        break;
      }
    }
  }

  _doReady(entities, mob, target) {
    const attackAi = mob.get('MobAttackAiComponent');
    const movementAi = mob.get('MobMovementAiComponent');

    switch (attackAi.mobAttackAiType) {
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
            this.canBeAttacked(target) &&
            this.canSee(this.entityManager.currentLevelEntity, mob, target)
          ) {
            const range = mobWeapon.get('StatisticComponent', StatisticComponent.isRange).currentValue;

            if (this.isInRange(mob, target, range)) {
              attackAi.attackWarmUp();
              break;
            }
          }
        }

        break;
      }
    }
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
