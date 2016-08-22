import * as ArrayUtils from '../utils/array-utils';
import * as ColorUtils from '../utils/color-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import * as HeroComponent from '../components/hero-component';
import * as ScreenUtils from '../utils/screen-utils';
import _ from 'lodash';
import Line from '../line';
import Pixi from 'pixi.js';
import PixiExtraFilters from 'pixi-extra-filters';
import Point from '../point';
import System from '../system';


export default class LevelMobRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._initHero(entities);

    this._initMobs(entities);

  }

  _initHero(entities) {

    const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
    const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

    const hero = this._entityManager.heroEntity;
    const heroMcs = hero.getAllKeyed('MovieClipComponent', 'id');

    const all = [ 'body_standing', 'body_walking', 'hair', 'face_neutral', 'face_attack', 'face_knockback' ]; // order important for z-index

    _.forEach(all, id => {

      const c = heroMcs[id];
      this._pixiContainer.addChild(c.movieClip);
      c.position.x = centerScreenX;
      c.position.y = centerScreenY;
      c.visible = false;

    });

    _.forEach(['body_standing', 'hair', 'face_neutral'], id => { heroMcs[id].visible = true; });

    const invisibleSlots = [
      Const.InventorySlot.Backpack,
      Const.InventorySlot.Hotbar,
      Const.MagicSpellSlot.Hotbar,
      Const.MagicSpellSlot.Memory,
      Const.MagicSpellSlot.SpellBook,
    ];

    const entRefComps = hero.getAll('EntityReferenceComponent');

    _.chain(entRefComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .compact()
     .tap(ents => { ents.sort(EntitySorters.sortInventory); })
     .forEach(ent => {

       const isVisible = !_.includes(invisibleSlots, _.find(entRefComps, c => c.entityId === ent.id).typeId);

       if (ent.has('MovieClipComponent')) {

         const mc = this._pixiContainer.addChild(ent.get('MovieClipComponent').movieClip);
         mc.visible = isVisible;
         mc.position.x = centerScreenX;
         mc.position.y = centerScreenY;

       }

       if (ent.has('MeleeAttackComponent')) {

         const g = this._pixiContainer.addChild(ent.get('MeleeAttackComponent').graphics);
         g.visible = isVisible;

         const melee = ent.get('MeleeWeaponComponent');

         g.filters = [this._buildGlowFilter(melee)];

       }

     })
     .value();
  }

  _initMobs(entities) {

    const mobs = EntityFinders.findMobs(entities);
    const weapons = EntityFinders.findWeapons(entities);

    _.chain([].concat(mobs, weapons))
     .reduce((result, thing) => {

       if (thing.has('MovieClipComponent')) {
         Array.prototype.push.apply(result, _.reduce(thing.getAll('MovieClipComponent'), (res, mc) => res.concat(mc.movieClip), []));
       }

       if (thing.has('MeleeAttackComponent')) {

         const melee = thing.get('MeleeWeaponComponent');

         const g = thing.get('MeleeAttackComponent').graphics;
         g.filters = [this._buildGlowFilter(melee)];

         result.push(g);

       }

       return result;

     }, [])
     .forEach(o => { this._pixiContainer.addChild(o); })
     .value();

    this._drawMobs(mobs, weapons); //Draw all mobs initially because some may not be adjac and will be stuck on screen.

  }

  processEntities(gameTime, entities) {

    const hero = this._entityManager.heroEntity;
    const mobSpatialGrid = this._entityManager.entitySpatialGrid;
    const mobs = EntityFinders.findMobs(mobSpatialGrid.getAdjacentEntities(hero));
    const weapons = EntityFinders.findWeapons(entities);
    const armors = EntityFinders.findArmors(entities);

    this._drawHero(weapons, armors);

    this._drawMobs(mobs, weapons, armors);

  }

  _drawHero(weapons, armors) {

    const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
    const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

    const hero = this._entityManager.heroEntity;
    const facing = hero.get('FacingComponent').facing;
    const state = hero.get('HeroComponent').state;

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
        armor.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

    }

    const hand2Id = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId;

    if (hand2Id) {

      const shield = EntityFinders.findById(armors, hand2Id);

      if (shield) {
        shield.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

    }

    const weapon = EntityFinders.findById(weapons, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    if (weapon) {
      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeAttack(hero, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedAttack(hero, weapon);
      }
    }

  }

  _drawMobs(mobs, weapons, armors) {

    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftSprite = tileMap.spriteLayers[0][0][0];

    for (const mob of mobs) {

      const ai = mob.get('AiComponent');
      const position = mob.get('PositionComponent');
      const pos = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftSprite.position);

      this._showAndPlay(mob, mob.get('FacingComponent').facing, pos.x / Const.ScreenScale, pos.y / Const.ScreenScale, ai.state);

      const weapon = EntityFinders.findById(weapons, mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      if (!weapon) { continue; }

      if (weapon.has('MeleeAttackComponent')) {
        this._drawMeleeAttack(mob, weapon);
      } else if (weapon.has('RangedAttackComponent')) {
        this._drawRangedAttack(mob, weapon);
      }

    }

  }

  _drawMeleeAttack(mob, weapon) {

    if (!weapon || !weapon.has('MeleeAttackComponent')) { return; }

    const ai = mob.get('AiComponent');
    const weaponMc = weapon.get('MovieClipComponent');

    if (ai.state === 'attacking') {

      if (weaponMc) {
        weaponMc.visible = false;
      }

      const pxLines = [];

      this._calculateMeleeAttackEffects(weapon, mob, pxLines);
      this._drawMeleeAttackEffects(weapon, pxLines);

    } else {

      if (weaponMc) {

        weaponMc.visible = true;

        const position = mob.get('PositionComponent');
        const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');

        if (mob.has('HeroComponent')) {

          const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
          const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

          weaponMc.setFacing(mob.get('FacingComponent').facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
          weaponMc.position.y = centerScreenY + mcSettings.positionOffset.y;

        } else {

          const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
          const topLeftSprite = tileMap.spriteLayers[0][0][0];
          const newPos = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftSprite.position);

          weaponMc.setFacing(mob.get('FacingComponent').facing, newPos.x / Const.ScreenScale, mcSettings.positionOffset.x, mcSettings.rotation);
          weaponMc.position.y = (newPos.y / Const.ScreenScale) + mcSettings.positionOffset.y;

        }

      }

    }

    /*let startPos;
     let endPos;

     if (facing === Const.Direction.West) {
     startPos = _.first(attack.lines).point1;
     endPos = _.first(attack.lines).point2;
     } else {
     startPos = _.last(attack.lines).point1;
     endPos = _.last(attack.lines).point2;

     const weaponRot = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
     const weaponPos = new Point(startPos.x + leastLenFromOrigin * Math.cos(weaponRot),
     startPos.y + leastLenFromOrigin * Math.sin(weaponRot));
     const weaponPx = this._translateWorldToScreen(weaponPos, topLeftSprite.position);

     const mc = weaponMc;
     mc.scale.x = (facing === Const.Direction.East) ? 1 : -1;
     mc.position.x = weaponPx.x / scale;
     mc.position.y = weaponPx.y / scale;
     if (mc.scale.x === 1) {
     mc.rotation = weaponRot + Const.RadiansPiOver4;
     } else {
     mc.rotation = weaponRot - Const.RadiansPiOver4 + Const.RadiansPi;
     }

     const heroPosComp = hero.get('PositionComponent');

     for (const attackHit of attack.attackHits) {

     const mobPosComp = _.find(mobEnts, { id: attackHit.entityId }, this).get('PositionComponent');

     const attackStartTranslatePos = this._translateWorldToScreen(heroPosComp.position, topLeftSprite.position);
     const attackEndTranslatePos = this._translateWorldToScreen(mobPosComp.position, topLeftSprite.position);

     g.lineStyle(1, 0x00ff00);
     g.moveTo(attackStartTranslatePos.x / scale, attackStartTranslatePos.y / scale);
     g.lineTo(attackEndTranslatePos.x / scale, attackEndTranslatePos.y / scale);

     }*/

  }

  _calculateMeleeAttackEffects(weapon, mob, pxLines) {

    const attack = weapon.get('MeleeAttackComponent');
    const lineCount = attack.lines.length;
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftSprite = tileMap.spriteLayers[0][0][0];
    const facing = mob.get('FacingComponent').facing;
    const stats = weapon.getAllKeyed('StatisticComponent', 'name');
    const attackLen = stats[Const.Statistic.Range].currentValue;
    const leastLenFromOrigin = .5; //arbitrary. .5 (half a tile) seems to look good. closer and graphical glitches can occur.
    const mostLenFromOrigin = _.clamp(attackLen / 1.4, leastLenFromOrigin, attackLen); // 1.4 is arbitrary and should maybe be determined from attackLen.
    const incr = (leastLenFromOrigin - mostLenFromOrigin) / lineCount;

    for (let i = 0, j = lineCount - 1; i < lineCount; ++i, --j) {

      const line = attack.lines[facing === Const.Direction.East ? j : i];
      const start = leastLenFromOrigin - (incr * i);
      const rot = Math.atan2(line.point2.y - line.point1.y, line.point2.x - line.point1.x);
      const pos = new Point(line.point1.x + start * Math.cos(rot), line.point1.y + start * Math.sin(rot));
      const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(pos, topLeftSprite.position);
      const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftSprite.position);

      pxLines.push(new Line(startPxPos.x, startPxPos.y, endPxPos.x, endPxPos.y));

    }

  }

  _drawMeleeAttackEffects(weapon, pxLines) {

    const melee = weapon.get('MeleeWeaponComponent');
    const gradient = ColorUtils.getGradient(melee.gradientColor1, melee.gradientColor2, pxLines.length);
    const attack = weapon.get('MeleeAttackComponent');
    const g = attack.graphics.clear();

    for (let i = 0; i < pxLines.length; ++i) {

      const line1 = pxLines[i];
      const line2 = pxLines[i + 1];

      if (!line1 || !line2) { continue; }

      const color = gradient[i];

      g.lineStyle(1, color)
       .beginFill(color, 1)
       .drawPolygon([
                      new Pixi.Point(line1.point1.x / Const.ScreenScale, line1.point1.y / Const.ScreenScale),
                      new Pixi.Point(line1.point2.x / Const.ScreenScale, line1.point2.y / Const.ScreenScale),
                      new Pixi.Point(line2.point2.x / Const.ScreenScale, line2.point2.y / Const.ScreenScale),
                      new Pixi.Point(line2.point1.x / Const.ScreenScale, line2.point1.y / Const.ScreenScale)
                    ])
       .endFill();

    }

  }

  _drawRangedAttack(mob, weapon) {

    if (!weapon || !weapon.has('RangedAttackComponent')) { return; }

    const state = mob.get('AiComponent').state;
    const facing = mob.get('FacingComponent').facing;
    const weaponMc = weapon.get('MovieClipComponent');

    if (state === 'attacking') {

      const mobPos = mob.get('PositionComponent');
      const newMobPos = new Point(mobPos.x + .5, mobPos.y + .5);
      const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
      const topLeftSprite = tileMap.spriteLayers[0][0][0];
      const angle = weapon.get('RangedAttackComponent').angle;
      const weaponPos = new Point(newMobPos.x + .5 * Math.cos(angle), newMobPos.y + .5 * Math.sin(angle));
      const weaponPxPos = ScreenUtils.translateWorldPositionToScreenPosition(weaponPos, topLeftSprite.position).divideBy(Const.ScreenScale);

      weaponMc.scale.x = (facing === Const.Direction.East) ? 1 : -1;
      weaponMc.position.x = weaponPxPos.x;
      weaponMc.position.y = weaponPxPos.y;
      if (weaponMc.scale.x === 1) {
        weaponMc.rotation = angle - Const.RadiansPiOver4;
      } else {
        weaponMc.rotation = angle + Const.RadiansPiOver4 + Const.RadiansPi;
      }

    } else {

      if (mob.has('HeroComponent')) {

        const centerScreenX = Math.floor(Const.ScreenWidth / Const.ScreenScale / 2);
        const centerScreenY = Math.floor(Const.ScreenHeight / Const.ScreenScale / 2);

        const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');
        weaponMc.setFacing(facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
        weaponMc.position.y = centerScreenY + mcSettings.positionOffset.y;

      } else {

        const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
        const topLeftSprite = tileMap.spriteLayers[0][0][0];
        const position = mob.get('PositionComponent');
        const newPos = ScreenUtils.translateWorldPositionToScreenPosition(position.position, topLeftSprite.position);
        const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');

        weaponMc.setFacing(facing, newPos.x / Const.ScreenScale, mcSettings.positionOffset.x, mcSettings.rotation);
        weaponMc.position.y = (newPos.y / Const.ScreenScale) + mcSettings.positionOffset.y;

      }

    }

  }

  //TODO: move elsewhere (build in weapon factory).
  _buildGlowFilter(meleeWeaponComponent) {

    const color = meleeWeaponComponent.glowColor;
    const distance = 10;

    const glowFilter = new PixiExtraFilters.GlowFilter(Const.ScreenWidth, Const.ScreenHeight, distance, 3, 0, color, 0.5);
    glowFilter.padding = distance;

    return glowFilter;

  }

  //TODO: put into MovieClipComponentCollection
  _showAndPlay(mob, facing, x, y, ...mcIds) {

    const mcs = mob.getAllKeyed('MovieClipComponent', 'id');

    _.forOwn(mcs, (val, key) => {

      if (_.includes(mcIds, key)) {

        val.setFacing(facing, x);
        val.position.y = y;

        if (!val.visible) {

          val.visible = true;

          if (val.movieClip.totalFrames === 0) {
            val.movieClip.gotoAndStop(0);
          } else {
            val.movieClip.gotoAndPlay(0);
          }

        }

      } else {

        val.visible = false;
        val.movieClip.stop();

      }

    });

  }

}
