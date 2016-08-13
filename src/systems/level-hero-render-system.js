import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import _ from 'lodash';
import Point from '../point';
import System from '../system';
import * as ColorUtils from '../utils/color-utils';
import Line from '../line';
import Pixi from 'pixi.js';
import * as ScreenUtils from '../utils/screen-utils';


export default class LevelHeroRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this.facing = '';

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
    const bodyWalking = heroMcs['body_walking']
    const hair = heroMcs['hair'];

    this._pixiContainer.addChild(bodyStanding.movieClip);
    bodyStanding.position.x = centerScreenX;
    bodyStanding.position.y = centerScreenY;

    this._pixiContainer.addChild(bodyWalking.movieClip);
    bodyWalking.position.x = centerScreenX;
    bodyWalking.position.y = centerScreenY;
    bodyWalking.visible = false;

    this._pixiContainer.addChild(hair.movieClip);
    hair.movieClip.x = centerScreenX;
    hair.movieClip.y = centerScreenY;

    this.facing = Const.Direction.None;

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

    this._drawAttack(mobEnts, weaponEnts);

  }

  _drawHero(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;
    const centerScreenX = Math.floor(screenWidth / scale / 2);
    const centerScreenY = Math.floor(screenHeight / scale / 2);

    //TODO:animate hero and equipment

    const hero = this._entityManager.heroEntity;
    const facing = hero.get('FacingComponent').facing;

    if (facing != this.facing) {

      this.facing = facing;

      const heroMcs = hero.getAllKeyed('MovieClipComponent', 'id');
      const bodyStanding = heroMcs['body_standing'];
      const bodyWalking = heroMcs['body_walking'];
      const hair = heroMcs['hair'];

      bodyStanding.setFacing(facing, centerScreenX);
      bodyWalking.setFacing(facing, centerScreenX);
      hair.setFacing(facing, centerScreenX);

      const armor = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId);

      if (armor) {
        armor.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

      const shield = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId);

      if (shield) {
        shield.get('MovieClipComponent').setFacing(facing, centerScreenX);
      }

      const weapon = EntityFinders.findById(entities, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

      if (weapon) {

        const attack = weapon.get('MeleeAttackComponent');

        if (attack && attack.lines.length > 0) {

          // weapon rendered in _drawAttack

        } else {

          const mcSettings = weapon.get('MovieClipSettingsComponent', c => c.id === 'neutral');
          const mc = weapon.get('MovieClipComponent');
          mc.setFacing(facing, centerScreenX, mcSettings.positionOffset.x, mcSettings.rotation);
          mc.position.y = centerScreenY + mcSettings.positionOffset.y;

        }

      }

    }

  }

  _drawAttack(mobEnts, weaponEnts) {

    const em = this._entityManager;
    const hero = em.heroEntity;
    const weapon = EntityFinders.findById(weaponEnts, hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId);

    if (!weapon || !weapon.has('MeleeAttackComponent')) { return; }

    const attack = weapon.get('MeleeAttackComponent');

    const g = attack.graphics.clear();

    const weaponMc = weapon.get('MovieClipComponent');

    if (attack.lines.length === 0) {
      weaponMc.visible = true;
      return;
    }

    weaponMc.visible = false;

    const scale = this._renderer.globalScale;
    const tilePxSize = this._renderer.tilePxSize;

    const currentLevel = em.currentLevelEntity;
    const tileMap = currentLevel.get('TileMapComponent');
    const spriteLayer = tileMap.spriteLayers[0];
    const topLeftSprite = spriteLayer[0][0];

    const facing = hero.get('FacingComponent').facing;
    const stats = weapon.getAllKeyed('StatisticComponent', 'name');
    const attackLen = stats[Const.Statistic.Range].currentValue;
    const diag = 1.414213562; // diagonal of square (melee weapon images are drawn diagonally across our tiles).
    const leastLenFromOrigin = attackLen - diag;
    const mostLenFromOrigin = leastLenFromOrigin + (diag / 1.5); // 1.5 is arbitrary and can be tweaked.
    const lineCount = attack.lines.length;
    const incr = (leastLenFromOrigin - mostLenFromOrigin) / lineCount;

    const pxLines = [];

    for (let i = 0, j = lineCount - 1; i < lineCount; ++i, --j) {

      const line = attack.lines[facing === Const.Direction.East ? j : i];
      const start = leastLenFromOrigin - (incr * i);
      const rot = Math.atan2(line.point2.y - line.point1.y, line.point2.x - line.point1.x);
      const pos = new Point(line.point1.x + start * Math.cos(rot), line.point1.y + start * Math.sin(rot));
      const startPxPos = ScreenUtils.translateWorldPositionToScreenPosition(pos, topLeftSprite.position, scale, tilePxSize);
      const endPxPos = ScreenUtils.translateWorldPositionToScreenPosition(line.point2, topLeftSprite.position, scale, tilePxSize);

      pxLines.push(new Line(startPxPos.x, startPxPos.y, endPxPos.x, endPxPos.y));

    }

    const melee = weapon.get('MeleeWeaponComponent');
    const gradient = ColorUtils.getGradient(melee.gradientColor1, melee.gradientColor2, pxLines.length);

    for (let i = 0; i < pxLines.length; ++i) {

      const line1 = pxLines[i];
      const line2 = pxLines[i + 1];

      if (!line1 || !line2) { break; }

      const color1 = parseInt(gradient[i].replace('#', '0x'));

      g.lineStyle(1, color1)
       .beginFill(color1, 1)
       .drawPolygon([
                      new Pixi.Point(line1.point1.x / scale, line1.point1.y / scale),
                      new Pixi.Point(line1.point2.x / scale, line1.point2.y / scale),
                      new Pixi.Point(line2.point2.x / scale, line2.point2.y / scale),
                      new Pixi.Point(line2.point1.x / scale, line2.point1.y / scale)
                    ])
       .endFill();

    }

    /*let startPos;
    let endPos;

    if (facing === Const.Direction.West) {
      startPos = _.first(attack.lines).point1;
      endPos = _.first(attack.lines).point2;
    } else {
      startPos = _.last(attack.lines).point1;
      endPos = _.last(attack.lines).point2;
    }*/

    /*
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
    }*/

    /*const heroPosComp = hero.get('PositionComponent');

    for (const attackHit of attack.attackHits) {

      const mobPosComp = _.find(mobEnts, { id: attackHit.entityId }, this).get('PositionComponent');

      const attackStartTranslatePos = this._translateWorldToScreen(heroPosComp.position, topLeftSprite.position);
      const attackEndTranslatePos = this._translateWorldToScreen(mobPosComp.position, topLeftSprite.position);

      g.lineStyle(1, 0x00ff00);
      g.moveTo(attackStartTranslatePos.x / scale, attackStartTranslatePos.y / scale);
      g.lineTo(attackEndTranslatePos.x / scale, attackEndTranslatePos.y / scale);

    }*/

    g.endFill();

  }

}
