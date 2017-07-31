import * as ArrayUtils from '../utils/array-utils';
import * as ColorUtils from '../utils/color-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as EntitySorters from '../entity-sorters';
import * as EntityUtils from '../utils/entity-utils';
import * as HeroComponent from '../components/hero-component';
import * as Pixi from 'pixi.js';
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
    const mobs = EntityFinders.findMobs(this._entityManager.getEntitiesAdjacentToHero());
    const weapons = EntityFinders.findWeapons(entities);
    const armors = EntityFinders.findArmors(entities);
    const magicSpells = EntityFinders.findMagicSpells(entities);

    this._drawMobs(mobs, weapons, armors);
    this._drawHero(weapons, armors, magicSpells);
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
      ...['body_standing', 'body_walking', 'hair', 'face_neutral', 'face_attack', 'face_knockback'].map(id => {
        const c = heroMcs[id];
        c.position.x = this._centerScreen.x;
        c.position.y = this._centerScreen.y;
        c.visible = ['body_standing', 'hair', 'face_neutral'].includes(id);
        return c.animatedSprite;
      }),
      ...hero.getAll('GraphicsComponent').map(c => c.graphics)
    );

    const invisibleSlots = [
      Const.InventorySlot.Backpack,
      Const.InventorySlot.Hotbar,
      Const.MagicSpellSlot.Hotbar,
      Const.MagicSpellSlot.SpellBook
    ];

    const entRefs = hero.getAll('EntityReferenceComponent');
    const items = entRefs
      .map(c => EntityFinders.findById(entities, c.entityId))
      .filter(e => !!e)
      .sort(EntitySorters.sortInventory);

    for (const item of items) {
      const isVisible = !invisibleSlots.includes(entRefs.find(c => c.entityId === item.id).typeId);

      if (item.has('MeleeAttackComponent')) {
        const g = item.get('MeleeAttackComponent').graphics;
        pixiContainer.addChild(g);
        g.visible = isVisible;
      }

      const anims = item.getAll('AnimatedSpriteComponent');
      for (const anim of anims) {
        const mc = anim.animatedSprite;
        pixiContainer.addChild(mc);
        mc.visible = isVisible && !anim.id; //NOTE: may want to look for a specific id (eg. "default") and not just absence of id.
        mc.position.x = this._centerScreen.x;
        mc.position.y = this._centerScreen.y;
      }
    }
  }

  _initMobs(entities) {
    const pixiContainer = this._pixiContainer;
    const mobs = EntityFinders.findMobs(entities);
    const weapons = EntityFinders.findWeapons(entities);
    const mobComps = [];
    const weaponComps = [];

    //TODO: think about putting entity pixi objs into containers (all mobs in a container, weapons in another, etc.)

    for (const mob of mobs) {
      ArrayUtils.append(
        mobComps,
        mob.getAll('SpriteComponent'),
        mob.getAll('GraphicsComponent'),
        mob.getAll('AnimatedSpriteComponent')
      );

      for (const comp of mobComps) {
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

    for (const comp of weaponComps) {
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
    let bootsMcId = '';

    switch (state) {
      case HeroComponent.State.Walking: {
        visibleMcIds.push('body_walking', 'hair', 'face_neutral');
        bootsMcId = 'walking';
        break;
      }
      case HeroComponent.State.KnockingBack: {
        visibleMcIds.push('body_standing', 'hair', 'face_knockback');
        bootsMcId = 'standing';
        break;
      }
      case HeroComponent.State.CastingSpellWarmingUp:
      case HeroComponent.State.CastingSpell:
      case HeroComponent.State.AttackWarmingUp:
      case HeroComponent.State.Attacking: {
        visibleMcIds.push('body_standing', 'hair', 'face_attack');
        bootsMcId = 'standing';
        break;
      }
      default: {
        visibleMcIds.push('body_standing', 'hair', 'face_neutral');
        bootsMcId = 'standing';
        break;
      }
    }

    this._showAndPlay(hero, facing, this._centerScreen.x, this._centerScreen.y, 0, 0, 0, ...visibleMcIds);

    const heroAnims = hero.getAll('AnimatedSpriteComponent', c => visibleMcIds.includes(c.id));
    for (const anim of heroAnims) {
      this._pixiContainer.applyShakeOffset(anim.position);
    }

    const armorIds = [
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Head).entityId,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId,
      hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand2).entityId
    ];

    for (const id of armorIds) {
      if (id) {
        const armor = EntityFinders.findById(armors, id);
        if (armor) {
          this._drawEquipment(hero, armor);

          for (const anim of armor.getAll('AnimatedSpriteComponent')) {
            this._pixiContainer.applyShakeOffset(anim.position);
          }
        }
      }
    }

    const bootsId = hero.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Feet).entityId;
    if (bootsId) {
      const boots = EntityFinders.findById(armors, bootsId);
      if (boots) {
        this._drawBoots(hero, boots, bootsMcId);

        const anim = boots.get('AnimatedSpriteComponent', c => c.id === bootsMcId);
        if (anim) {
          this._pixiContainer.applyShakeOffset(anim.position);
        }
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

      for (const anim of weapon.getAll('AnimatedSpriteComponent')) {
        this._pixiContainer.applyShakeOffset(anim.position);
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

  _drawMobs(mobs, weapons, armors) {
    const tileMap = this._entityManager.currentLevelEntity.get('TileMapComponent');
    const topLeftPos = tileMap.topLeftPos;

    for (const mob of mobs) {
      const ai = mob.get('AiComponent');
      const position = mob.get('PositionComponent');
      const screenPosition = this._pixiContainer
        .translateWorldPositionToScreenPosition(position.position, topLeftPos)
        .divide(Const.ScreenScale);

      const sprites = mob.getAllKeyed('SpriteComponent', 'id');
      if (sprites['shadow']) {
        const shadow = sprites['shadow'].sprite;
        shadow.position.x = screenPosition.x;
        shadow.position.y = screenPosition.y + 2;
      }

      this._showAndPlay(mob, mob.get('FacingComponent').facing, screenPosition.x, screenPosition.y, 0, 0, 0, ai.state);
      this._drawHpBar(mob, topLeftPos);

      const hand1Slot = mob.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1);
      if (hand1Slot) {
        const weapon = EntityFinders.findById(weapons, hand1Slot.entityId);
        if (weapon) {
          if (weapon.has('MeleeAttackComponent')) {
            this._drawMeleeWeapon(mob, weapon);
          } else if (weapon.has('RangedAttackComponent')) {
            this._drawRangedWeapon(mob, weapon);
          }
        }
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
    const newPos = this._pixiContainer
      .translateWorldPositionToScreenPosition(positionedBoundingRect, topLeftPos)
      .divide(Const.ScreenScale);

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

    if (ai.state === 'attacking') {
      const melee = weapon.get('MeleeWeaponComponent');
      melee &&
        this._funcs[melee.attackShape] &&
        this._funcs[melee.attackShape].call(this, this._entityManager.currentLevelEntity, weapon, mob);
    } else if (ai.state === 'attackWarmingUp') {
      this._drawEquipment(mob, weapon, ai.state);
    } else {
      this._drawEquipment(mob, weapon);
    }

    if (ai.state === 'castingSpell') {
      const spell = weapon.get('SelfMagicSpellComponent');
      spell &&
        this._funcs[spell.attackShape] &&
        this._funcs[spell.attackShape].call(this, this._entityManager.currentLevelEntity, weapon, mob);
    }
  }

  _drawBoots(mob, boots, bootsMcId) {
    if (!mob || !boots) {
      return;
    }

    const sprite = boots.get('AnimatedSpriteComponent', c => c.id === bootsMcId);
    const setting = boots.get('AnimatedSpriteSettingsComponent', c => c.id === bootsMcId);
    sprite.anchor.x = setting.anchor.x;
    sprite.anchor.y = setting.anchor.y;
    sprite.pivot.x = setting.pivot.x;
    sprite.pivot.y = setting.pivot.y;

    this._showAndPlay(
      boots,
      mob.get('FacingComponent').facing,
      this._centerScreen.x,
      this._centerScreen.y,
      0,
      setting.positionOffset.y,
      0,
      bootsMcId
    );
  }

  _drawSlashAttack(currentLevel, weapon, mob) {
    if (!weapon) {
      return;
    }

    const attack = weapon.get('MeleeAttackComponent');
    const attackRange = attack.length;

    if (attack.lines.length === 0) {
      return;
    }

    const topLeftPos = currentLevel.get('TileMapComponent').topLeftPos;
    const g = attack.graphics.clear();
    g.lineStyle(0, 0xffffff);

    const div = attack.totalTime / (1000 / 60) * 2; //tweak to whatever looks good.

    for (let i = 0; i < attack.lines.length; ++i) {
      const line = attack.lines[i];
      const pxPos2 = this._pixiContainer
        .translateWorldPositionToScreenPosition(line.point2, topLeftPos)
        .divide(Const.ScreenScale);

      if (i === 0) {
        g.moveTo(pxPos2.x, pxPos2.y);
      } else {
        const prevLine = attack.lines[i - 1];

        const pxPos1 = this._pixiContainer
          .translateWorldPositionToScreenPosition(prevLine.point2, topLeftPos)
          .divide(Const.ScreenScale);
        const pxPos2 = this._pixiContainer
          .translateWorldPositionToScreenPosition(line.point2, topLeftPos)
          .divide(Const.ScreenScale);

        let start = attackRange - i / div;
        const pxPos3 = this._pixiContainer
          .translateWorldPositionToScreenPosition(
            new Vector(line.point1.x + start * Math.cos(line.angle), line.point1.y + start * Math.sin(line.angle)),
            topLeftPos
          )
          .divide(Const.ScreenScale);

        start = attackRange - (i - 1) / div;
        const pxPos4 = this._pixiContainer
          .translateWorldPositionToScreenPosition(
            new Vector(
              prevLine.point1.x + start * Math.cos(prevLine.angle),
              prevLine.point1.y + start * Math.sin(prevLine.angle)
            ),
            topLeftPos
          )
          .divide(Const.ScreenScale);

        g
          .lineStyle(0)
          .beginFill(0xffffff, 0.7)
          .drawPolygon([
            new Pixi.Point(pxPos1.x, pxPos1.y),
            new Pixi.Point(pxPos2.x, pxPos2.y),
            new Pixi.Point(pxPos3.x, pxPos3.y),
            new Pixi.Point(pxPos4.x, pxPos4.y)
          ])
          .endFill();
      }

      if (i === attack.lines.length - 1) {
        const pxPos1 = /*ScreenUtils*/ this._pixiContainer
          .translateWorldPositionToScreenPosition(line.point1, topLeftPos)
          .divide(Const.ScreenScale);
        this._positionMeleeWeapon(weapon, new Line(pxPos1.x, pxPos1.y, pxPos2.x, pxPos2.y));
      }
    }
  }

  _positionMeleeWeapon(weapon, line) {
    const sprite = weapon.get('AnimatedSpriteComponent');
    if (!sprite) {
      return;
    }

    const setting = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === 'attack');

    sprite.anchor.x = setting.anchor.x;
    sprite.anchor.y = setting.anchor.y;
    sprite.pivot.x = setting.pivot.x;
    sprite.pivot.y = setting.pivot.y;

    const pxLine = line; //pxLines[0];
    sprite.position.x = pxLine.point2.x;
    sprite.position.y = pxLine.point2.y;

    // 45 degrees is used here because weapon sprites are drawn diagonally from bottom left to top right.
    if (sprite.scale.x === 1) {
      sprite.rotation = pxLine.angle + Const.RadiansOf45Degrees;
    } else {
      sprite.rotation = pxLine.angle - Const.RadiansOf45Degrees - Const.RadiansOf180Degrees;
    }
  }

  _drawChargeAttack(currentLevel, weapon, mob) {}

  _drawRangedWeapon(mob, weapon) {
    if (!weapon || !weapon.has('RangedAttackComponent')) {
      return;
    }

    const state = mob.get('AiComponent').state;
    const facing = mob.get('FacingComponent').facing;
    const sprites = weapon.getAll('AnimatedSpriteComponent');

    for (const sprite of sprites) {
      sprite.visible = false;
    }

    switch (state) {
      case 'attacking':
      case 'attackWarmingUp':
        let sprite = sprites.find(c => c.id === state);

        if (!sprite) {
          sprite = sprites.find(c => !c.id);
        }

        sprite.visible = true;

        const setting = weapon.get('AnimatedSpriteSettingsComponent', c => c.id === state);
        if (setting) {
          sprite.anchor.x = setting.anchor.x;
          sprite.anchor.y = setting.anchor.y;
          sprite.pivot.x = setting.pivot.x;
          sprite.pivot.y = setting.pivot.y;
        }

        const position = EntityUtils.getPositionedBoundingRect(mob).getCenter();
        const boundingRect = mob.get('BoundingRectangleComponent').rectangle;
        const angle = weapon.get('RangedAttackComponent').angle;
        const distAdj = Math.max(Math.ceil(boundingRect.width), Math.ceil(boundingRect.height));
        const weaponPos = Vector.pnew(
          position.x + boundingRect.width / 2 * distAdj * Math.cos(angle),
          position.y + boundingRect.height / 2 * distAdj * Math.sin(angle)
        );
        const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
        const weaponPxPos = this._pixiContainer
          .translateWorldPositionToScreenPosition(weaponPos, topLeftPos)
          .divide(Const.ScreenScale);

        sprite.scale.x = facing === Const.Direction.East ? 1 : -1;
        if (sprite.scale.x === 1) {
          sprite.rotation = angle - Const.RadiansPiOver4;
        } else {
          sprite.rotation = angle + Const.RadiansPiOver4 + Const.RadiansPi;
        }
        sprite.position.x = weaponPxPos.x;
        sprite.position.y = weaponPxPos.y;

        weaponPos.pdispose();

        break;
      default:
        this._drawEquipment(mob, weapon);
        break;
    }
  }

  _drawEquipment(mob, equipment, settingsId = 'neutral') {
    if (!mob || !equipment) {
      return;
    }

    const sprites = equipment.getAll('AnimatedSpriteComponent');
    let sprite = null;
    if (sprites.length === 1) {
      sprite = sprites[0];
    } else {
      if (sprites.length > 0) {
        sprite = sprites.find(c => !c.id);
      }
    }

    if (!sprite) {
      return;
    }

    sprite.visible = true;

    const setting = equipment.get('AnimatedSpriteSettingsComponent', c => c.id === settingsId);
    if (!setting) {
      return;
    }

    const position = mob.get('PositionComponent').position;
    const facing = mob.get('FacingComponent').facing;
    let x = 0;
    let y = 0;

    if (EntityFinders.isHero(mob)) {
      x = this._centerScreen.x;
      y = this._centerScreen.y;
    } else {
      const topLeftPos = this._entityManager.currentLevelEntity.get('TileMapComponent').topLeftPos;
      const newPos = this._pixiContainer
        .translateWorldPositionToScreenPosition(position, topLeftPos)
        .divide(Const.ScreenScale);

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
      const weapAnims = equipment.getAll('AnimatedSpriteComponent');
      if (weapAnims && weapAnims.length > 0) {
        diffX = mobAnims[0].width - weapAnims[0].width;
      }
    }

    sprite.setFacing(facing, x, setting.positionOffset.x, setting.rotation, diffX);
    sprite.position.y = y + setting.positionOffset.y;
  }

  _showAndPlay(mob, facing, x, y, offsetX, offsetY, rotation, ...mcIds) {
    for (const anim of mob.getAll('AnimatedSpriteComponent')) {
      if (mcIds.includes(anim.id)) {
        anim.setFacing(facing, x, offsetX, rotation);
        anim.position.y = y + offsetY;

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
