import * as _ from 'lodash';
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
import Line from './line';
import MagicSpellEntityFactory from './factories/magic-spell-entity-factory';
import MainMenuScreen from './screens/main-menu-screen';
import MobEntityFactory from './factories/mob-entity-factory';
import Particle from './particles/particle';
import ProjectileEntityFactory from './factories/projectile-entity-factory';
import ScreenManager from './screen-manager';
import Vector from './vector';
import WeaponEntityFactory from './factories/weapon-entity-factory';
import WebFontLoader from 'webfontloader';
import ParticleEmitterFactory from './factories/particle-emitter-factory';

export default class Main {

  constructor() {

    this._game = null;
    this._entityManager = null;
    this._screenManager = null;
    this._renderer = null;
    this._input = null;

    WebFontLoader.load({ custom: { families: ['Press Start 2P', 'silkscreennormal'] } });

    Pixi.utils.skipHello();
    Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST;

    //continue add particle trail emitter to fireball

    /*
    const max = 200;
    let i = max;
    const color1 = 0xfc7400;
    const color2 = 0x400014;
    const frag = document.createDocumentFragment();
    while (i > 0) {

      let el = document.createElement('div');
      el.innerText = '&nbsp;';

      const data = ColorUtils.hexToRgb(ColorUtils.interpolateColors(color1, color2, i / max));
      console.log(data);

      el.style.backgroundColor = 'rgb(' + data.r + ',' + data.g + ',' + data.b + ')';
      el.style.width = '200px';
      el.style.height = '40px';

      frag.appendChild(el);

      i -= 16.6666;

    }

    document.body.appendChild(frag);
    */

  }

  go() {

    this._setupPools();

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

    const levelData = _.keyBy(
      [
        require('./data/levels/cave.json'),
        require('./data/levels/dungeon.json'),
        require('./data/levels/woodland.json'),
      ],
      data => data.resourceName
    );

    const weaponData = _.keyBy(
      [
        require('./data/weapons/axe-iron.json'),
        require('./data/weapons/bow-wood.json'),
        require('./data/weapons/goblin-bow-wood.json'),
        require('./data/weapons/punch-bear.json'),
        require('./data/weapons/punch-blue-slime.json'),
        require('./data/weapons/punch-zombie.json'),
        require('./data/weapons/staff-wood.json'),
        require('./data/weapons/sword-iron.json'),
        require('./data/weapons/punch-forest-troll.json'),
      ],
      data => data.id
    );

    const armorData = _.keyBy(
      [
        require('./data/armor/hero-chain-mail-iron.json'),
        require('./data/armor/hero-plate-mail-iron.json'),
        require('./data/armor/hero-robe-cloth.json'),
        require('./data/armor/hero-shield-iron.json'),
        require('./data/armor/hero-shield-steel.json'),
        require('./data/armor/hero-shield-wood.json'),
        require('./data/armor/hero-tunic-leather.json'),
      ],
      data => data.id
    );

    const projectileData = _.keyBy(
      [
        require('./data/projectiles/arrow.json'),
        require('./data/projectiles/fireball.json'),
        require('./data/projectiles/goblin-arrow.json'),
      ],
      data => data.id
    );

    const mobData = _.keyBy(
      [
        require('./data/mobs/bear.json'),
        require('./data/mobs/blue-slime.json'),
        require('./data/mobs/forest-troll.json'),
        require('./data/mobs/goblin.json'),
        require('./data/mobs/orc.json'),
        require('./data/mobs/skeleton.json'),
        require('./data/mobs/zombie.json'),
        require('./data/mobs/lich.json'),
      ], 
      data => data.id
    );

    const magicSpellData = _.keyBy(
      [
        require('./data/magic-spells/charge.hson'),
        require('./data/magic-spells/fireball.json'),
        require('./data/magic-spells/heal.json'),
        require('./data/magic-spells/ice-shard.json'),
        require('./data/magic-spells/lightning-bolt.json'),
        require('./data/magic-spells/multi-arrow.json'),
      ],
      data => data.id
    );

    const itemData = _.keyBy(
      [
        require('./data/items/healing-potion.json'),
      ],
      data => data.id
    );

    const containerData = _.keyBy(
      [
        require('./data/containers/wood-chest.json'),
      ],
      data => data.id
    );

    Pixi.loader
      .add('silkscreen_img', require('file-loader?name=silkscreen_0.png!./media/fonts/silkscreen/silkscreen_0.png'))
      .add('silkscreen_fnt', require('file-loader!./media/fonts/silkscreen/silkscreen.fnt'))
      .add('cave', require('file-loader!./media/images/levels/cave.png'))
      .add('containers', require('file-loader!./media/images/containers.png'))
      .add('dungeon', require('file-loader!./media/images/levels/dungeon.png'))
      .add('gui', require('file-loader!./media/images/gui.png'))
      .add('hero', require('file-loader!./media/images/hero.png'))
      .add('hero_armor', require('file-loader!./media/images/hero-armor.png'))
      .add('items', require('file-loader!./media/images/items.png'))
      .add('magic_spells', require('file-loader!./media/images/magic-spells.png'))
      .add('mob_bear', require('file-loader!./media/images/mobs/bear.png'))
      .add('mob_blue_slime', require('file-loader!./media/images/mobs/blue-slime.png'))
      .add('mob_forest_troll', require('file-loader!./media/images/mobs/forest-troll.png'))
      .add('mob_goblin', require('file-loader!./media/images/mobs/goblin.png'))
      .add('mob_lich', require('file-loader!./media/images/mobs/lich.png'))
      .add('mob_orc', require('file-loader!./media/images/mobs/orc.png'))
      .add('mob_skeleton', require('file-loader!./media/images/mobs/skeleton.png'))
      .add('mob_zombie', require('file-loader!./media/images/mobs/zombie.png'))
      .add('particles', require('file-loader!./media/images/particles.png'))
      .add('weapons', require('file-loader!./media/images/weapons.png'))
      .add('woodland', require('file-loader!./media/images/levels/woodland.png'))
      .add('world', require('file-loader!./media/images/world.png'))
      .on(
        'progress', (loader, resource) => {
          //console.log(resource.name);
        }
      )
      .load(
        (textureLoader, textureData) => {

          this._input = new Input(this._renderer);
          this._entityManager = new EntityManager(
            new ArmorEntityFactory(armorData, textureData),
            new ContainerEntityFactory(containerData, textureData),
            new ItemEntityFactory(itemData, textureData),
            new MagicSpellEntityFactory(magicSpellData, textureData),
            new MobEntityFactory(mobData, textureData),
            new ProjectileEntityFactory(projectileData, textureData),
            new WeaponEntityFactory(weaponData, textureData),
            new ParticleEmitterFactory(textureData)
          );
          this._screenManager = new ScreenManager(this._renderer, this._input, this._entityManager);
          this._entityManager.on('remove', e => { this._screenManager.cleanUpEntity(e); });

          this._createHeroTextures(textureData['hero'].data, require('./data/texture-descriptions/hero.json'));

          const worldWidth = 3;
          const worldHeight = 3;

          const em = this._entityManager;
          const characterClasses = this._buildCharacterClasses(em);
          const characterClassListCtrl = EntityFactory.buildListControl();

          em.add(EntityFactory.buildHero(textureData))
            .add(EntityFactory.buildWorldEntity(worldWidth, worldHeight, textureData))
            .add(EntityFactory.buildMainMenuEntity(textureData))
            .add(EntityFactory.buildInventoryEntity(textureData))
            .add(EntityFactory.buildLevelGui(textureData))
            .add(EntityFactory.buildLevelMapGui(textureData))
            .add(EntityFactory.buildWorldMapGuiEntity(textureData))
            .add(EntityFactory.buildVictorySplashEntity(textureData))
            .add(EntityFactory.buildDefeatSplashEntity(textureData))
            .add(characterClassListCtrl)
            .add(EntityFactory.buildCharacterCreationGui(textureData, characterClassListCtrl, characterClasses))
            .add(EntityFactory.buildAbilitiesGui(textureData))
            .add(new Entity(Const.EntityId.DeletedEntityEmitterHolder))
            ;

          const levelTypes = ['woodland', 'dungeon'];

          _.forEach(levelTypes, levelType => {
            em.worldLevelTemplateValues[levelType] = {
              data: levelData[levelType],
              texture: textureData[levelType].texture
            };
          });

          const LevelCap = 20;
          const levelEnt = new Entity(Const.EntityId.HeroLevelTable);

          for (let i = 1; i <= LevelCap; ++i) {
            const expComp = new ExperienceComponent(i, ExperienceComponent.levelToPoints(i));
            levelEnt.add(expComp);
          }

          const worldMapComp = em.worldEntity.get('WorldMapComponent');
          worldMapComp.getWorldDataByNum(0).isVisited = true;

          this._screenManager.add(new MainMenuScreen());

          this._game = new Game(this._screenManager);
          this._game.start();

        }
      );

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

    const archerSkills = EntityFactory.buildSkillGroup(Const.SkillGroup.ArcherSkills, multiArrow /*, etc., etc.,*/);
    em.add(archerSkills);

    const charge = em.buildMagicSpell(Const.MagicSpell.Charge);
    em.add(charge);

    const warriorSkills = EntityFactory.buildSkillGroup(Const.SkillGroup.WarriorSkills, charge /*, etc. etc. */);
    em.add(warriorSkills);

    const fireball = em.buildMagicSpell(Const.MagicSpell.Fireball);
    em.add(fireball);

    const fireMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.FireMagic, fireball /* add more fire spells */);
    em.add(fireMagic);

    const iceShard = em.buildMagicSpell(Const.MagicSpell.IceShard);
    em.add(iceShard);

    const iceMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.IceMagic, iceShard /* more ice spells */);
    em.add(iceMagic);

    const lightningBolt = em.buildMagicSpell(Const.MagicSpell.LightningBolt);
    em.add(lightningBolt);

    const lightningMagic = EntityFactory.buildSkillGroup(
      Const.SkillGroup.LightningMagic,
      lightningBolt
      /* more lightning! */
    );
    em.add(lightningMagic);

    const woodBow = em.buildWeapon('bow_wood');
    em.add(woodBow);

    const ironSword = em.buildWeapon('sword_iron');
    em.add(ironSword);

    const woodStaff = em.buildWeapon('staff_wood');
    em.add(woodStaff);

    const clothRobe = em.buildHeroArmor('hero_robe_cloth');
    em.add(clothRobe);

    const leatherTunic = em.buildHeroArmor('hero_tunic_leather');
    em.add(leatherTunic);

    const ironChainMail = em.buildHeroArmor('hero_chain_mail_iron');
    em.add(ironChainMail);

    const woodShield = em.buildHeroArmor('hero_shield_wood');
    em.add(woodShield);

    const starterHealingPotion = em.buildItem(Const.Item.HealingPotion);
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

}