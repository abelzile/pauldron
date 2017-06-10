import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as ColorUtils from '../utils/color-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import Line from '../line';
import System from '../system';
import Vector from '../vector';

export default class LevelMobRenderSystem extends System {
  constructor(pixiContainer, renderer, entityManager) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._centerScreen = new Vector(
      Math.floor(Const.ScreenWidth / Const.ScreenScale / 2),
      Math.floor(Const.ScreenHeight / Const.ScreenScale / 2)
    );

    this._funcs = Object.create(null);
    this._funcs[Const.AttackShape.Slash] = this._drawSlashAttack;
    this._funcs[Const.AttackShape.Charge] = this._drawChargeAttack;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    this._initHero(entities);
    this._initMobs(entities);
  }

  processEntities(gameTime, entities) {
    const hero = this._entityManager.heroEntity;
    //const mobSpatialGrid = this._entityManager.entitySpatialGrid;
    const mobs = EntityFinders.findMobs(this._entityManager.getEntitiesAdjacentToHero());
    const weapons = EntityFinders.findWeapons(entities);
    const armors = EntityFinders.findArmors(entities);
    const magicSpells = EntityFinders.findMagicSpells(entities);

    this._drawHero(weapons, armors, magicSpells);
    this._drawMobs(mobs, weapons, armors);
  }

  _initHero(entities) {
    const pixiContainer = this._pixiContainer;
    const hero = this._entityManager.heroEntity;
    const heroMcs = hero.getAllKeyed('AnimatedSpriteComponent', 'id');
    const heroSprites = hero.getAllKeyed('SpriteComponent', 'id');

    const shadow = heroSprites['shadow'].sprite;
    shadow.alpha = 0.1;

    pixiContainer.addChild(
      shadow,
      ..._.map(['body_standing', 'body_walking', 'hair', 'face_neutral', 'face_attack', 'face_knockback'], id => {
        const c = heroMcs[id];
        c.position.x = this._centerScreen.x;
        c.position.y = this._centerScreen.y;
        c.visible = _.includes(['body_standing', 'hair', 'face_neutral'], id);
        return c.animatedSprite;
      }),
      ..._.map(hero.getAll('GraphicsComponent'), c => c.graphics)
    );

    const invisibleSlots = [
      Const.InventorySlot.Backpack,
      Const.InventorySlot.Hotbar,
      Const.MagicSpellSlot.Hotbar,
      Const.MagicSpellSlot.SpellBook
    ];

    const entRefs = hero.getAll('EntityReferenceComponent');

    _.chain(entRefs)
      .map(c => EntityFinders.findById(entities, c.entityId))
      .compact()
      .sort(EntitySorters.sortInventory)
      .forEach(ent => {
        const isVisible = !_.includes(invisibleSlots, _.find(entRefs, c => c.entityId === ent.id).typeId);

        if (ent.has('MeleeAttackComponent')) {
          const g = ent.get('MeleeAttackComponent').graphics;
          pixiContainer.addChild(g);
          g.visible = isVisible;
        }

        if (ent.has('AnimatedSpriteComponent')) {
          const mc = ent.get('AnimatedSpriteComponent').animatedSprite;
          pixiContainer.addChild(mc);
          mc.visible = isVisible;
          mc.position.x = this._centerScreen.x;
          mc.position.y = this._centerScreen.y;
        }
      })
      .value();
  }

  _initMobs(entities) {
    const pixiContainer = this._pixiContainer;
    const mobs = EntityFinders.findMobs(entities);
    const weapons = EntityFinders.findWeapons(entities);
    const mobComps = [];
    const weaponComps = [];

    //TODO: think about putting entity pixi objs into containers (all mobs in a container, weapons in another, etc.)

    for (let i = 0; i < mobs.length; ++i) {
      const mob = mobs[i];

      ArrayUtils.append(
        mobComps,
        mob.getAll('SpriteComponent'),
        mob.getAll('GraphicsComponent'),
        mob.getAll('AnimatedSpriteComponent')
      );

      for (let j = 0; j < mobComps.length; ++j) {
        const comp = mobComps[j];

        if (comp.sprite) {
          pixiContainer.addChild(comp.sprite);

          if (comp.id === 'shadow') {
            comp.sprite.alpha = 0.1;
          }
        }

        comp.animatedSprite && pixiContainer.addChild(comp.animatedSprite);
        comp.graphics && pixiContainer.addChild(comp.graphics);
      }

      const hand1Slot = mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);

      if (!hand1Slot) {
        continue;
      }

      const weapon = EntityFinders.findById(weapons, hand1Slot.entityId);

      if (!weapon) {
        continue;
      }

      ArrayUtils.append(weaponComps, weapon.getAll('MeleeAttackComponent'), weapon.getAll('AnimatedSpriteComponent'));
    }

    for (let i = 0; i < weaponComps.length; ++i) {
      const comp = weaponComps[i];
      comp.animatedSprite && pixiContainer.addChild(comp.animatedSprite);
      comp.graphics && pixiContainer.addChild(comp.graphics);
    }

    this._drawMobs(mobs, weapons); //Draw all mobs initially because some may not be adjac and will be stuck on screen.
  }

  _drawHero(weapons, armors, magicSpells) {
    const hero = this._entityManager.heroEntity;
    const facing = hero.get('FacingComponent').facing;
    const state = hero.get('HeroComponent').state;
    const heroSprites = hero.getAllKeyed('SpriteComponent', 'id');

    const shadow = heroSprites['shadow'].sprite;
    shadow.position.x = this._centerScreen.x;
    shadow.position.y = this._centerScreen.y + 2;

    const visibleMcIds = [];

    switch (state) {
      case HeroComponent.State.Standing: {
        visibleMcIds.push('body_standing', 'hair', 'face_neutral');
        break;
      }
      case HeroComponent.State.Walking: {
        visibleMcIds.push('body_walking', 'hair', 'face_neutral');
        break;
      }
      case HeroComponent.State.KnockingBack: {
        visibleMcIds.push('body_standing', 'hair', 'face_knockback');
        break;
      }
      case HeroComponent.State.CastingSpell: {
        visibleMcIds.push('body_standing', 'hair', 'face_attack');
        break;
      }
      case HeroComponent.State.Attacking: {
        visibleMcIds.push('body_standing', 'hair', 'face_attack');
        break;
      }
    }

    this._showAndPlay(hero, facing, this._centerScreen.x, this._centerScreen.y, ...visibleMcIds);

    const bodyId = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId;

    if (bodyId) {
      const armor = EntityFinders.findById(armors, bodyId);
      if (armor) {
        this._drawArmor(hero, armor);
      }
    }

    const hand2Id = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId;

    if (hand2Id) {
      const shield = EntityFinders.findById(armors, hand2Id);
      if (shield) {
        this._drawShield(hero, shield);
      }
    }

    const weapon = EntityFinders.findById(
      weapons,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
    );

    if (weapon) {
      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeWeapon(hero, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedWeapon(hero, weapon);
      }
    }

    const magicSpell = EntityFinders.findById(
      magicSpells,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
    );

    if (magicSpell && magicSpell.has('MeleeAttackComponent')) {
      this._drawMeleeWeapon(hero, magicSpell);
    }
  }

  _drawArmor(hero, armor) {
    const facing = hero.get('FacingComponent').facing;

    const sprite = armor.get('AnimatedSpriteComponent');
    sprite.setFacing(facing, this._centerScreen.x);

    sprite.position.y = this._centerScreen.y;
  }

  _drawMobs(mobs, weapons, armors) {
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (let i = 0; i < mobs.length; ++i) {
      const mob = mobs[i];

      const ai = mob.get('AiComponent');
      const position = mob.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos).divide(
        Const.ScreenScale
      );

      const sprites = mob.getAllKeyed('SpriteComponent', 'id');
      if (sprites['shadow']) {
        const shadow = sprites['shadow'].sprite;
        shadow.position.x = screenPosition.x;
        shadow.position.y = screenPosition.y + 2;
      }

      this._showAndPlay(mob, mob.get('FacingComponent').facing, screenPosition.x, screenPosition.y, ai.state);
      this._drawHpBar(mob, topLeftPos);

      const hand1Slot = mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);

      if (!hand1Slot) {
        continue;
      }

      const weapon = EntityFinders.findById(weapons, hand1Slot.entityId);

      if (!weapon) {
        continue;
      }

      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeWeapon(mob, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedWeapon(mob, weapon);
      }
    }
  }

  _drawHpBar(mob, topLeftPos) {
    const g = mob.get('GraphicsComponent', c => c.id === 'hp_bar');

    if (!g) {
      return;
    }

    const hp = mob.get('StatisticComponent', c => c.name === Const.Statistic.HitPoints);

    if (!hp) {
      return;
    }

    const hpPercentRemaining = hp.currentValue / hp.maxValue;
    const positionedBoundingRect = EntityUtils.getPositionedBoundingRect(mob);
    const newPos = ScreenUtils.translateWorldPositionToScreenPosition(positionedBoundingRect, topLeftPos).divide(
      Const.ScreenScale
    );

    g.graphics
      .clear()
      .beginFill(Const.Color.Black)
      .drawRect(newPos.x, newPos.y - 5, positionedBoundingRect.width * Const.TilePixelSize, 2)
      .beginFill(Const.Color.HealthRed)
      .drawRect(newPos.x, newPos.y - 5, positionedBoundingRect.width * Const.TilePixelSize * hpPercentRemaining, 2)
      .endFill();
  }

  _drawMeleeWeapon(mob, weapon) {
    if (!weapon || !weapon.has('MeleeAttackComponent')) {
      return;
    }

    const ai = mob.get('AiComponent');
    const sprite = weapon.get('AnimatedSpriteComponent');

    if (ai.state === 'attacking') {
      const melee = weapon.get('MeleeWeaponComponent');
      melee &&
        this._funcs[melee.attackShape] &&
        this._funcs[melee.attackShape].call(this, this._entityManager.currentLevelEntity, weapon, mob);
    } else {
      if (sprite) {
        const position = mob.get('PositionComponent').position;
        const facing = mob.get('FacingComponent').facing;

        this._drawEquipmentNeutral(weapon, mob, position, sprite, facing);
      }
    }

    if (ai.state === 'castingSpell') {
      const spell = weapon.get('SelfMagicSpellComponent');
      spell &&
        this._funcs[spell.attackShape] &&
        this._funcs[spell.attackShape].call(this, this._entityManager.currentLevelEntity, weapon, mob);
    }
  }

  _drawShield(mob, shield) {
    if (!shield) {
      return;
    }

    const sprite = shield.get('AnimatedSpriteComponent');
    if (!sprite) {
      return;
    }
    this._drawEquipmentNeutral(
      shield,
      mob,
      mob.get('PositionComponent').position,
      sprite,
      mob.get('FacingComponent').facing
    );
  }

  _drawSlashAttack(currentLevel, weapon, mob) {
    if (!weapon) {
      return;
    }

    const attack = weapon.get('MeleeAttackComponent');

    if (attack.lines.length === 0) {
      return;
    }

    const lineCount = attack.lines.length;
    const topLeftPos = currentLevel.get('TileMapComponent').topLeftPos;
    const facing = mob.get('FacingComponent').facing;
    const weaponStats = weapon.getAllKeyed('StatisticComponent', 'name');
    const attackRange = weaponStats[Const.Statistic.Range].currentValue;
    const closestToOrigin = attackRange * 0.75;
    const incr = (closestToOrigin - attackRange) / lineCount;
    const pos = Vector.pnew();
    const pxLines = [];

    for (let i = 0, j = lineCount - 1; i < lineCount; ++i, --j) {
      const line = attack.lines[facing === Const.Direction.East ? j : i];
      const start = closestToOrigin - incr * i;
      const angle = Math.atan2(line.point2.y - line.point1.y, line.point2.x - line.point1.x);

      pos.x = line.point1.x + start * Math.cos(angle);
      pos.y = line.point1.y + start * Math.sin(angle);

      const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(pos, topLeftPos).divide(Const.ScreenScale);
      const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftPos).divide(
        Const.ScreenScale
      );

      pxLines.push(Line.pnew(startPxPos.x, startPxPos.y, endPxPos.x, endPxPos.y));
    }

    pos.pdispose();

    const melee = weapon.getOfFirstMatchingType('MeleeWeaponComponent', 'SelfMagicSpellComponent');
    const gradient = ColorUtils.getGradient(melee.attackGradientColor1, melee.attackGradientColor2, pxLines.length);
    const alphaIncr = 1 / pxLines.length;
    const graphics = attack.graphics.clear().lineStyle(0);

    for (let i = 0; i < pxLines.length; ++i) {
      const line1 = pxLines[i];
      const line2 = pxLines[i + 1];

      if (!line1 || !line2) {
        continue;
      }

      graphics
        .beginFill(gradient[i], 1 - alphaIncr * i)
        .drawPolygon([
          new Pixi.Point(line1.point1.x, line1.point1.y),
          new Pixi.Point(line1.point2.x, line1.point2.y),
          new Pixi.Point(line2.point2.x, line2.point2.y),
          new Pixi.Point(line2.point1.x, line2.point1.y)
        ])
        .endFill();
    }

    this._positionMeleeWeapon(weapon, pxLines);

    for (let i = 0; i < pxLines.length; ++i) {
      pxLines[i].pdispose();
    }
  }

  _positionMeleeWeapon(weapon, pxLines) {
    const sprite = weapon.get('AnimatedSpriteComponent');

    if (!sprite) {
      return;
    }

    const setting = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'attack');

    sprite.anchor.x = setting.anchor.x;
    sprite.anchor.y = setting.anchor.y;
    sprite.pivot.x = setting.pivot.x;
    sprite.pivot.y = setting.pivot.y;

    const pxLine = pxLines[0];
    sprite.position.x = pxLine.point2.x;
    sprite.position.y = pxLine.point2.y;

    // 45 degrees is used here because weapon sprites are drawn diagonally from bottom left to top right.
    if (sprite.scale.x === 1) {
      sprite.rotation = pxLine.angle + Const.RadiansOf45Degrees;
    } else {
      sprite.rotation = pxLine.angle - Const.RadiansOf45Degrees - Const.RadiansOf180Degrees;
    }
  }

  _drawChargeAttack(currentLevel, weapon, mob) {
    const attack = weapon.get('MeleeAttackComponent');

    if (attack.lines.length === 0) {
      return;
    }

    const topLeftPos = currentLevel.get('TileMapComponent').topLeftPos;
    const melee = weapon.getOfFirstMatchingType('MeleeWeaponComponent', 'SelfMagicSpellComponent');

    const p1 = attack.lines[0].point2;
    const p2 = attack.lines[attack.lines.length - 1].point2;
    const p3 = attack.attackMainLine.point1;

    const backLine = Line.pnew(p1.x, p1.y, p2.x, p2.y);
    const backEighth = backLine.lineLength / 8;
    const backLineAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    const attackEighth = attack.attackMainLine.lineLength / 8;
    const attackAngle = attack.attackMainAngle;

    const point1 = [];
    const point2 = [];
    const point3 = [];
    const point4 = [];

    point1.push(Vector.pnew(p1.x, p1.y));
    point1.push(Vector.pnew(p1.x + backEighth * Math.cos(backLineAngle), p1.y + backEighth * Math.sin(backLineAngle)));
    point1.push(
      Vector.pnew(p1.x + backEighth * 2 * Math.cos(backLineAngle), p1.y + backEighth * 2 * Math.sin(backLineAngle))
    );
    point1.push(
      Vector.pnew(p1.x + backEighth * 3 * Math.cos(backLineAngle), p1.y + backEighth * 3 * Math.sin(backLineAngle))
    );

    point2.push(
      Vector.pnew(p1.x + backEighth * 8 * Math.cos(backLineAngle), p1.y + backEighth * 8 * Math.sin(backLineAngle))
    );
    point2.push(
      Vector.pnew(p1.x + backEighth * 7 * Math.cos(backLineAngle), p1.y + backEighth * 7 * Math.sin(backLineAngle))
    );
    point2.push(
      Vector.pnew(p1.x + backEighth * 6 * Math.cos(backLineAngle), p1.y + backEighth * 6 * Math.sin(backLineAngle))
    );
    point2.push(
      Vector.pnew(p1.x + backEighth * 5 * Math.cos(backLineAngle), p1.y + backEighth * 5 * Math.sin(backLineAngle))
    );

    point3.push(
      Vector.pnew(p3.x + attackEighth * 8 * Math.cos(attackAngle), p3.y + attackEighth * 8 * Math.sin(attackAngle))
    );
    point3.push(
      Vector.pnew(p3.x + attackEighth * 6 * Math.cos(attackAngle), p3.y + attackEighth * 6 * Math.sin(attackAngle))
    );
    point3.push(
      Vector.pnew(p3.x + attackEighth * 4 * Math.cos(attackAngle), p3.y + attackEighth * 4 * Math.sin(attackAngle))
    );
    point3.push(
      Vector.pnew(p3.x + attackEighth * 2 * Math.cos(attackAngle), p3.y + attackEighth * 2 * Math.sin(attackAngle))
    );

    point4.push(
      Vector.pnew(p3.x + attackEighth * 5 * Math.cos(attackAngle), p3.y + attackEighth * 5 * Math.sin(attackAngle))
    );
    point4.push(
      Vector.pnew(p3.x + attackEighth * 3 * Math.cos(attackAngle), p3.y + attackEighth * 3 * Math.sin(attackAngle))
    );
    point4.push(
      Vector.pnew(p3.x + attackEighth * -8 * Math.cos(attackAngle), p3.y + attackEighth * -8 * Math.sin(attackAngle))
    );
    point4.push(
      Vector.pnew(p3.x + attackEighth * -4 * Math.cos(attackAngle), p3.y + attackEighth * -4 * Math.sin(attackAngle))
    );

    const gradient = ColorUtils.getGradient(melee.attackGradientColor1, melee.attackGradientColor2, 5);
    const g = attack.graphics.clear();

    for (let i = 0; i < 4; ++i) {
      const lineColor = gradient[i];
      const fillColor = gradient[i + 1];

      const tempP1 = ScreenUtils.translateWorldPositionToScreenPosition(point1[i], topLeftPos);
      const tempP2 = ScreenUtils.translateWorldPositionToScreenPosition(point2[i], topLeftPos);
      const tempP3 = ScreenUtils.translateWorldPositionToScreenPosition(point3[i], topLeftPos);
      const tempP4 = ScreenUtils.translateWorldPositionToScreenPosition(point4[i], topLeftPos);

      g
        .lineStyle(1, lineColor)
        .beginFill(fillColor, 1)
        .drawPolygon([
          new Pixi.Point(tempP1.x / Const.ScreenScale, tempP1.y / Const.ScreenScale),
          new Pixi.Point(tempP4.x / Const.ScreenScale, tempP4.y / Const.ScreenScale),
          new Pixi.Point(tempP2.x / Const.ScreenScale, tempP2.y / Const.ScreenScale),
          new Pixi.Point(tempP3.x / Const.ScreenScale, tempP3.y / Const.ScreenScale)
        ])
        .endFill();
    }

    backLine.pdispose();

    for (let i = 0; i < point1.length; ++i) {
      point1[i].pdispose();
    }

    for (let i = 0; i < point2.length; ++i) {
      point2[i].pdispose();
    }

    for (let i = 0; i < point3.length; ++i) {
      point3[i].pdispose();
    }

    for (let i = 0; i < point4.length; ++i) {
      point4[i].pdispose();
    }
  }

  _drawRangedWeapon(mob, weapon) {
    if (!weapon || !weapon.has('RangedAttackComponent')) {
      return;
    }

    const state = mob.get('AiComponent').state;
    const facing = mob.get('FacingComponent').facing;
    const sprite = weapon.get('AnimatedSpriteComponent');

    if (state === 'attacking') {
      const position = EntityUtils.getPositionedBoundingRect(mob).getCenter();
      const boundingRect = mob.get('BoundingRectangleComponent').rectangle;
      const angle = weapon.get('RangedAttackComponent').angle;
      const distAdj = Math.max(Math.ceil(boundingRect.width), Math.ceil(boundingRect.height));

      const weaponPos = Vector.pnew(
        position.x + boundingRect.width / 2 * distAdj * Math.cos(angle),
        position.y + boundingRect.height / 2 * distAdj * Math.sin(angle)
      );
      const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
      const weaponPxPos = ScreenUtils.translateWorldPositionToScreenPosition(weaponPos, topLeftPos).divide(
        Const.ScreenScale
      );

      sprite.scale.x = facing === Const.Direction.East ? 1 : -1;
      if (sprite.scale.x === 1) {
        sprite.rotation = angle - Const.RadiansPiOver4;
      } else {
        sprite.rotation = angle + Const.RadiansPiOver4 + Const.RadiansPi;
      }
      sprite.position.x = weaponPxPos.x;
      sprite.position.y = weaponPxPos.y;

      weaponPos.pdispose();
    } else {
      const position = mob.get('PositionComponent').position;

      this._drawEquipmentNeutral(weapon, mob, position, sprite, facing);
    }
  }

  _drawEquipmentNeutral(weapon, mob, position, sprite, facing) {
    const setting = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'neutral');

    if (!setting) {
      return;
    }

    let x = 0;
    let y = 0;

    if (mob.has('HeroComponent')) {
      x = this._centerScreen.x;
      y = this._centerScreen.y;
    } else {
      const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
      const newPos = ScreenUtils.translateWorldPositionToScreenPosition(position, topLeftPos).divide(Const.ScreenScale);

      x = newPos.x;
      y = newPos.y;
    }

    sprite.anchor.x = setting.anchor.x;
    sprite.anchor.y = setting.anchor.y;
    sprite.pivot.x = setting.pivot.x;
    sprite.pivot.y = setting.pivot.y;

    let diffX = 0;
    const mobAnims = mob.getAll('AnimatedSpriteComponent');
    if (mobAnims && mobAnims.length > 0) {
      const weapAnims = weapon.getAll('AnimatedSpriteComponent');
      if (weapAnims && weapAnims.length > 0) {
        diffX = mobAnims[0].width - weapAnims[0].width;
      }
    }

    sprite.setFacing(facing, x, setting.positionOffset.x, setting.rotation, diffX);

    sprite.position.y = y + setting.positionOffset.y;
  }

  //TODO: put into AnimatedSpriteComponentCollection
  _showAndPlay(mob, facing, x, y, ...mcIds) {
    const anims = mob.getAll('AnimatedSpriteComponent');

    for (let i = 0; i < anims.length; ++i) {
      const anim = anims[i];

      if (_.includes(mcIds, anim.id)) {
        anim.setFacing(facing, x);
        anim.position.y = y;

        if (!anim.visible) {
          anim.visible = true;

          if (anim.animatedSprite.totalFrames === 0) {
            anim.animatedSprite.gotoAndStop(0);
          } else {
            anim.animatedSprite.gotoAndPlay(0);
          }
        }
      } else {
        anim.visible = false;
        anim.animatedSprite.stop();
      }
    }
  }
}
