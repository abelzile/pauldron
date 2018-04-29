'use strict';
import * as CanvasUtils from './utils/canvas-utils';
import * as ColorUtils from './utils/color-utils';
import * as Const from './const';
import * as EntityFactory from './entity-factory';
import * as Pixi from 'pixi.js';
import ArmorEntityFactory from './factories/armor-entity-factory';
import Circle from './circle';
import ContainerEntityFactory from './factories/container-entity-factory';
import Entity from './entity';
import EntityManager from './entity-manager';
import EntityReferenceComponent from './components/entity-reference-component';
import ExperienceComponent from './components/experience-component';
import Game from './game';
import Input from './input';
import ItemEntityFactory from './factories/item-entity-factory';
import LevelEntityFactory from './factories/level-entity-factory';
import Line from './line';
import MagicSpellEntityFactory from './factories/magic-spell-entity-factory';
import MainMenuScreen from './screens/main-menu-screen';
import MobEntityFactory from './factories/mob-entity-factory';
import MoneyEntityFactory from './factories/money-entity-factory';
import Particle from './particles/particle';
import ParticleEmitterFactory from './factories/particle-emitter-factory';
import ProjectileEntityFactory from './factories/projectile-entity-factory';
import ScreenManager from './screen-manager';
import Vector from './vector';
import WeaponEntityFactory from './factories/weapon-entity-factory';
import WorldScreen from './screens/world-screen';
import StatisticComponent from './components/statistic-component';

export default class Main {
  constructor() {
    this._game = null;
    this._entityManager = null;
    this._screenManager = null;
    this._renderer = null;
    this._input = null;

    Pixi.utils.skipHello();
    Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST;
  }

  go() {
    this._setupPools();

    this._renderer = new Pixi.WebGLRenderer(1280, 720, {
      transparent: false,
      roundPixels: true
    });
    this._renderer.backgroundColor = Const.Color.Black;
    this._renderer.globalScale = 3;
    this._renderer.tilePxSize = 16;

    const canvas = document.body.appendChild(this._renderer.view);
    canvas.addEventListener('contextmenu', this.contextMenuHandler, true);

    const commonLevelData = require('./data/levels/common.json');

    const levelObj = this._importDataFiles(
      require.context('./data/levels/', true, /^(?!.*(common)).*json$/),
      'resourceName'
    );
    const levelData = Object.keys(levelObj)
      .map(key => Object.assign(levelObj[key], commonLevelData))
      .reduce((acc, val) => {
        acc[val.resourceName] = val;
        return acc;
      }, Object.create(null));
    const weaponData = this._importDataFiles(require.context('./data/weapons/', true, /\.json$/), 'id');
    const armorData = this._importDataFiles(require.context('./data/armor/', true, /\.json$/), 'id');
    const projectileData = this._importDataFiles(require.context('./data/projectiles/', true, /\.json$/), 'id');
    const mobData = this._importDataFiles(require.context('./data/mobs/', true, /\.json$/), 'id');
    const magicSpellData = this._importDataFiles(require.context('./data/magic-spells/', true, /\.json$/), 'id');
    const itemData = this._importDataFiles(require.context('./data/items/', true, /\.json$/), 'id');
    const containerData = this._importDataFiles(require.context('./data/containers/', true, /\.json$/), 'id');
    const moneyData = this._importDataFiles(require.context('./data/money/', true, /\.json$/), 'id');

    const lootTypeDict = Object.create(null);
    lootTypeDict[Const.LootType.Healing] = [{ id: 'healing_potion', min: 1, max: 5 }];

    const containerDropTypeLootDict = Object.create(null);
    containerDropTypeLootDict[Const.ContainerDropType.Common] = [{ id: Const.LootType.Healing, weight: 1 }];

    // will have to come up with a way of keeping a container's/mob's loot level once level is beaten,
    // because we don't want player to come back at a much higher level and kill a weak mob and get high level loot'

    Pixi.loader
      .add('silkscreen_img', require('file-loader?name=silkscreen_0.png!./media/fonts/silkscreen/silkscreen_0.png'))
      .add('silkscreen_fnt', require('file-loader!./media/fonts/silkscreen/silkscreen.fnt'))
      .add('cave', require('file-loader!./media/images/levels/cave.png'))
      .add('containers', require('file-loader!./media/images/containers.png'))
      .add('desert', require('file-loader!./media/images/levels/desert.png'))
      .add('dungeon', require('file-loader!./media/images/levels/dungeon.png'))
      .add('equipment', require('file-loader!./media/images/equipment.png'))
      .add('graveyard', require('file-loader!./media/images/levels/graveyard.png'))
      .add('gui', require('file-loader!./media/images/gui.png'))
      .add('hero', require('file-loader!./media/images/hero.png'))
      .add('items', require('file-loader!./media/images/items.png'))
      .add('lava', require('file-loader!./media/images/levels/lava.png'))
      .add('logo', require('file-loader!./media/images/logo.png'))
      .add('magic_spells', require('file-loader!./media/images/magic-spells.png'))
      .add('mob_bat', require('file-loader!./media/images/mobs/bat.png'))
      .add('mob_bear', require('file-loader!./media/images/mobs/bear.png'))
      .add('mob_blue_slime', require('file-loader!./media/images/mobs/blue-slime.png'))
      .add('mob_cyclops', require('file-loader!./media/images/mobs/cyclops.png'))
      .add('mob_forest_troll', require('file-loader!./media/images/mobs/forest-troll.png'))
      .add('mob_frog_folk', require('file-loader!./media/images/mobs/frog-folk.png'))
      .add('mob_goblin', require('file-loader!./media/images/mobs/goblin.png'))
      .add('mob_lich', require('file-loader!./media/images/mobs/lich.png'))
      .add('mob_merchant', require('file-loader!./media/images/mobs/merchant.png'))
      .add('mob_orc', require('file-loader!./media/images/mobs/orc.png'))
      .add('mob_rat_folk', require('file-loader!./media/images/mobs/rat-folk.png'))
      .add('mob_skeleton', require('file-loader!./media/images/mobs/skeleton.png'))
      .add('mob_snake_folk', require('file-loader!./media/images/mobs/snake-folk.png'))
      .add('mob_spider', require('file-loader!./media/images/mobs/spider.png'))
      .add('mob_zombie', require('file-loader!./media/images/mobs/zombie.png'))
      .add('mushroom', require('file-loader!./media/images/levels/mushroom.png'))
      .add('particles', require('file-loader!./media/images/particles.png'))
      .add('ruins', require('file-loader!./media/images/levels/ruins.png'))
      .add('stone', require('file-loader!./media/images/levels/stone.png'))
      .add('swamp', require('file-loader!./media/images/levels/swamp.png'))
      .add('winter', require('file-loader!./media/images/levels/winter.png'))
      .add('woodland', require('file-loader!./media/images/levels/woodland.png'))
      .add('world', require('file-loader!./media/images/world.png'))
      .on('progress', (loader, resource) => {
        //console.log(resource.name);
      })
      .load((textureLoader, textureData) => {
        this._input = new Input(this._renderer);
        const armorEntityFactory = new ArmorEntityFactory(armorData, textureData);
        this._entityManager = new EntityManager(
          new LevelEntityFactory(levelData, textureData),
          armorEntityFactory,
          new ContainerEntityFactory(containerData, textureData),
          new ItemEntityFactory(itemData, textureData),
          new MagicSpellEntityFactory(magicSpellData, textureData),
          new MobEntityFactory(mobData, textureData),
          new ProjectileEntityFactory(projectileData, textureData),
          new WeaponEntityFactory(weaponData, textureData),
          new ParticleEmitterFactory(textureData),
          new MoneyEntityFactory(moneyData, textureData),
          lootTypeDict,
          containerDropTypeLootDict
        );
        this._screenManager = new ScreenManager(this._renderer, this._input, this._entityManager);
        this._entityManager.on('remove', e => {
          this._screenManager.cleanUpEntity(e);
        });

        this._createHeroTextures(textureData['hero'], require('./data/texture-descriptions/hero.json'));



        const worldWidth = 3;
        const worldHeight = 3;

        const em = this._entityManager;
        const characterClasses = this._buildCharacterClasses(em);
        const characterClassListCtrl = EntityFactory.buildListControl();

        em
          .add(EntityFactory.buildHero(textureData))
          .add(EntityFactory.buildWorld(worldWidth, worldHeight, textureData))
          .add(EntityFactory.buildMainMenuGui(textureData))
          .add(EntityFactory.buildInventoryGui(textureData))
          .add(EntityFactory.buildMerchantShopGui(textureData))
          .add(EntityFactory.buildLevelGui(textureData))
          .add(EntityFactory.buildLevelMapGui(textureData))
          .add(EntityFactory.buildWorldMapGui(textureData))
          .add(EntityFactory.buildVictorySplashGui(textureData))
          .add(EntityFactory.buildDefeatSplashGui(textureData))
          .add(characterClassListCtrl)
          .add(EntityFactory.buildCharacterCreationGui(textureData, characterClassListCtrl, characterClasses))
          .add(EntityFactory.buildAbilitiesGui(textureData))
          .add(new Entity(Const.EntityId.DeletedEntityEmitterHolder));

        const LevelCap = 20;
        const levelEnt = new Entity(Const.EntityId.HeroLevelTable);

        for (let i = 1; i <= LevelCap; ++i) {
          const expComp = new ExperienceComponent(i, ExperienceComponent.levelToPoints(i));
          levelEnt.add(expComp);
        }

        const worldMapComp = em.worldEntity;
        worldMapComp.getAll('WorldMapTileComponent')[0].canBeVisited = true;
        /*worldMapComp.getAll('WorldMapTileComponent')[0].isComplete = true;

        worldMapComp.getAll('WorldMapTileComponent')[1].isVisited = true;
        worldMapComp.getAll('WorldMapTileComponent')[1].isComplete = true;

        worldMapComp.getAll('WorldMapTileComponent')[4].isVisited = true;
        worldMapComp.getAll('WorldMapTileComponent')[4].isComplete = true;

        worldMapComp.getAll('WorldMapTileComponent')[5].isVisited = true;
        //worldMapComp.getAll('WorldMapTileComponent')[5].isComplete = true;

        worldMapComp.getAll('WorldMapTileComponent')[7].isVisited = true;
        worldMapComp.getAll('WorldMapTileComponent')[7].isComplete = true;

        worldMapComp.getAll('WorldMapTileComponent')[8].isVisited = true;
        //worldMapComp.getAll('WorldMapTileComponent')[7].isComplete = true;*/

        this._screenManager.add(new MainMenuScreen());
        //this._screenManager.add(new WorldScreen());

        this._game = new Game(this._screenManager);
        this._game.start();
      });
  }

  _importDataFiles(reqCtx, cacheKey) {
    const cacheObj = Object.create(null);
    const keys = reqCtx.keys();
    for (const key of keys) {
      cacheObj[reqCtx(key)[cacheKey]] = reqCtx(key);
    }
    return cacheObj;
  }

  _setupPools() {
    Circle.setupPool(1000);
    Line.setupPool(1000);
    Particle.setupPool(2000);
    Vector.setupPool(1000);
  }

  _buildCharacterClasses(em) {
    const multiArrow = em.buildMagicSpell(Const.MagicSpell.MultiArrow);
    em.add(multiArrow);

    const archerSkills = EntityFactory.buildSkillGroup(
      Const.SkillGroup.ArcherSkills,
      multiArrow
      /*, etc., etc.,*/
    );
    em.add(archerSkills);

    const charge = em.buildMagicSpell(Const.MagicSpell.Charge);
    em.add(charge);

    const warriorSkills = EntityFactory.buildSkillGroup(
      Const.SkillGroup.WarriorSkills,
      charge
      /*, etc. etc. */
    );
    em.add(warriorSkills);

    const fireball = em.buildMagicSpell(Const.MagicSpell.Fireball);
    em.add(fireball);

    const fireMagic = EntityFactory.buildSkillGroup(
      Const.SkillGroup.FireMagic,
      fireball
      /* add more fire spells */
    );
    em.add(fireMagic);

    const iceShard = em.buildMagicSpell(Const.MagicSpell.IceShard);
    em.add(iceShard);

    const iceMagic = EntityFactory.buildSkillGroup(
      Const.SkillGroup.IceMagic,
      iceShard
      /* more ice spells */
    );
    em.add(iceMagic);

    const lightningBolt = em.buildMagicSpell(Const.MagicSpell.LightningBolt);
    em.add(lightningBolt);

    const lightningMagic = EntityFactory.buildSkillGroup(
      Const.SkillGroup.LightningMagic,
      lightningBolt
      /* more lightning! */
    );
    em.add(lightningMagic);

    const woodBow = em.buildWeapon('hero_bow_wood');
    em.add(woodBow);

    const ironSword = em.buildWeapon('hero_sword_iron');
    em.add(ironSword);

    const woodStaff = em.buildWeapon('hero_staff_wood');
    em.add(woodStaff);

    const clothRobe = em.buildArmor('hero_armor_light_cloth');
    em.add(clothRobe);

    const mediumCloth = em.buildArmor('hero_armor_medium_cloth');
    em.add(mediumCloth);

    const heavyLeather = em.buildArmor('hero_armor_heavy_leather');
    em.add(heavyLeather);

    const woodShield = em.buildArmor('hero_shield_wood');
    em.add(woodShield);

    const leatherHelmet = em.buildArmor('hero_helmet_leather');
    em.add(leatherHelmet);

    const leatherBoots1 = em.buildArmor('hero_boots_leather');
    em.add(leatherBoots1);

    const leatherBoots2 = em.buildArmor('hero_boots_leather');
    em.add(leatherBoots2);

    const starterHealingPotion = em.buildItem(Const.Item.HealingPotion);
    em.add(starterHealingPotion);

    const archer = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Archer,
      [archerSkills],
      [woodBow],
      [mediumCloth, leatherBoots1],
      [starterHealingPotion]
    );
    em.add(archer);

    const warrior = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Warrior,
      [warriorSkills],
      [ironSword],
      [heavyLeather, woodShield, leatherHelmet, leatherBoots2],
      [starterHealingPotion]
    );
    em.add(warrior);

    const wizard = EntityFactory.buildCharacterClass(
      Const.CharacterClass.Wizard,
      [fireMagic, iceMagic, lightningMagic],
      [woodStaff],
      [clothRobe],
      [starterHealingPotion]
    );
    em.add(wizard);

    const boundingBox = new Entity();
    em.add(boundingBox);

    const classes = [archer, warrior, wizard];

    return classes.map(c => c.add(new EntityReferenceComponent('bounding_box', boundingBox.id)));
  }

  reset() {
    console.log('reset!');

    this._game = null;

    this._screenManager.removeAll();
    this._screenManager.removeAllListeners();
    this._screenManager = null;

    this._entityManager.removeAllListeners();
    this._entityManager = null;

    this._renderer.view.removeEventListener('contextmenu', this.contextMenuHandler, true);
    this._renderer.destroy(true);
    this._renderer = null;

    this._input.removeAllListeners();
    this._input = null;

    Pixi.loader.reset();

    this.go();
  }

  contextMenuHandler(e) {
    e.preventDefault();
    return false;
  }

  _createHeroTextures(heroImg, heroColor) {
    const heroImgData = heroImg.data;
    const heroColumns = Math.max(heroColor.skins.length, heroColor.hairs.length);
    const heroTextureWidth = heroColumns * Const.TilePixelSize;
    const finalHeroTextureWidth = Math.pow(2, Math.ceil(Math.log(heroTextureWidth) / Math.log(2)));

    let heroCanvas = document.createElement('canvas');
    heroCanvas.width = finalHeroTextureWidth;
    heroCanvas.height = heroImgData.height;

    const ctx = heroCanvas.getContext('2d');
    ctx.drawImage(heroImgData, 0, 0);

    const imageData = ctx.getImageData(0, 0, heroCanvas.width, heroCanvas.height);

    this._replaceTextureColors(imageData, 0, 0, 16, 48, heroColor.skinReplace, heroColor.skins);
    this._replaceTextureColors(imageData, 0, 49, 16, 16, heroColor.hairReplace, heroColor.hairs);
    this._replaceTextureColors(imageData, 0, 64, 16, 48, heroColor.faceReplace, heroColor.skins);

    ctx.putImageData(imageData, 0, 0);

    heroImg.texture.baseTexture.updateSourceImage(heroCanvas.toDataURL());

    heroCanvas = null;
  }

  _replaceTextureColors(imageData, startX, startY, width, height, toReplaceColor, replacementColorGroups) {
    const endY = startY + height;
    const endX = startX + width;

    for (let y = startY; y < endY; ++y) {
      for (let x = startX; x < endX; ++x) {
        let replaced = false;
        const px = CanvasUtils.getPixel(imageData, x, y);

        for (const key of Object.keys(toReplaceColor)) {
          const val = toReplaceColor[key];
          const potential = ColorUtils.hexToRgb(parseInt(val, 16));

          if (px.r === potential.r && px.g === potential.g && px.b === potential.b && px.a === potential.a) {
            replaced = true;

            for (let i = 0; i < replacementColorGroups.length; ++i) {
              const rgb = ColorUtils.hexToRgb(parseInt(replacementColorGroups[i][key], 16));
              CanvasUtils.setPixel(imageData, x + i * 16, y, rgb.r, rgb.g, rgb.b);
            }
          }
        }

        if (!replaced && px.a > 0) {
          // pass through original color.
          for (let i = 0; i < replacementColorGroups.length; ++i) {
            CanvasUtils.setPixel(imageData, x + i * 16, y, px.r, px.g, px.b);
          }
        }
      }
    }
  }
}
