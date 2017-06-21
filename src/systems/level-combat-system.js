import * as _ from 'lodash';
import * as AiRandomWandererComponent from '../components/ai-random-wanderer-component';
import * as AiSeekerComponent from '../components/ai-seeker-component';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import EntityReferenceComponent from '../components/entity-reference-component';
import ExperienceComponent from '../components/experience-component';
import Rectangle from '../rectangle';
import StatisticComponent from '../components/statistic-component';
import System from '../system';

export default class LevelCombatSystem extends System {
  constructor(renderer, entityManager) {
    super();

    this.ArmorSlots = [Const.InventorySlot.Body, Const.InventorySlot.Feet, Const.InventorySlot.Head];

    this._renderer = renderer;
    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {
    const hero = this._entityManager.heroEntity;
    const adjacentEntities = this._entityManager.getEntitiesAdjacentToHero();
    const hostileMobs = EntityFinders.findHostileMobs(adjacentEntities);
    const weapons = EntityFinders.findWeapons(entities);
    const projectiles = EntityFinders.findProjectiles(entities);

    this._doAttacks(gameTime, entities, hero, hostileMobs, weapons, projectiles);
  }

  _doAttacks(gameTime, entities, hero, mobs, weapons, projectiles) {
    //1. Hero attacking mobs.

    const heroWeapon = EntityFinders.findById(
      weapons,
      hero.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot).entityId
    );
    const heroSpell = EntityFinders.findById(
      entities,
      hero.get('EntityReferenceComponent', EntityReferenceComponent.isMemorySlot).entityId
    );

    let heroWeaponAttack = null;
    if (heroWeapon) {
      heroWeaponAttack = heroWeapon.get('MeleeAttackComponent');
    }

    let heroSpellAttack = null;
    if (heroSpell) {
      heroSpellAttack = heroSpell.get('MeleeAttackComponent');
    }

    const weaps = [heroSpell, heroWeapon];
    const attacks = [heroSpellAttack, heroWeaponAttack];

    let weapon = null;
    let attack = null;

    for (let i = 0; i < attacks.length; ++i) {
      const temp = attacks[i];

      if (temp && temp.hasRemainingAttack) {
        attack = temp;
        weapon = weaps[i];
      }
    }

    if (attack) {
      const heroPosition = hero.get('PositionComponent');
      const heroAttackOriginOffsetX = heroPosition.x + 0.5;
      const heroAttackOriginOffsetY = heroPosition.y + 0.5;
      const xDiff = heroAttackOriginOffsetX - attack.origin.x;
      const yDiff = heroAttackOriginOffsetY - attack.origin.y;

      if (!(xDiff === 0 && yDiff === 0)) {
        attack.adjustPositionBy(xDiff, yDiff);
      }

      for (const mob of mobs) {
        if (attack.containsHitEntityId(mob.id)) {
          continue;
        }

        if (!this.canBeAttacked(mob)) {
          continue;
        }

        const mobPosition = mob.get('PositionComponent');
        const mobPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(mob);
        const attackLines = attack.lines;
        let done = false;

        for (const attackLine of attackLines) {
          if (done) {
            break;
          }

          for (const mobSide of mobPositionedBoundingRect.sides) {
            if (done) {
              break;
            }

            if (!attackLine.intersectsWith(mobSide)) {
              continue;
            }

            const hitAngle = Math.atan2(mobPosition.y - heroPosition.y, mobPosition.x - heroPosition.x);
            const hitPosition = attack.addHit(mob.id, hitAngle, mobPositionedBoundingRect);

            this.emit('level-combat-system.show-attack-hit', attack, hitPosition);

            done = true;
          }
        }

        this._processMeleeAttack(entities, hero, weapon, mob);
      }
    }

    for (const temp of attacks) {
      temp && temp.hasRemainingAttack && temp.decrementBy(gameTime);
    }

    //2. Mobs attacking hero.

    for (const mob of mobs) {
      const mobHand1Slot = mob.get('EntityReferenceComponent', EntityReferenceComponent.isHand1Slot);

      if (!mobHand1Slot) {
        continue;
      }

      const mobWeapon = EntityFinders.findById(weapons, mobHand1Slot.entityId);

      if (mobWeapon && mobWeapon.has('MeleeAttackComponent')) {
        const attack = mobWeapon.get('MeleeAttackComponent');

        if (attack.hasRemainingAttack) {
          this._processMeleeAttack(entities, mob, mobWeapon, hero);

          if (attack.hasRemainingAttack) {
            attack.decrementBy(gameTime);
          }
        }
      }
    }

    //3. Projectile attacks.

    const mobAndHeroEnts = [].concat(mobs, hero);

    for (const projectile of projectiles) {
      for (const mobOrHero of mobAndHeroEnts) {
        this._processProjectileAttack(entities, projectile, mobOrHero);
      }
    }
  }

  _processMeleeAttack(entities, attacker, attackerWeapon, target) {
    const attackerWeaponAttack = attackerWeapon.get('MeleeAttackComponent');

    if (!attackerWeaponAttack.containsHitEntityId(target.id)) {
      return;
    }

    const attackHit = attackerWeaponAttack.findHitEntityObj(target.id);

    if (attackHit.hasBeenProcessed) {
      return;
    }

    attackHit.hasBeenProcessed = true;

    this._processMeleeDamage(entities, target, attacker, attackerWeapon);
  }

  _processProjectileAttack(entities, projectile, target) {
    if (projectile.deleted) {
      return;
    }

    const projectileAttack = projectile.get('ProjectileAttackComponent');
    if (projectileAttack.shooterEntityId === target.id) {
      return;
    }

    const shooterEntity = EntityFinders.findById(entities, projectileAttack.shooterEntityId);
    if (EntityFinders.isMob(shooterEntity) && EntityFinders.isMob(target)) {
      return;
    }

    const projectilePositionedBoundingRect = EntityUtils.getPositionedBoundingRect(projectile);
    const targetPositionedBoundingRect = EntityUtils.getPositionedBoundingRect(target);

    const intersection = Rectangle.intersection(projectilePositionedBoundingRect, targetPositionedBoundingRect);
    if (!intersection) {
      return;
    }

    projectile.deleted = true;

    const center = intersection.getCenter();

    this.emit('level-combat-system.show-attack-hit', projectileAttack, center);

    this._processProjectileDamage(entities, target, projectile);
  }

  _processMeleeDamage(entities, target, attacker, attackerWeapon) {
    const targetHpComp = this._applyMeleeDamage(attacker, attackerWeapon, target, entities);

    if (targetHpComp.currentValue <= 0) {
      this._processDeath(entities, target);
    } else {
      const weaponStats = attackerWeapon.getAllKeyed('StatisticComponent', 'name');
      const attackComp = attackerWeapon.get('MeleeAttackComponent');
      const hitObj = attackComp.findHitEntityObj(target.id);
      const ai = target.get('AiComponent');
      ai.knockBack(hitObj.hitAngle, weaponStats[Const.Statistic.KnockBackDuration].currentValue);
    }
  }

  _processProjectileDamage(entities, target, attacker) {
    const targetHpComp = this._applyProjectileDamage(attacker, target, entities);

    if (targetHpComp.currentValue <= 0) {
      this._processDeath(entities, target);
    } else {
      const weaponStats = attacker.getAllKeyed('StatisticComponent', 'name');
      const attackComp = attacker.get('ProjectileAttackComponent');
      const ai = target.get('AiComponent');
      ai.knockBack(attackComp.angle, weaponStats[Const.Statistic.KnockBackDuration].currentValue);
    }
  }

  _processDeath(entities, deadMob) {
    if (EntityFinders.isHero(deadMob)) {
      console.log('hero dead.');
      this.emit('level-combat-system.defeat');
    } else {
      console.log('mob dead.');

      const experienceValue = deadMob.get('ExperienceValueComponent');

      if (experienceValue) {
        this._processExpUp(entities, experienceValue);
      } else {
        console.log('ALERT! No ExperienceValueComponent on ' + deadMob);
      }

      deadMob.deleted = true;

      const levelMob = this._entityManager.getLevelMobComponentRepresenting(deadMob);
      if (levelMob && levelMob.isBoss) {
        const doors = this._entityManager.currentLevelEntity.get('DoorsComponent');

        if (doors && doors.exitDoor) {
          this._unlockDoor(doors.exitDoor);
        }
      }

      const money = deadMob.get('MoneyComponent');

      if (money) {
        let monies = this._entityManager.buildMonies(money.amount);
        if (monies.length > 1) {
          monies = _.shuffle(monies);
        }

        const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
        const pos = deadMob.get('PositionComponent');
        const neighborTiles = tileMap.getNeighborTiles(Math.trunc(pos.x), Math.trunc(pos.y), monies.length, true);

        for (let i = 0; i < monies.length; ++i) {
          const mon = monies[i];
          const neighborTile = neighborTiles[i];
          mon.get('PositionComponent').position.set(neighborTile.x, neighborTile.y);
          this._entityManager.add(mon);
          this._entityManager.entitySpatialGridAdd(mon);
          this.emit('level-combat-system.show-money', mon);
        }
      }

      this._entityManager.removeLevelMobComponentRepresenting(deadMob);

      this.emit('level-combat-system.show-mob-death', deadMob);
    }
  }

  _applyMeleeDamage(attacker, attackImplement, targetEnt, entities) {
    let damage = this._calculateDamage(attackImplement, attacker, entities);

    const defense = this._calculateTargetDefense(targetEnt, entities);

    const origDamage = damage;

    const damageReduce = Math.floor(damage * defense);
    damage -= damageReduce;

    this.__log(`damage: ${origDamage} - ${damageReduce} = ${damage}`);

    const targetHpComp = targetEnt.getAll('StatisticComponent').find(StatisticComponent.isHitPoints);
    targetHpComp.currentValue -= damage;

    return targetHpComp;
  }

  _calculateDamage(attackImplement, attacker, entities) {
    //1. base damage
    const baseDamage = attackImplement.get('StatisticComponent', StatisticComponent.isDamage).currentValue;

    //2. base strength modifier
    let baseStrength = 0;
    const strength = attacker.get('StatisticComponent', StatisticComponent.isStrength);
    if (strength) {
      baseStrength = strength.currentValue;
    }

    //3. damage on all worn items if applicable
    const wearableDamage = EntityUtils.calculateStatTotalOnWornEntities(
      attacker,
      StatisticComponent.isDamage,
      entities
    );

    //4. strength on all worn items if applicable
    const wearableStrength = EntityUtils.calculateStatTotalOnWornEntities(
      attacker,
      StatisticComponent.isStrength,
      entities
    );

    //5. base damage stat effects
    //TODO: should we accumulate all statistic effects, or should we take the greatest value? Probably greatest.
    const damageEffects = attacker
      .getAll('StatisticEffectComponent', StatisticComponent.isDamage)
      .reduce((total, statEffect) => total + statEffect.value, 0);

    //6. base strength stat effects
    //TODO: should we accumulate all statistic effects, or should we take the greatest value? Probably greatest.
    const strengthEffects = attacker
      .getAll('StatisticEffectComponent', StatisticComponent.isStrength)
      .reduce((total, statEffect) => total + statEffect.value, 0);

    //7. total
    const totalDamage = baseDamage + wearableDamage + damageEffects;
    const totalStrengh = baseStrength + wearableStrength + strengthEffects; // divide by 2 (round up/down to integer)?

    return _.clamp(totalDamage + totalStrengh, 0, Number.MAX_SAFE_INTEGER);
  }

  _applyProjectileDamage(attackImplement, targetEnt, entities) {
    const stats = attackImplement.getAllKeyed('StatisticComponent', 'name');
    let damage = stats[Const.Statistic.Damage].currentValue;
    const defense = this._calculateTargetDefense(targetEnt, entities);

    const origDamage = damage;

    const damageReduce = Math.floor(damage * defense);
    damage -= damageReduce;

    this.__log(`damage: ${origDamage} - ${damageReduce} = ${damage}`);

    const targetHpComp = targetEnt.getAll('StatisticComponent').find(StatisticComponent.isHitPoints);
    targetHpComp.currentValue -= damage;

    return targetHpComp;
  }

  _calculateTargetDefense(targetEnt, entities) {
    let sum = 0;

    const entRefs = targetEnt.getAll('EntityReferenceComponent');

    for (const entRef of entRefs) {
      if (!_.includes(this.ArmorSlots, entRef.typeId)) {
        continue;
      }

      const armor = EntityFinders.findById(entities, entRef.entityId);

      if (!armor) {
        continue;
      }

      const defense = armor.getAll('StatisticComponent').find(StatisticComponent.isDefense);

      if (defense) {
        sum += defense.currentValue;
      }
    }

    return sum;
  }

  _processExpUp(entities, expIncrease) {
    const expIncreaseValue = expIncrease.value;
    const hero = this._entityManager.heroEntity;
    const heroExp = hero.get('ExperienceComponent');
    const currentLevel = Math.trunc(ExperienceComponent.pointsToLevel(heroExp.points));

    heroExp.points += expIncreaseValue;

    let newCurrentLevel = Math.trunc(ExperienceComponent.pointsToLevel(heroExp.points));

    if (newCurrentLevel > currentLevel) {
      while (newCurrentLevel > currentLevel) {
        console.log('level up!');

        this._applyLevelUpRewards(hero, entities);

        newCurrentLevel--;
      }

      this.emit('level-combat-system.level-up');
    } else {
      const nextLevelPoints = ExperienceComponent.levelToPoints(currentLevel + 1);
      const diff = nextLevelPoints - heroExp.points;

      console.log(diff + 'xp required for next level');
    }
  }

  _applyLevelUpRewards(hero, entities) {
    const heroCc = hero.get('CharacterClassComponent');
    const heroCcEnt = EntityFinders.findCharacterClasses(entities).find(
      c => c.get('CharacterClassComponent').typeId === heroCc.typeId
    );
    const rewards = heroCcEnt.getAll('LevelUpRewardComponent');
    const stats = hero.getAllKeyed('StatisticComponent', 'name');

    for (const reward of rewards) {
      switch (reward.statisticId) {
        case Const.Statistic.HitPoints:
          const endurance = stats[Const.Statistic.Endurance].maxValue;
          const hitPoints = stats[Const.Statistic.HitPoints];
          hitPoints.maxValue += reward.amount + endurance;
          hitPoints.currentValue = hitPoints.maxValue;

          break;

        case Const.Statistic.MagicPoints:
          const intelligence = stats[Const.Statistic.Intelligence].maxValue;
          const magicPoints = stats[Const.Statistic.MagicPoints];
          magicPoints.maxValue += reward.amount + intelligence;
          magicPoints.currentValue = magicPoints.maxValue;

          break;

        default:
          stats[reward.statisticId].maxValue += reward.amount;

          break;
      }
    }
  }

  canBeAttacked(entity) {
    const aiComp = entity.get('AiComponent');

    if (!aiComp) {
      throw new Error('AI component not found.');
    }

    switch (ObjectUtils.getTypeName(aiComp)) {
      case 'HeroComponent':
        return aiComp.state !== HeroComponent.State.KnockingBack;
      case 'AiRandomWandererComponent':
        return aiComp.state !== AiRandomWandererComponent.State.KnockingBack;
      case 'AiSeekerComponent':
        return aiComp.state !== AiSeekerComponent.State.KnockingBack;
      default:
        throw new Error('Unknown AI component: ' + aiComp.constructor.name);
    }
  }

  _unlockDoor(door) {
    if (door && door.lock) {
      door.lock.unlock();

      const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
      tileMap.visualLayers[1][door.position.y][door.position.x] = 1000;
    }
  }

  __log(msg) {
    this.emit('level-combat-system.add-log-message', msg);
  }
}
