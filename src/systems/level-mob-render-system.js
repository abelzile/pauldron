import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as ColorUtils from '../utils/color-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import * as HeroComponent from '../components/hero-component';
import * as Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';
import Line from '../line';
import System from '../system';
import Vector from '../vector';
import Rectangle from '../rectangle';

export default class LevelMobRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

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
    const mobSpatialGrid = this._entityManager.entitySpatialGrid;
    const mobs = EntityFinders.findMobs(mobSpatialGrid.getAdjacentEntities(hero));
    const weapons = EntityFinders.findWeapons(entities);
    const armors = EntityFinders.findArmors(entities);
    const magicSpells = EntityFinders.findMagicSpells(entities);

    this._drawHero(weapons, armors, magicSpells);
    this._drawMobs(mobs, weapons, armors);

  }

  _initHero(entities) {

    const pixiContainer = this._pixiContainer;

    const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
    const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

    const hero = this._entityManager.heroEntity;
    const heroMcs = hero.getAllKeyed('AnimatedSpriteComponent', 'id');
    const heroSprites = hero.getAllKeyed('SpriteComponent', 'id');

    const shadow = heroSprites['shadow'].sprite;
    shadow.alpha = .1;
    pixiContainer.addChild(shadow);

    const all = [ 'body_standing', 'body_walking', 'hair', 'face_neutral', 'face_attack', 'face_knockback' ]; // order important for z-index

    _.forEach(all, id => {

      const c = heroMcs[id];
      this._pixiContainer.addChild(c.animatedSprite);
      c.position.x = centerScreenX;
      c.position.y = centerScreenY;
      c.visible = false;

    });

    _.forEach(['body_standing', 'hair', 'face_neutral'], id => { heroMcs[id].visible = true; });

    _.forEach(hero.getAll('GraphicsComponent'), c => { this._pixiContainer.addChild(c.graphics);  });

    const invisibleSlots = [
      Const.InventorySlot.Backpack,
      Const.InventorySlot.Hotbar,
      Const.MagicSpellSlot.Hotbar,
      Const.MagicSpellSlot.SpellBook,
    ];

    const entRefs = hero.getAll('EntityReferenceComponent');

    let ents = _.map(entRefs, c => EntityFinders.findById(entities, c.entityId));
    ents = _.compact(ents);
    ents = ents.sort(EntitySorters.sortInventory);

    for (let i = 0; i < ents.length; ++i) {

      const ent = ents[i];

      const isVisible = !_.includes(invisibleSlots, _.find(entRefs, c => c.entityId === ent.id).typeId);

      if (ent.has('AnimatedSpriteComponent')) {

        const mc = this._pixiContainer.addChild(ent.get('AnimatedSpriteComponent').animatedSprite);
        mc.visible = isVisible;
        mc.position.x = centerScreenX;
        mc.position.y = centerScreenY;

      }

      if (ent.has('MeleeAttackComponent')) {

        const g = this._pixiContainer.addChild(ent.get('MeleeAttackComponent').graphics);
        g.visible = isVisible;

      }

    }

  }

  _initMobs(entities) {

    const mobs = EntityFinders.findMobs(entities);
    const weapons = EntityFinders.findWeapons(entities);

    const allMobComps = [];

    const pixiContainer = this._pixiContainer;

    for (let i = 0; i < mobs.length; ++i) {

      const mob = mobs[i];

      ArrayUtils.append(
        allMobComps,
        mob.getAll('SpriteComponent'),
        mob.getAll('GraphicsComponent'),
        mob.getAll('AnimatedSpriteComponent')
      );

      for (let j = 0; j < allMobComps.length; ++j) {

        const comp = allMobComps[j];

        if (comp.sprite) {

          pixiContainer.addChild(comp.sprite);

          if (comp.id === 'shadow') {
            comp.sprite.alpha = .1;
          }

        }

        comp.animatedSprite && pixiContainer.addChild(comp.animatedSprite);
        comp.graphics && pixiContainer.addChild(comp.graphics);

      }

      const weapon = EntityFinders.findById(
        weapons,
        mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
      );

      if (!weapon) {
        continue;
      }

      const allWeaponComps = [];

      ArrayUtils.append(
        allWeaponComps,
        weapon.getAll('AnimatedSpriteComponent'),
        weapon.getAll('MeleeAttackComponent')
      );

      for (let j = 0; j < allWeaponComps.length; ++j) {

        const comp = allWeaponComps[j];
        comp.animatedSprite && pixiContainer.addChild(comp.animatedSprite);
        comp.graphics && pixiContainer.addChild(comp.graphics);

      }

    }

    this._drawMobs(mobs, weapons); //Draw all mobs initially because some may not be adjac and will be stuck on screen.

  }

  _drawHero(weapons, armors, magicSpells) {

    const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
    const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

    const hero = this._entityManager.heroEntity;
    const facing = hero.get('FacingComponent').facing;
    const state = hero.get('HeroComponent').state;
    const heroSprites = hero.getAllKeyed('SpriteComponent', 'id');

    const shadow = heroSprites['shadow'].sprite;
    shadow.position.x = centerScreenX;
    shadow.position.y = centerScreenY + 2;

    switch (state) {

      case HeroComponent.State.Standing: {

        this._showAndPlay(hero, facing, centerScreenX, centerScreenY, 'body_standing', 'hair', 'face_neutral');

        break;

      }
      case HeroComponent.State.Walking: {

        this._showAndPlay(hero, facing, centerScreenX, centerScreenY, 'body_walking', 'hair', 'face_neutral');

        break;

      }
      case HeroComponent.State.KnockingBack: {

        this._showAndPlay(hero, facing, centerScreenX, centerScreenY, 'body_standing', 'hair', 'face_knockback');

        break;

      }
      case HeroComponent.State.CastingSpell: {

        this._showAndPlay(hero, facing, centerScreenX, centerScreenY, 'body_standing', 'hair', 'face_attack');

        break;

      }
      case HeroComponent.State.Attacking: {

        this._showAndPlay(hero, facing, centerScreenX, centerScreenY, 'body_standing', 'hair', 'face_attack');

        break;

      }
      default: {

        break;

      }

    }

    const bodyId = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId;

    if (bodyId) {

      const armor = EntityFinders.findById(armors, bodyId);

      if (armor) {
        armor.get('AnimatedSpriteComponent').setFacing(facing, centerScreenX);
      }

    }

    const hand2Id = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId;

    if (hand2Id) {

      const shield = EntityFinders.findById(armors, hand2Id);

      if (shield) {
        shield.get('AnimatedSpriteComponent').setFacing(facing, centerScreenX);
      }

    }

    const weapon = EntityFinders.findById(
      weapons,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
    );

    if (weapon) {
      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeAttack(hero, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedAttack(hero, weapon);
      }
    }

    const magicSpell = EntityFinders.findById(
      magicSpells,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId
    );

    if (magicSpell && magicSpell.has('MeleeAttackComponent')) {
      this._drawMeleeAttack(hero, magicSpell);
    }

  }

  _drawMobs(mobs, weapons, armors) {

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (let i = 0; i < mobs.length; ++i) {

      const mob = mobs[i];

      const ai = mob.get('AiComponent');
      const position = mob.get('PositionComponent');
      const screenPosition = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos);

      const sprites = mob.getAllKeyed('SpriteComponent', 'id');
      if (sprites['shadow']) {
        const shadow = sprites['shadow'].sprite;
        shadow.position.x = screenPosition.x / Const.ScreenScale;
        shadow.position.y = screenPosition.y / Const.ScreenScale + 2;
      }

      this._showAndPlay(
        mob,
        mob.get('FacingComponent').facing,
        screenPosition.x / Const.ScreenScale,
        screenPosition.y / Const.ScreenScale,
        ai.state
      );

      this._drawHpBar(mob, topLeftPos);

      const weapon = EntityFinders.findById(
        weapons,
        mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId
      );

      if (!weapon) {
        continue;
      }

      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeAttack(mob, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedAttack(mob, weapon);
      }

    }

  }

  _drawHpBar(mob, topLeftPos) {

    const hp = mob.get('StatisticComponent', c => c.name === Const.Statistic.HitPoints);
    const hpPercentRemaining = hp.currentValue / hp.maxValue;
    const mobPos = mob.get('PositionComponent').position;
    const boundingRect = mob.get('BoundingRectangleComponent').rectangle;
    const offsetRect = Rectangle.offsetBy(boundingRect, mobPos);
    const newPos = ScreenUtils.translateWorldPositionToScreenPosition(offsetRect, topLeftPos);

    mob
      .get('GraphicsComponent', c => c.id === 'hp_bar')
      .graphics
      .clear()
      .beginFill(Const.Color.HealthRed)
      .drawRect(
        newPos.x / Const.ScreenScale,
        (newPos.y - 2) / Const.ScreenScale,
        (offsetRect.width * Const.TilePixelSize) * hpPercentRemaining,
        2
      )
      .endFill();


  }

  _drawMeleeAttack(mob, weapon) {

    if (!weapon || !weapon.has('MeleeAttackComponent')) { return; }

    const ai = mob.get('AiComponent');
    const weaponMc = weapon.get('AnimatedSpriteComponent');

    if (ai.state === 'attacking') {

      if (weaponMc) {
        weaponMc.visible = false;
      }

      const melee = weapon.get('MeleeWeaponComponent');
      melee && this._funcs[melee.attackShape] && this._funcs[melee.attackShape].call(
        this,
        this._entityManager.currentLevelEntity,
        weapon,
        mob
      );

    } else {

      if (weaponMc) {

        const mcSettings = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'neutral');

        if (mcSettings) {

          weaponMc.visible = true;

          const position = mob.get('PositionComponent');

          if (mob.has('HeroComponent')) {

            const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
            const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

            weaponMc.setFacing(
              mob.get('FacingComponent').facing,
              centerScreenX,
              mcSettings.positionOffset.x,
              mcSettings.rotation
            );
            weaponMc.position.y = centerScreenY + mcSettings.positionOffset.y;

          } else {

            const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
            const topLeftPos = tileMap.topLeftPos;
            const newPos = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos);

            weaponMc.setFacing(
              mob.get('FacingComponent').facing,
              newPos.x / Const.ScreenScale,
              mcSettings.positionOffset.x,
              mcSettings.rotation
            );
            weaponMc.position.y = (newPos.y / Const.ScreenScale) + mcSettings.positionOffset.y;

          }

        }

      }

    }

    if (ai.state === 'castingSpell') {

      const melee1 = weapon.get('SelfMagicSpellComponent');
      melee1 && this._funcs[melee1.attackShape] && this._funcs[melee1.attackShape].call(
        this,
        this._entityManager.currentLevelEntity,
        weapon,
        mob
      );

    }

  }

  _drawSlashAttack(currentLevel, weapon, mob) {

    const attack = weapon.get('MeleeAttackComponent');

    if (attack.lines.length === 0) { return; }

    const lineCount = attack.lines.length;
    const tileMap = currentLevel.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;
    const facing = mob.get('FacingComponent').facing;
    const stats = weapon.getAllKeyed('StatisticComponent', 'name');
    const attackLen = stats[Const.Statistic.Range].currentValue;
    const leastLenFromOrigin = .5; //arbitrary. .5 (half a tile) seems to look good. closer and graphical glitches can occur.
    const mostLenFromOrigin = _.clamp(attackLen / 1.4, leastLenFromOrigin, attackLen); // 1.4 is arbitrary and should maybe be determined from attackLen.
    const incr = (leastLenFromOrigin - mostLenFromOrigin) / lineCount;

    const pos = Vector.pnew();
    const pxLines = [];

    for (let i = 0, j = lineCount - 1; i < lineCount; ++i, --j) {

      const line = attack.lines[facing === Const.Direction.East ? j : i];
      const start = leastLenFromOrigin - (incr * i);
      const rot = Math.atan2(line.point2.y - line.point1.y, line.point2.x - line.point1.x);

      pos.x = line.point1.x + start * Math.cos(rot);
      pos.y = line.point1.y + start * Math.sin(rot);

      const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(pos, topLeftPos);
      const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftPos);

      pxLines.push(Line.pnew(startPxPos.x, startPxPos.y, endPxPos.x, endPxPos.y));

    }

    pos.pdispose();

    const melee = weapon.getFirst('MeleeWeaponComponent', 'SelfMagicSpellComponent');
    const gradient = ColorUtils.getGradient(melee.gradientColor1, melee.gradientColor2, pxLines.length);
    const alphas = [];
    const alphaIncr = 1 / pxLines.length;

    for (let i = 1; i <= pxLines.length; ++i) {
      alphas.push(1 - alphaIncr * i);
    }

    const g = attack.graphics.clear();

    for (let i = 0; i < pxLines.length; ++i) {

      const line1 = pxLines[i];
      const line2 = pxLines[i + 1];

      if (!line1 || !line2) { continue; }

      const color = gradient[i];

      g.lineStyle(0, color)
        .beginFill(color, alphas[i])
        .drawPolygon(
          [
            new Pixi.Point(line1.point1.x / Const.ScreenScale, line1.point1.y / Const.ScreenScale),
            new Pixi.Point(line1.point2.x / Const.ScreenScale, line1.point2.y / Const.ScreenScale),
            new Pixi.Point(line2.point2.x / Const.ScreenScale, line2.point2.y / Const.ScreenScale),
            new Pixi.Point(line2.point1.x / Const.ScreenScale, line2.point1.y / Const.ScreenScale)
          ]
        )
        .endFill();

    }

    for (let i = 0; i < pxLines.length; ++i) {
      pxLines[i].pdispose();
    }

  }

  _drawChargeAttack(currentLevel, weapon, mob) {

    const attack = weapon.get('MeleeAttackComponent');

    if (attack.lines.length === 0) { return; }

    const topLeftPos = currentLevel.get('TileMapComponent').topLeftPos;
    const melee = weapon.getFirst('MeleeWeaponComponent', 'SelfMagicSpellComponent');

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
    point1.push(Vector.pnew(p1.x + (backEighth) * Math.cos(backLineAngle), p1.y + (backEighth) * Math.sin(backLineAngle)));
    point1.push(Vector.pnew(p1.x + (backEighth * 2) * Math.cos(backLineAngle), p1.y + (backEighth * 2) * Math.sin(backLineAngle)));
    point1.push(Vector.pnew(p1.x + (backEighth * 3) * Math.cos(backLineAngle), p1.y + (backEighth * 3) * Math.sin(backLineAngle)));

    point2.push(Vector.pnew(p1.x + (backEighth * 8) * Math.cos(backLineAngle), p1.y + (backEighth * 8) * Math.sin(backLineAngle)));
    point2.push(Vector.pnew(p1.x + (backEighth * 7) * Math.cos(backLineAngle), p1.y + (backEighth * 7) * Math.sin(backLineAngle)));
    point2.push(Vector.pnew(p1.x + (backEighth * 6) * Math.cos(backLineAngle), p1.y + (backEighth * 6) * Math.sin(backLineAngle)));
    point2.push(Vector.pnew(p1.x + (backEighth * 5) * Math.cos(backLineAngle), p1.y + (backEighth * 5) * Math.sin(backLineAngle)));

    point3.push(Vector.pnew(p3.x + (attackEighth * 8) * Math.cos(attackAngle), p3.y + (attackEighth * 8) * Math.sin(attackAngle)));
    point3.push(Vector.pnew(p3.x + (attackEighth * 6) * Math.cos(attackAngle), p3.y + (attackEighth * 6) * Math.sin(attackAngle)));
    point3.push(Vector.pnew(p3.x + (attackEighth * 4) * Math.cos(attackAngle), p3.y + (attackEighth * 4) * Math.sin(attackAngle)));
    point3.push(Vector.pnew(p3.x + (attackEighth * 2) * Math.cos(attackAngle), p3.y + (attackEighth * 2) * Math.sin(attackAngle)));

    point4.push(Vector.pnew(p3.x + (attackEighth * 5) * Math.cos(attackAngle), p3.y + (attackEighth * 5) * Math.sin(attackAngle)));
    point4.push(Vector.pnew(p3.x + (attackEighth * 3) * Math.cos(attackAngle), p3.y + (attackEighth * 3) * Math.sin(attackAngle)));
    point4.push(Vector.pnew(p3.x + (attackEighth * -8) * Math.cos(attackAngle), p3.y + (attackEighth * -8) * Math.sin(attackAngle)));
    point4.push(Vector.pnew(p3.x + (attackEighth * -4) * Math.cos(attackAngle), p3.y + (attackEighth * -4) * Math.sin(attackAngle)));

    const gradient = ColorUtils.getGradient(melee.gradientColor1, melee.gradientColor2, 5);
    const g = attack.graphics.clear();

    for (let i = 0; i < 4; ++i) {

      const lineColor = gradient[i];
      const fillColor = gradient[i + 1];

      const tempP1 = ScreenUtils.translateWorldPositionToScreenPosition(point1[i], topLeftPos);
      const tempP2 = ScreenUtils.translateWorldPositionToScreenPosition(point2[i], topLeftPos);
      const tempP3 = ScreenUtils.translateWorldPositionToScreenPosition(point3[i], topLeftPos);
      const tempP4 = ScreenUtils.translateWorldPositionToScreenPosition(point4[i], topLeftPos);

      g.lineStyle(1, lineColor)
        .beginFill(fillColor, 1)
        .drawPolygon(
          [
            new Pixi.Point(tempP1.x / Const.ScreenScale, tempP1.y / Const.ScreenScale),
            new Pixi.Point(tempP4.x / Const.ScreenScale, tempP4.y / Const.ScreenScale),
            new Pixi.Point(tempP2.x / Const.ScreenScale, tempP2.y / Const.ScreenScale),
            new Pixi.Point(tempP3.x / Const.ScreenScale, tempP3.y / Const.ScreenScale)
          ]
        )
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

  _drawRangedAttack(mob, weapon) {

    if (!weapon || !weapon.has('RangedAttackComponent')) { return; }

    const state = mob.get('AiComponent').state;
    const facing = mob.get('FacingComponent').facing;
    const weaponMc = weapon.get('AnimatedSpriteComponent');

    if (state === 'attacking') {

      const mobPos = mob.get('PositionComponent');
      const newMobPos = Vector.pnew(mobPos.x + .5, mobPos.y + .5);
      const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
      const topLeftPos = tileMap.topLeftPos;
      const angle = weapon.get('RangedAttackComponent').angle;
      const weaponPos = Vector.pnew(newMobPos.x + .5 * Math.cos(angle), newMobPos.y + .5 * Math.sin(angle));
      const weaponPxPos = ScreenUtils.translateWorldPositionToScreenPosition(weaponPos, topLeftPos)
        .divide(Const.ScreenScale);

      weaponMc.scale.x = (facing === Const.Direction.East) ? 1 : -1;
      weaponMc.position.x = weaponPxPos.x;
      weaponMc.position.y = weaponPxPos.y;
      if (weaponMc.scale.x === 1) {
        weaponMc.rotation = angle - Const.RadiansPiOver4;
      } else {
        weaponMc.rotation = angle + Const.RadiansPiOver4 + Const.RadiansPi;
      }

      newMobPos.pdispose();
      weaponPos.pdispose();

    } else {

      if (mob.has('HeroComponent')) {

        const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
        const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

        const mcSettings = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'neutral');
        weaponMc.setFacing(facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
        weaponMc.position.y = centerScreenY + mcSettings.positionOffset.y;

      } else {

        const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
        const topLeftPos = tileMap.topLeftPos;
        const position = mob.get('PositionComponent');
        const newPos = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftPos);
        const mcSettings = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'neutral');

        weaponMc.setFacing(facing, newPos.x / Const.ScreenScale, mcSettings.positionOffset.x, mcSettings.rotation);
        weaponMc.position.y = (newPos.y / Const.ScreenScale) + mcSettings.positionOffset.y;

      }

    }

  }

  //TODO: put into AnimatedSpriteComponentCollection
  _showAndPlay(mob, facing, x, y, ...mcIds) {

    const mcs = mob.getAllKeyed('AnimatedSpriteComponent', 'id');

    _.forOwn(mcs, (val, key) => {

      if (_.includes(mcIds, key)) {

        val.setFacing(facing, x);
        val.position.y = y;

        if (!val.visible) {

          val.visible = true;

          if (val.animatedSprite.totalFrames === 0) {
            val.animatedSprite.gotoAndStop(0);
          } else {
            val.animatedSprite.gotoAndPlay(0);
          }

        }

      } else {

        val.visible = false;
        val.animatedSprite.stop();

      }

    });

  }

}
