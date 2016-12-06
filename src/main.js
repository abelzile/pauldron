import * as _ from 'lodash';
import * as CanvasUtils from './utils/canvas-utils';
import * as ColorUtils from './utils/color-utils';
import * as Const from './const';
import * as EntityFactory from './entity-factory';
import * as MobMap from './mob-weapon-map';
import * as Pixi from 'pixi.js';
import Entity from './entity';
import EntityManager from './entity-manager';
import EntityReferenceComponent from './components/entity-reference-component';
import ExperienceComponent from './components/experience-component';
import FinalScreen from './screens/final-screen';
import Game from './game';
import Input from './input';
import LevelScreen from './screens/level-screen';
import Line from './line';
import MainMenuScreen from './screens/main-menu-screen';
import Particle from './particle';
import ScreenManager from './screen-manager';
import Vector from './vector';
import WebFontLoader from 'webfontloader';
import WorldScreen from './screens/world-screen';


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

    this._renderer = new Pixi.WebGLRenderer(1280, 720,
      {
        transparent: false,
        roundPixels: true
      });
    this._renderer.backgroundColor = Const.Color.DarkBlueGray;
    this._renderer.globalScale = 3;
    this._renderer.tilePxSize = 16;

    const canvas = document.body.appendChild(this._renderer.view);
    canvas.addEventListener('contextmenu', this.contextMenuHandler, true);

    this._input = new Input(this._renderer);

    this._entityManager = new EntityManager();

    this._screenManager = new ScreenManager(this._renderer, this._input, this._entityManager);

    this._entityManager.on('entity-manager.remove', e => { this._screenManager.cleanUpEntity(e); });

    //TODO: refactor data file hierarchy and names.

    const levelResources = Object.create(null);
    levelResources['cave'] = require('./data/resource-descriptions/cave.json');
    levelResources['dungeon'] = require('./data/resource-descriptions/dungeon.json');
    levelResources['woodland'] = require('./data/resource-descriptions/woodland.json');
    levelResources['cave_level'] = require('./data/level-descriptions/cave-level.json');
    levelResources['dungeon_level'] = require('./data/level-descriptions/dungeon-level.json');
    levelResources['level_0'] = require('./data/level-descriptions/level-0.json');
    levelResources['level_1'] = require('./data/level-descriptions/level-1.json');

    const textureResources = Object.create(null);
    textureResources['hero'] = require('./data/texture-descriptions/hero.json');

    const mobResources = Object.create(null);
    mobResources['bear'] = require('./data/mobs/bear.json');
    mobResources['blue_slime'] = require('./data/mobs/blue_slime.json');

    Pixi.loader
        .add('silkscreen_img', require('file?name=silkscreen_0.png!./media/fonts/silkscreen/silkscreen_0.png'))
        .add('silkscreen_fnt', require('file!./media/fonts/silkscreen/silkscreen.fnt'))
        .add('cave', require('file!./media/images/levels/cave.png'))
        .add('containers', require('file!./media/images/containers.png'))
        .add('dungeon', require('file!./media/images/levels/dungeon.png'))
        .add('hero', require('file!./media/images/hero.png'))
        .add('hero_armor', require('file!./media/images/hero-armor.png'))
        .add('items', require('file!./media/images/items.png'))
        .add('mob_bear', require('file!./media/images/mobs/bear.png'))
        .add('mob_blue_slime', require('file!./media/images/mobs/blue-slime.png'))
        .add('mob_orc', require('file!./media/images/mobs/orc.png'))
        .add('mob_skeleton', require('file!./media/images/mobs/skeleton.png'))
        .add('mob_zombie', require('file!./media/images/mobs/zombie.png'))
        .add('weapons', require('file!./media/images/weapons.png'))
        .add('woodland', require('file!./media/images/levels/woodland.png'))
        .add('world', require('file!./media/images/world.png'))
        .add('gui', require('file!./media/images/gui.png'))
        .add('magic_spells', require('file!./media/images/magic_spells.png'))
        .add('particles', require('file!./media/images/particles.png'))
        .on('progress', (loader, resource) => {
          //console.log(resource.name);
        })
        .load((imageLoader, imageResources) => {

          this._createHeroTextures(imageResources['hero'].data, textureResources['hero']);

          const em = this._entityManager;

          em.add(EntityFactory.buildMainMenuEntity(imageResources))
            .add(EntityFactory.buildInventoryEntity(imageResources))
            .add(EntityFactory.buildSpellBookEntity(imageResources))
            .add(EntityFactory.buildLevelGui(imageResources));

          em.mobTemplateEntities[Const.Mob.Bear] = EntityFactory.buildMob(Const.Mob.Bear, imageResources, mobResources);
          em.mobTemplateEntities[Const.Mob.BlueSlime] = EntityFactory.buildMob(Const.Mob.BlueSlime, imageResources, mobResources);
          em.mobTemplateEntities[Const.Mob.Orc] = EntityFactory.buildMob(Const.Mob.Orc, imageResources, mobResources);
          em.mobTemplateEntities[Const.Mob.Skeleton] = EntityFactory.buildMob(Const.Mob.Skeleton, imageResources, mobResources);
          //em.mobTemplateEntities[Const.Mob.Zombie] = EntityFactory.buildMobZombieEntity(imageResources);

          em.weaponTemplateEntities[Const.WeaponType.BearBite] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.BearBite][Const.WeaponMaterial.Flesh] = EntityFactory.buildWeapon(Const.WeaponType.BearBite, Const.WeaponMaterial.Flesh, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.BlueSlimePunch] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.BlueSlimePunch][Const.WeaponMaterial.Flesh] = EntityFactory.buildWeapon(Const.WeaponType.BlueSlimePunch, Const.WeaponMaterial.Flesh, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.Bow] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.Bow][Const.WeaponMaterial.Wood] = EntityFactory.buildWeapon(Const.WeaponType.Bow, Const.WeaponMaterial.Wood, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.Staff] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.Staff][Const.WeaponMaterial.Wood] = EntityFactory.buildWeapon(Const.WeaponType.Staff, Const.WeaponMaterial.Wood, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.Sword] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.Sword][Const.WeaponMaterial.Iron] = EntityFactory.buildWeapon(Const.WeaponType.Sword, Const.WeaponMaterial.Iron, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.ZombiePunch] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.ZombiePunch][Const.WeaponMaterial.Flesh] = EntityFactory.buildWeapon(Const.WeaponType.ZombiePunch, Const.WeaponMaterial.Flesh, imageResources);
          em.weaponTemplateEntities[Const.WeaponType.Axe] = Object.create(null);
          em.weaponTemplateEntities[Const.WeaponType.Axe][Const.WeaponMaterial.Iron] = EntityFactory.buildWeapon(Const.WeaponType.Axe, Const.WeaponMaterial.Iron, imageResources);

          em.projectileTemplateEntities[Const.Projectile.Arrow] = EntityFactory.buildProjectile(Const.Projectile.Arrow, imageResources);
          em.projectileTemplateEntities[Const.Projectile.Fireball] = EntityFactory.buildProjectile(Const.Projectile.Fireball, imageResources);
          em.projectileTemplateEntities[Const.Projectile.IceShard] = EntityFactory.buildProjectile(Const.Projectile.IceShard, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Robe] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Robe][Const.ArmorMaterial.Cloth] = EntityFactory.buildHeroArmor(Const.ArmorType.Robe, Const.ArmorMaterial.Cloth, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Tunic] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Tunic][Const.ArmorMaterial.Leather] = EntityFactory.buildHeroArmor(Const.ArmorType.Tunic, Const.ArmorMaterial.Leather, imageResources);

          em.armorTemplateEntities[Const.ArmorType.ChainMail] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.ChainMail][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmor(Const.ArmorType.ChainMail, Const.ArmorMaterial.Iron, imageResources);

          em.armorTemplateEntities[Const.ArmorType.PlateMail] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.PlateMail][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmor(Const.ArmorType.PlateMail, Const.ArmorMaterial.Iron, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Shield] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Wood] = EntityFactory.buildHeroArmor(Const.ArmorType.Shield, Const.ArmorMaterial.Wood, imageResources);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmor(Const.ArmorType.Shield, Const.ArmorMaterial.Iron, imageResources);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Steel] = EntityFactory.buildHeroArmor(Const.ArmorType.Shield, Const.ArmorMaterial.Steel, imageResources);

          em.containerTemplateEntities[Const.Container.WoodChest] = EntityFactory.buildContainerWoodChestTemplateEntity(imageResources);

          em.itemTemplateEntities[Const.Item.HealingPotion] = EntityFactory.buildItemHealingPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MagicPotion] = EntityFactory.buildItemMagicPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MaxHpUpPotion] = EntityFactory.buildItemHpMaxUpPotionEntity(imageResources);
          
          em.magicSpellTemplateEntities[Const.MagicSpell.Fireball] = EntityFactory.buildMagicSpell(Const.MagicSpell.Fireball, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.Heal] = EntityFactory.buildMagicSpell(Const.MagicSpell.Heal, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.IceShard] = EntityFactory.buildMagicSpell(Const.MagicSpell.IceShard, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.LightningBolt] = EntityFactory.buildMagicSpell(Const.MagicSpell.LightningBolt, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.Charge] = EntityFactory.buildMagicSpell(Const.MagicSpell.Charge, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.MultiArrow] = EntityFactory.buildMagicSpell(Const.MagicSpell.MultiArrow, imageResources);

          em.heroEntity = EntityFactory.buildHero(imageResources);

          this._loadMobWeaponMap(mobResources);

          const LevelCap = 20;

          const levelEnt = new Entity(Const.EntityId.HeroLevelTable);

          for (let i = 1; i <= LevelCap; ++i) {
            const expComp = new ExperienceComponent(i, ExperienceComponent.levelToPoints(i));
            levelEnt.add(expComp);
          }

          const worldWidth = 1;
          const worldHeight = 1;

          em.worldEntity = EntityFactory.buildWorldEntity(worldWidth, worldHeight, imageResources);
          const worldMapComp = em.worldEntity.get('WorldMapComponent');

          em.add(EntityFactory.buildWorldMapGuiEntity(imageResources));

          em.add(EntityFactory.buildVictorySplashEntity(imageResources))
            .add(EntityFactory.buildDefeatSplashEntity(imageResources));

          const characterClasses = this._buildCharacterClasses(em);

          const characterClassListCtrl = EntityFactory.buildListControl();
          em.add(characterClassListCtrl);
          em.add(EntityFactory.buildCharacterCreationGui(imageResources, characterClassListCtrl, characterClasses));

          em.add(EntityFactory.buildAbilitiesGui(imageResources));



          //TODO: must lazily call buildRandomLevel. Calling repeatedly here is too slow and could cause browser to complain.

          let firstLevelEnt;

          for (let y = 0; y < worldHeight; ++y) {

            for (let x = 0; x < worldWidth; ++x) {

              const i = (y * worldHeight) + x;

              const isFinalLevel = (i === (worldWidth * worldHeight - 1));

              const levelEntity = EntityFactory.buildRandomLevel(i, levelResources, imageResources, isFinalLevel);

              em.add(levelEntity);

              worldMapComp.worldData[y][x].levelEntityId = levelEntity.id;

              if (i === 0) {
                firstLevelEnt = levelEntity;
              }

            }

          }

          /*for (const worldLevelEntity of worldLevelEntities) {

           em.add(worldLevelEntity);

           const gatewayComponents = worldLevelEntity.getAll('GatewayComponent');

           for (const gatewayComponent of gatewayComponents) {

           const toLevelName = gatewayComponent.toLevelName;

           if (toLevelName.startsWith('dungeon-')) {
           em.add(EntityFactory.buildDungeonEntity(gatewayComponent, levelResources, imageResources));
           } else if (toLevelName.startsWith('cave-')) {
           em.add(EntityFactory.buildCaveEntity(gatewayComponent, levelResources, imageResources));
           }

           }

           }*/


          const sm = this._screenManager;
          sm.add(new MainMenuScreen());

          //sm.add(new WorldScreen());

          //em.currentLevelEntity = firstLevelEnt;

          //sm.add(new LevelScreen());

          //sm.add(new FinalScreen(Const.FinalGameState.Victory));

          Line.setupPool(1000);
          Particle.setupPool(2000);
          Vector.setupPool(1000);


          this._game = new Game(sm);
          this._game.start();

        });

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

    const lightningMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.LightningMagic, lightningBolt /* more lightning! */);
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

    const archer = EntityFactory.buildCharacterClass(Const.CharacterClass.Archer,
                                                     [ archerSkills ],
                                                     [ woodBow ],
                                                     [ leatherTunic ],
                                                     [ starterHealingPotion ],
                                                     );
    em.add(archer);

    const warrior = EntityFactory.buildCharacterClass(Const.CharacterClass.Warrior,
                                                      [ warriorSkills ],
                                                      [ ironSword ],
                                                      [ ironChainMail, woodShield ],
                                                      [ starterHealingPotion ],
                                                      );
    em.add(warrior);

    const wizard = EntityFactory.buildCharacterClass(Const.CharacterClass.Wizard,
                                                     [ fireMagic, iceMagic, lightningMagic ],
                                                     [ woodStaff ],
                                                     [ clothRobe ],
                                                     [ starterHealingPotion ],
                                                     );
    em.add(wizard);

    const boundingBox1 = new Entity();
    em.add(boundingBox1);

    const classes = [ archer, warrior, wizard ];

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

        _.forOwn(toReplaceColor, (val, key) => {

          const potential = ColorUtils.hexToRgb(parseInt(val, 16));

          if (px.r === potential.r && px.g === potential.g && px.b === potential.b && px.a === potential.a) {

            replaced = true;

            for (let i = 0; i < replacementColorGroups.length; ++i) {

              const rgb = ColorUtils.hexToRgb(parseInt(replacementColorGroups[i][key], 16));

              CanvasUtils.setPixel(imageData, x + (i * 16), y, rgb.r, rgb.g, rgb.b);

            }

          }

        });

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

    _.forOwn(mobResources, (o) => {
      MobMap.MobWeaponMap[o.id] = o.weapon;
    });

  }

}