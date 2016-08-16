import * as ArrayUtils from '../utils/array-utils';
import * as ColorUtils from '../utils/color-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import * as HeroComponent from '../components/hero-component';
import * as ObjectUtils from '../utils/object-utils';
import * as ScreenUtils from '../utils/screen-utils';
import _ from 'lodash';
import Line from '../line';
import Pixi from 'pixi.js';
import Point from '../point';
import System from '../system';


export default class LevelHeroRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this.pxLines = [];

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    const heroEnt = this._entityManager.heroEntity;
    const heroMcs = heroEnt.getAllKeyed('MovieClipComponent', 'id');

    const bodyStanding = heroMcs['body_standing'];
    this._pixiContainer.addChild(bodyStanding.movieClip);
    bodyStanding.position.x = centerScreenX;
    bodyStanding.position.y = centerScreenY;

    const bodyWalking = heroMcs['body_walking'];
    this._pixiContainer.addChild(bodyWalking.movieClip);
    bodyWalking.position.x = centerScreenX;
    bodyWalking.position.y = centerScreenY;
    bodyWalking.visible = false;

    const hair = heroMcs['hair'];
    this._pixiContainer.addChild(hair.movieClip);
    hair.position.x = centerScreenX;
    hair.position.y = centerScreenY;

    const neutralFace = heroMcs['face_neutral'];
    this._pixiContainer.addChild(neutralFace.movieClip);
    neutralFace.position.x = centerScreenX;
    neutralFace.position.y = centerScreenY;

    const attackFace = heroMcs['face_attack'];
    this._pixiContainer.addChild(attackFace.movieClip);
    attackFace.position.x = centerScreenX;
    attackFace.position.y = centerScreenY;
    attackFace.visible = false;

    const knockbackFace = heroMcs['face_knockback'];
    this._pixiContainer.addChild(knockbackFace.movieClip);
    knockbackFace.position.x = centerScreenX;
    knockbackFace.position.y = centerScreenY;
    knockbackFace.visible = false;

    const invisibleSlots = [
      Const.InventorySlot.Backpack,
      Const.InventorySlot.Hotbar,
      Const.MagicSpellSlot.Hotbar,
      Const.MagicSpellSlot.Memory,
      Const.MagicSpellSlot.SpellBook,
    ];

    const entRefComps = heroEnt.getAll('EntityReferenceComponent');

    _.chain(entRefComps)
     .map(c => EntityFinders.findById(entities, c.entityId))
     .compact()
     .tap(ents => { ents.sort(EntitySorters.sortInventory); })
     .each(ent => {

       const isVisible = !_.includes(invisibleSlots, _.find(entRefComps, c => c.entityId === ent.id).typeId);

       if (ent.has('MovieClipComponent')) {

         const mc = this._pixiContainer.addChild(ent.get('MovieClipComponent').movieClip);
         mc.visible = isVisible;
         mc.position.set(centerScreenX, centerScreenY);

       }

       if (ent.has('MeleeAttackComponent')) {

         const g = this._pixiContainer.addChild(ent.get('MeleeAttackComponent').graphics);
         g.visible = isVisible;

       }

     })
     .value();

  }

  processEntities(gameTime, entities) {

    const mobEnts = EntityFinders.findMobs(entities);
    const weaponEnts = EntityFinders.findWeapons(entities);

    this._drawHero(entities);

    const hero = this._entityManager.heroEntity;
    const weapon = EntityFinders.findById(weaponEnts, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    if (!weapon) { return; }

    if (weapon.has('MeleeAttackComponent')) {
      this._drawMeleeAttack(weapon, mobEnts);
    } else if (weapon.has('RangedAttackComponent')) {
      this._drawRangedAttack(weapon, mobEnts);
    }

  }

  _drawHero(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    const hero = this._entityManager.heroEntity;
    const facing = hero.get('FacingComponent').facing;
    const state = hero.get('HeroComponent').state;

    switch (state) {

      case HeroComponent.State.Standing: {

        this._showAndPlay(hero, facing, centerScreenX, 'body_standing', 'hair', 'face_neutral');

        break;

      }
      case HeroComponent.State.Walking: {

        this._showAndPlay(hero, facing, centerScreenX, 'body_walking', 'hair', 'face_neutral');

        break;

      }
      case HeroComponent.State.KnockingBack: {

        this._showAndPlay(hero, facing, centerScreenX, 'body_standing', 'hair', 'face_knockback');

        break;

      }
      case HeroComponent.State.CastingSpell: {

        this._showAndPlay(hero, facing, centerScreenX, 'body_standing', 'hair', 'face_attack');

        break;

      }
      case HeroComponent.State.Attacking: {

        this._showAndPlay(hero, facing, centerScreenX, 'body_standing', 'hair', 'face_attack');

        break;

      }
      default: {

        break;

      }

    }

    const bodyId = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId;

    if (bodyId) {

      const armor = EntityFinders.findById(entities, bodyId);

      if (armor) {
        armor.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

    }

    const hand2Id = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId;
    if (hand2Id) {

      const shield = EntityFinders.findById(entities, hand2Id);

      if (shield) {
        shield.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

    }

  }

  _drawMeleeAttack(weapon, mobEnts) {

    if (!weapon || !weapon.has('MeleeAttackComponent')) { return; }

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    const hero = this._entityManager.heroEntity;
    const heroAi = hero.get('HeroComponent');
    const weaponMc = weapon.get('MovieClipComponent');

    if (heroAi.state === HeroComponent.State.Attacking) {

      weaponMc.visible = false;

      ArrayUtils.clear(this.pxLines);

      this._calculateMeleeAttackEffects(weapon, hero, scale, this.pxLines);
      this._drawMeleeAttackEffects(weapon, this.pxLines, scale);

    } else {

      weaponMc.visible = true;

      const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');
      const mc = weapon.get('MovieClipComponent');
      mc.setFacing(hero.get('FacingComponent').facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
      mc.position.y = centerScreenY + mcSettings.positionOffset.y;

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

  _calculateMeleeAttackEffects(weapon, hero, scale, pxLines) {

    const attack = weapon.get('MeleeAttackComponent');
    const lineCount = attack.lines.length;
    const tilePxSize = this._renderer.tilePxSize;
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftSprite = tileMap.spriteLayers[0][0][0];
    const facing = hero.get('FacingComponent').facing;
    const stats = weapon.getAllKeyed('StatisticComponent', 'name');
    const attackLen = stats[Const.Statistic.Range].currentValue;
    const leastLenFromOrigin = .5; //arbitrary. .5 (half a tile) seems to look good. closer and graphical glitches can occur.
    const mostLenFromOrigin = _.clamp(attackLen / 1.5, leastLenFromOrigin, attackLen); // 1.5 is arbitrary and should maybe be determined from attackLen.
    const incr = (leastLenFromOrigin - mostLenFromOrigin) / lineCount;

    for (let i = 0, j = lineCount - 1; i < lineCount; ++i, --j) {

      const line = attack.lines[facing === Const.Direction.East ? j : i];
      const start = leastLenFromOrigin - (incr * i);
      const rot = Math.atan2(line.point2.y - line.point1.y, line.point2.x - line.point1.x);
      const pos = new Point(line.point1.x + start * Math.cos(rot), line.point1.y + start * Math.sin(rot));
      const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(pos, topLeftSprite.position, scale, tilePxSize);
      const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftSprite.position, scale, tilePxSize);

      pxLines.push(new Line(startPxPos.x, startPxPos.y, endPxPos.x, endPxPos.y));

    }

  }

  _drawMeleeAttackEffects(weapon, pxLines) {

    const scale = this._renderer.globalScale;
    const melee = weapon.get('MeleeWeaponComponent');
    const gradient = ColorUtils.getGradient(melee.gradientColor1, melee.gradientColor2, pxLines.length);
    const attack = weapon.get('MeleeAttackComponent');
    const g = attack.graphics.clear();

    for (let i = 0; i < pxLines.length; ++i) {

      const line1 = pxLines[i];
      const line2 = pxLines[i + 1];

      if (!line1 || !line2) { continue; }

      const color = parseInt(gradient[i].replace('#', '0x'));

      g.lineStyle(1, color)
       .beginFill(color, 1)
       .drawPolygon([
                      new Pixi.Point(line1.point1.x / scale, line1.point1.y / scale),
                      new Pixi.Point(line1.point2.x / scale, line1.point2.y / scale),
                      new Pixi.Point(line2.point2.x / scale, line2.point2.y / scale),
                      new Pixi.Point(line2.point1.x / scale, line2.point1.y / scale)
                    ])
       .endFill();

    }

    g.endFill();

  }

  _drawRangedAttack(weapon, mobEnts) {

    if (!weapon || !weapon.has('RangedAttackComponent')) { return; }

    const hero = this._entityManager.heroEntity;
    const state = hero.get('HeroComponent').state;
    const facing = hero.get('FacingComponent').facing;
    const scale = this._renderer.globalScale;
    const mc = weapon.get('MovieClipComponent');

    if (state === HeroComponent.State.Attacking) {

      const heroPos = hero.get('PositionComponent');
      const newHeroPos = new Point(heroPos.position.x + .5, heroPos.position.y + .5);
      const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
      const topLeftSprite = tileMap.spriteLayers[0][0][0];
      const angle = weapon.get('RangedAttackComponent').angle;
      const weaponPos = new Point(newHeroPos.x + .5 * Math.cos(angle), newHeroPos.y + .5 * Math.sin(angle));
      const tilePxSize = this._renderer.tilePxSize;
      const weaponPxPos = ScreenUtils.translateWorldPositionToScreenPosition(weaponPos, topLeftSprite.position, scale, tilePxSize);

      mc.scale.x = (facing === Const.Direction.East) ? 1 : -1;
      mc.position.x = weaponPxPos.x / scale;
      mc.position.y = weaponPxPos.y / scale;
      if (mc.scale.x === 1) {
        mc.rotation = angle - Const.RadiansPiOver4;
      } else {
        mc.rotation = angle + Const.RadiansPiOver4 + Const.RadiansPi;
      }

    } else {

      const screenWidth = this._renderer.width;
      const screenHeight = this._renderer.height;
      const centerScreenX = Math.floor(screenWidth / scale / 2);
      const centerScreenY = Math.floor(screenHeight / scale / 2);

      const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');
      mc.setFacing(facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
      mc.position.y = centerScreenY + mcSettings.positionOffset.y;

    }

  }

  _showAndPlay(hero, facing, x, ...mcIds) {

    const mcs = hero.getAllKeyed('MovieClipComponent', 'id');

    _.forOwn(mcs, (val, key) => {

      if (_.includes(mcIds, key)) {

        val.setFacing(facing, x);

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
