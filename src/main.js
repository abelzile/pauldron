import * as _ from 'lodash';
import * as CanvasUtils from './utils/canvas-utils';
import * as ColorUtils from './utils/color-utils';
import * as Const from './const';
import * as EntityFactory from './entity-factory';
import * as MobMap from './mob-weapon-map';
import * as PartileEmitterComponentFactory from './factories/particle-emitter-component-factory';
import * as Pixi from 'pixi.js';
import Entity from './entity';
import EntityManager from './entity-manager';
import EntityReferenceComponent from './components/entity-reference-component';
import ExperienceComponent from './components/experience-component';
import Game from './game';
import Input from './input';
import Line from './line';
import MainMenuScreen from './screens/main-menu-screen';
import Particle from './particle';
import ScreenManager from './screen-manager';
import Vector from './vector';
import WebFontLoader from 'webfontloader';

export default class Main {

  constructor() {

    this._game = undefined;
    this._entityManager = undefined;
    this._screenManager = undefined;
    this._renderer = undefined;
    this._input = undefined;

    WebFontLoader.load({ custom: { families: ['Press Start 2P', 'silkscreennormal'] } });

    Pixi.utils.skipHello();
    Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST;

  }

  go() {

    this._renderer = new Pixi.WebGLRenderer(
      1280,
      720,
      {
        transparent: false,
        roundPixels: true
      }
    );
    this._renderer.backgroundColor = Const.Color.Black;
    this._renderer.globalScale = 3;
    this._renderer.tilePxSize = 16;

    const canvas = document.body.appendChild(this._renderer.view);
    canvas.addEventListener('contextmenu', this.contextMenuHandler, true);

    this._input = new Input(this._renderer);
    this._entityManager = new EntityManager();
    this._screenManager = new ScreenManager(this._renderer, this._input, this._entityManager);
    this._entityManager.on('entity-manager.remove', e => { this._screenManager.cleanUpEntity(e); });

    const levelResources = Object.create(null);
    levelResources['cave'] = require('./data/levels/cave.json');
    levelResources['dungeon'] = require('./data/levels/dungeon.json');
    levelResources['woodland'] = require('./data/levels/woodland.json');
    /*levelResources['cave_level'] = require('./data/level-descriptions/cave-level.json');
     levelResources['dungeon_level'] = require('./data/level-descriptions/dungeon-level.json');
     levelResources['level_0'] = require('./data/level-descriptions/level-0.json');
     levelResources['level_1'] = require('./data/level-descriptions/level-1.json');*/

    const textureResources = Object.create(null);
    textureResources['hero'] = require('./data/texture-descriptions/hero.json');

    const mobResources = Object.create(null);
    mobResources['bear'] = require('./data/mobs/bear.json');
    mobResources['blue_slime'] = require('./data/mobs/blue_slime.json');
    mobResources['forest_troll'] = require('./data/mobs/forest_troll.json');
    mobResources['goblin'] = require('./data/mobs/goblin.json');
    mobResources['orc'] = require('./data/mobs/orc.json');
    mobResources['skeleton'] = require('./data/mobs/skeleton.json');
    mobResources['zombie'] = require('./data/mobs/zombie.json');
    mobResources['lich'] = require('./data/mobs/lich.json');

    const weaponResources = Object.create(null);
    weaponResources['axe_iron'] = require('./data/weapons/axe_iron.json');
    weaponResources['bow_wood'] = require('./data/weapons/bow_wood.json');
    weaponResources['goblin_bow_wood'] = require('./data/weapons/goblin_bow_wood.json');
    weaponResources['punch_bear'] = require('./data/weapons/punch_bear.json');
    weaponResources['punch_blue_slime'] = require('./data/weapons/punch_blue_slime.json');
    weaponResources['punch_zombie'] = require('./data/weapons/punch_zombie.json');
    weaponResources['staff_wood'] = require('./data/weapons/staff_wood.json');
    weaponResources['sword_iron'] = require('./data/weapons/sword_iron.json');
    weaponResources['punch_forest_troll'] = require('./data/weapons/punch_forest_troll.json');

    const armorResources = Object.create(null);
    armorResources['hero_chain_mail_iron'] = require('./data/armor/hero_chain_mail_iron.json');
    armorResources['hero_plate_mail_iron'] = require('./data/armor/hero_plate_mail_iron.json');
    armorResources['hero_robe_cloth'] = require('./data/armor/hero_robe_cloth.json');
    armorResources['hero_shield_iron'] = require('./data/armor/hero_shield_iron.json');
    armorResources['hero_shield_steel'] = require('./data/armor/hero_shield_steel.json');
    armorResources['hero_shield_wood'] = require('./data/armor/hero_shield_wood.json');
    armorResources['hero_tunic_leather'] = require('./data/armor/hero_tunic_leather.json');

    const particleEmitterGroupResources = Object.create(null);
    particleEmitterGroupResources['arrow_trail'] = require('./data/particle_emitter_groups/arrow_trail.json');
    particleEmitterGroupResources['fireball'] = require('./data/particle_emitter_groups/fireball.json');
    particleEmitterGroupResources['lich_flame_idle_1'] = require('./data/particle_emitter_groups/lich_flame_idle_1.json');
    particleEmitterGroupResources['lich_flame_idle_2'] = require('./data/particle_emitter_groups/lich_flame_idle_2.json');

    const projectileResources = Object.create(null);
    projectileResources['arrow'] = require('./data/projectiles/arrow.json');
    projectileResources['fireball'] = require('./data/projectiles/fireball.json');
    projectileResources['goblin_arrow'] = require('./data/projectiles/goblin_arrow.json');

    const magicSpellResources = Object.create(null);
    magicSpellResources['charge'] = require('./data/magic-spells/charge.hson');
    magicSpellResources['fireball'] = require('./data/magic-spells/fireball.json');
    magicSpellResources['heal'] = require('./data/magic-spells/heal.json');
    magicSpellResources['ice_shard'] = require('./data/magic-spells/ice_shard.json');
    magicSpellResources['lightning_bolt'] = require('./data/magic-spells/lightning_bolt.json');
    magicSpellResources['multi_arrow'] = require('./data/magic-spells/multi_arrow.json');

    Pixi.loader
      .add('silkscreen_img', require('file?name=silkscreen_0.png!./media/fonts/silkscreen/silkscreen_0.png'))
      .add('silkscreen_fnt', require('file!./media/fonts/silkscreen/silkscreen.fnt'))
      .add('cave', require('file!./media/images/levels/cave.png'))
      .add('containers', require('file!./media/images/containers.png'))
      .add('dungeon', require('file!./media/images/levels/dungeon.png'))
      .add('gui', require('file!./media/images/gui.png'))
      .add('hero', require('file!./media/images/hero.png'))
      .add('hero_armor', require('file!./media/images/hero-armor.png'))
      .add('items', require('file!./media/images/items.png'))
      .add('magic_spells', require('file!./media/images/magic_spells.png'))
      .add('mob_bear', require('file!./media/images/mobs/bear.png'))
      .add('mob_blue_slime', require('file!./media/images/mobs/blue-slime.png'))
      .add('mob_forest_troll', require('file!./media/images/mobs/forest-troll.png'))
      .add('mob_goblin', require('file!./media/images/mobs/goblin.png'))
      .add('mob_orc', require('file!./media/images/mobs/orc.png'))
      .add('mob_skeleton', require('file!./media/images/mobs/skeleton.png'))
      .add('mob_zombie', require('file!./media/images/mobs/zombie.png'))
      .add('particles', require('file!./media/images/particles.png'))
      .add('weapons', require('file!./media/images/weapons.png'))
      .add('woodland', require('file!./media/images/levels/woodland.png'))
      .add('world', require('file!./media/images/world.png'))
      .add('mob_lich', require('file!./media/images/mobs/lich.png'))
      .on(
        'progress', (loader, resource) => {
          //console.log(resource.name);
        }
      )
      .load(
        (imageLoader, imageResources) => {

          this._createHeroTextures(imageResources['hero'].data, textureResources['hero']);

          const em = this._entityManager;

          em.add(EntityFactory.buildMainMenuEntity(imageResources))
            .add(EntityFactory.buildInventoryEntity(imageResources))
            .add(EntityFactory.buildLevelGui(imageResources))
            .add(EntityFactory.buildLevelMapGui(imageResources));

          const levelTypes = ['woodland', 'dungeon'];

          for (let i = 0; i < levelTypes.length; ++i) {

            const levelType = levelTypes[i];

            em.worldLevelTemplateValues[levelType] = {
              data: levelResources[levelType],
              texture: imageResources[levelType].texture
            };

          }

          const emitterComponentGroupTemplates = Object.create(null);

          _.forOwn(
            particleEmitterGroupResources,
            res => {
              emitterComponentGroupTemplates[res.id] = PartileEmitterComponentFactory.buildParticleEmitterGroup(
                imageResources,
                res
              );
            }
          );

          _.forOwn(
            mobResources,
            res => {
              em.mobTemplateEntities[res.id] = EntityFactory.buildMob(
                imageResources,
                res,
                emitterComponentGroupTemplates
              );
            }
          );

          _.forOwn(
            weaponResources,
            res => {

              if (!em.weaponTemplateEntities[res.weaponTypeId]) {
                em.weaponTemplateEntities[res.weaponTypeId] = Object.create(null);
              }

              em.weaponTemplateEntities[res.weaponTypeId][res.weaponMaterialTypeId] = EntityFactory.buildWeapon(
                imageResources,
                res
              );

            }
          );

          _.forOwn(
            armorResources,
            res => {

              if (!em.armorTemplateEntities[res.armorTypeId]) {
                em.armorTemplateEntities[res.armorTypeId] = Object.create(null);
              }

              em.armorTemplateEntities[res.armorTypeId][res.armorMaterialTypeId] = EntityFactory.buildHeroArmor(
                imageResources,
                res
              );

            }
          );

          _.forOwn(
            projectileResources,
            res => {

              em.projectileTemplateEntities[res.id] = EntityFactory.buildProjectile(
                imageResources,
                res,
                emitterComponentGroupTemplates
              );

            }
          );

          em.containerTemplateEntities[Const.Container.WoodChest] = EntityFactory.buildContainerWoodChestTemplateEntity(
            imageResources
          );

          em.itemTemplateEntities[Const.Item.HealingPotion] = EntityFactory.buildItemHealingPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MagicPotion] = EntityFactory.buildItemMagicPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MaxHpUpPotion] = EntityFactory.buildItemHpMaxUpPotionEntity(imageResources);

          _.forOwn(
            magicSpellResources, res => {
              em.magicSpellTemplateEntities[res.id] = EntityFactory.buildMagicSpell(imageResources, res);
            }
          );

          em.heroEntity = EntityFactory.buildHero(imageResources);

          this._loadMobWeaponMap(mobResources);

          const LevelCap = 20;

          const levelEnt = new Entity(Const.EntityId.HeroLevelTable);

          for (let i = 1; i <= LevelCap; ++i) {
            const expComp = new ExperienceComponent(i, ExperienceComponent.levelToPoints(i));
            levelEnt.add(expComp);
          }

          const worldWidth = 3;
          const worldHeight = 3;

          em.worldEntity = EntityFactory.buildWorldEntity(worldWidth, worldHeight, imageResources);
          const worldMapComp = em.worldEntity.get('WorldMapComponent');
          worldMapComp.getWorldDataByNum(0).isVisited = true;

          em.add(EntityFactory.buildWorldMapGuiEntity(imageResources))
            .add(EntityFactory.buildVictorySplashEntity(imageResources))
            .add(EntityFactory.buildDefeatSplashEntity(imageResources));

          const characterClasses = this._buildCharacterClasses(em);

          const characterClassListCtrl = EntityFactory.buildListControl();
          em.add(characterClassListCtrl);
          em.add(EntityFactory.buildCharacterCreationGui(imageResources, characterClassListCtrl, characterClasses));
          em.add(EntityFactory.buildAbilitiesGui(imageResources));

          const sm = this._screenManager;
          sm.add(new MainMenuScreen());

          Line.setupPool(1000);
          Particle.setupPool(2000);
          Vector.setupPool(1000);

          this._game = new Game(sm);
          this._game.start();

        }
      );

  }

  _buildCharacterClasses(em) {

    const multiArrow = em.buildFromMagicSpellTemplate(Const.MagicSpell.MultiArrow);
    em.add(multiArrow);

    const archerSkills = EntityFactory.buildSkillGroup(Const.SkillGroup.ArcherSkills, multiArrow /*, etc., etc.,*/);
    em.add(archerSkills);

    const charge = em.buildFromMagicSpellTemplate(Const.MagicSpell.Charge);
    em.add(charge);

    const warriorSkills = EntityFactory.buildSkillGroup(Const.SkillGroup.WarriorSkills, charge /*, etc. etc. */);
    em.add(warriorSkills);

    const fireball = em.buildFromMagicSpellTemplate(Const.MagicSpell.Fireball);
    em.add(fireball);

    const fireMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.FireMagic, fireball /* add more fire spells */);
    em.add(fireMagic);

    const iceShard = em.buildFromMagicSpellTemplate(Const.MagicSpell.IceShard);
    em.add(iceShard);

    const iceMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.IceMagic, iceShard /* more ice spells */);
    em.add(iceMagic);

    const lightningBolt = em.buildFromMagicSpellTemplate(Const.MagicSpell.LightningBolt);
    em.add(lightningBolt);

    const lightningMagic = EntityFactory.buildSkillGroup(
      Const.SkillGroup.LightningMagic,
      lightningBolt
      /* more lightning! */
    );
    em.add(lightningMagic);

    const woodBow = em.buildFromWeaponTemplate(Const.WeaponType.Bow, Const.WeaponMaterial.Wood);
    em.add(woodBow);

    const ironSword = em.buildFromWeaponTemplate(Const.WeaponType.Sword, Const.WeaponMaterial.Iron);
    em.add(ironSword);

    const woodStaff = em.buildFromWeaponTemplate(Const.WeaponType.Staff, Const.WeaponMaterial.Wood);
    em.add(woodStaff);

    const clothRobe = em.buildFromArmorTemplate(Const.ArmorType.Robe, Const.ArmorMaterial.Cloth);
    em.add(clothRobe);

    const leatherTunic = em.buildFromArmorTemplate(Const.ArmorType.Tunic, Const.ArmorMaterial.Leather);
    em.add(leatherTunic);

    const ironChainMail = em.buildFromArmorTemplate(Const.ArmorType.ChainMail, Const.ArmorMaterial.Iron);
    em.add(ironChainMail);

    const woodShield = em.buildFromArmorTemplate(Const.ArmorType.Shield, Const.ArmorMaterial.Wood);
    em.add(woodShield);

    const starterHealingPotion = em.buildFromItemTemplate(Const.Item.HealingPotion);
    em.add(starterHealingPotion);

    const archer = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Archer,
      [archerSkills],
      [woodBow],
      [leatherTunic],
      [starterHealingPotion],
    );
    em.add(archer);

    const warrior = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Warrior,
      [warriorSkills],
      [ironSword],
      [ironChainMail, woodShield],
      [starterHealingPotion],
    );
    em.add(warrior);

    const wizard = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Wizard,
      [fireMagic, iceMagic, lightningMagic],
      [woodStaff],
      [clothRobe],
      [starterHealingPotion],
    );
    em.add(wizard);

    const boundingBox1 = new Entity();
    em.add(boundingBox1);

    const classes = [archer, warrior, wizard];

    for (let i = 0; i < classes.length; ++i) {
      classes[i].add(new EntityReferenceComponent('bounding_box', boundingBox1.id));
    }

    return classes;

  }

  reset() {

    console.log('reset!');

    this._game.removeAllListeners();
    this._game = undefined;

    this._screenManager.removeAll();
    this._screenManager.removeAllListeners();
    this._screenManager = undefined;

    this._entityManager.removeAllListeners();
    this._entityManager = undefined;

    this._renderer.view.removeEventListener('contextmenu', this.contextMenuHandler, true);
    this._renderer.destroy(true);
    this._renderer = undefined;

    this._input.removeAllListeners();
    this._input = undefined;

    Pixi.loader.reset();

    this.go();

  }

  contextMenuHandler(e) {
    e.preventDefault();
    return false;
  }

  _createHeroTextures(heroImg, heroColor) {

    let heroCanvas = document.createElement('canvas');
    heroCanvas.width = heroImg.width;
    heroCanvas.height = heroImg.height;

    const ctx = heroCanvas.getContext('2d');
    ctx.drawImage(heroImg, 0, 0);

    const imageData = ctx.getImageData(0, 0, heroCanvas.width, heroCanvas.height);

    this._replaceTextureColors(imageData, 0, 0, 16, 48, heroColor.skinReplace, heroColor.skins);

    this._replaceTextureColors(imageData, 0, 49, 16, 16, heroColor.hairReplace, heroColor.hairs);

    this._replaceTextureColors(imageData, 0, 64, 16, 48, heroColor.faceReplace, heroColor.skins);

    ctx.putImageData(imageData, 0, 0);

    heroImg.src = heroCanvas.toDataURL();

    heroCanvas = null;
    //document.body.appendChild(heroCanvas);

  }

  _replaceTextureColors(imageData, startX, startY, width, height, toReplaceColor, replacementColorGroups) {

    const endY = startY + height;
    const endX = startX + width;

    for (let y = startY; y < endY; ++y) {

      for (let x = startX; x < endX; ++x) {

        let replaced = false;
        const px = CanvasUtils.getPixel(imageData, x, y);

        _.forOwn(
          toReplaceColor, (val, key) => {

            const potential = ColorUtils.hexToRgb(parseInt(val, 16));

            if (px.r === potential.r && px.g === potential.g && px.b === potential.b && px.a === potential.a) {

              replaced = true;

              for (let i = 0; i < replacementColorGroups.length; ++i) {

                const rgb = ColorUtils.hexToRgb(parseInt(replacementColorGroups[i][key], 16));

                CanvasUtils.setPixel(imageData, x + (i * 16), y, rgb.r, rgb.g, rgb.b);

              }

            }

          }
        );

        if (!replaced && px.a > 0) {

          // pass through original color.
          for (let i = 0; i < replacementColorGroups.length; ++i) {
            CanvasUtils.setPixel(imageData, x + (i * 16), y, px.r, px.g, px.b);
          }

        }

      }

    }

  }

  _loadMobWeaponMap(mobResources) {

    _.forOwn(
      mobResources, (o) => {
        MobMap.MobWeaponMap[o.id] = o.weapon;
      }
    );

  }

}