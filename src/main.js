import * as Const from './const';
import * as EntityFactory from './entity-factory';
import _ from 'lodash';
import EntityManager from './entity-manager';
import FinalScreen from './screens/final-screen';
import Game from './game';
import Input from './input';
import LevelScreen from './screens/level-screen';
import MainMenuScreen from './screens/main-menu-screen';
import Pixi from 'pixi.js';
import ScreenManager from './screen-manager';
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

    Pixi.utils._saidHello = true;
    Pixi.SCALE_MODES.DEFAULT = Pixi.SCALE_MODES.NEAREST;

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

    const levelResources = Object.create(null);
    levelResources['cave'] = require('./data/resource-descriptions/cave.json');
    levelResources['dungeon'] = require('./data/resource-descriptions/dungeon.json');
    levelResources['woodland'] = require('./data/resource-descriptions/woodland.json');
    levelResources['cave_level'] = require('./data/level-descriptions/cave-level.json');
    levelResources['dungeon_level'] = require('./data/level-descriptions/dungeon-level.json');
    levelResources['level_0'] = require('./data/level-descriptions/level-0.json');
    levelResources['level_1'] = require('./data/level-descriptions/level-1.json');

    Pixi.loader
        .add('silkscreen_img', require('file?name=silkscreen_0.png!./media/fonts/silkscreen/silkscreen_0.png'))
        .add('silkscreen_fnt', require('file!./media/fonts/silkscreen/silkscreen.fnt'))
        .add('cave', require('file!./media/images/levels/cave.png'))
        .add('containers', require('file!./media/images/containers.png'))
        .add('dungeon', require('file!./media/images/levels/dungeon.png'))
        .add('hero', require('file!./media/images/hero.png'))
        .add('hero_armor', require('file!./media/images/armor/hero-armor.png'))
        .add('items', require('file!./media/images/items.png'))
        .add('level_gui', require('file!./media/images/levels/level-gui.png'))
        .add('mob_blue_slime', require('file!./media/images/mobs/blue-slime.png'))
        .add('mob_orc', require('file!./media/images/mobs/orc.png'))
        .add('mob_skeleton', require('file!./media/images/mobs/skeleton.png'))
        .add('mob_zombie', require('file!./media/images/mobs/zombie.png'))
        .add('projectiles', require('file!./media/images/weapons/projectiles.png'))
        .add('weapons', require('file!./media/images/weapons/weapons.png'))
        .add('woodland', require('file!./media/images/levels/woodland.png'))
        .add('world', require('file!./media/images/world.png'))
        .add('screen_gui', require('file!./media/images/dialog_gui.png'))
        .add('dialog_gui', require('file!./media/images/dialog_gui.png'))
        .add('magic_spells', require('file!./media/images/magic_spells.png'))
        .on('progress', (loader, resource) => {
          //console.log(resource.name);
        })
        .load((imageLoader, imageResources) => {

          const em = this._entityManager;

          em.add(EntityFactory.buildMainMenuEntity(imageResources))
            .add(EntityFactory.buildInventoryEntity(imageResources))
            .add(EntityFactory.buildSpellBookEntity(imageResources))
            .add(EntityFactory.buildLevelGuiEntity(imageResources));

          em.mobTemplateEntities[Const.Mob.BlueSlime] = EntityFactory.buildMobBlueSlimeEntity(imageResources);
          em.mobTemplateEntities[Const.Mob.Orc] = EntityFactory.buildMobOrcEntity(imageResources);
          em.mobTemplateEntities[Const.Mob.Skeleton] = EntityFactory.buildMobSkeletonEntity(imageResources);
          em.mobTemplateEntities[Const.Mob.Zombie] = EntityFactory.buildMobZombieEntity(imageResources);

          em.weaponTemplateEntities[Const.Weapon.Axe] = EntityFactory.buildWeaponAxeEntity();
          em.weaponTemplateEntities[Const.Weapon.BlueSlimePunch] = EntityFactory.buildWeaponBlueSlimePunchEntity();
          em.weaponTemplateEntities[Const.Weapon.Bow] = EntityFactory.buildWeaponBowEntity(imageResources);
          em.weaponTemplateEntities[Const.Weapon.Sword] = EntityFactory.buildWeaponSwordEntity(imageResources);
          em.weaponTemplateEntities[Const.Weapon.ZombiePunch] = EntityFactory.buildWeaponZombiePunchEntity();

          em.projectileTemplateEntities[Const.Projectile.Arrow] = EntityFactory.buildProjectileEntity(Const.Projectile.Arrow, imageResources);
          em.projectileTemplateEntities[Const.Projectile.Fireball] = EntityFactory.buildProjectileEntity(Const.Projectile.Fireball, imageResources);
          em.projectileTemplateEntities[Const.Projectile.IceShard] = EntityFactory.buildProjectileEntity(Const.Projectile.IceShard, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Robe] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Robe][Const.ArmorMaterial.Cloth] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.Robe, Const.ArmorMaterial.Cloth, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Tunic] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Tunic][Const.ArmorMaterial.Leather] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.Tunic, Const.ArmorMaterial.Leather, imageResources);

          em.armorTemplateEntities[Const.ArmorType.ChainMail] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.ChainMail][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.ChainMail, Const.ArmorMaterial.Iron, imageResources);

          em.armorTemplateEntities[Const.ArmorType.PlateMail] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.PlateMail][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.PlateMail, Const.ArmorMaterial.Iron, imageResources);

          em.armorTemplateEntities[Const.ArmorType.Shield] = Object.create(null);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Wood] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.Shield, Const.ArmorMaterial.Wood, imageResources);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Iron] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.Shield, Const.ArmorMaterial.Iron, imageResources);
          em.armorTemplateEntities[Const.ArmorType.Shield][Const.ArmorMaterial.Steel] = EntityFactory.buildHeroArmorEntity(Const.ArmorType.Shield, Const.ArmorMaterial.Steel, imageResources);

          em.containerTemplateEntities[Const.Container.WoodChest] = EntityFactory.buildContainerWoodChestTemplateEntity(imageResources);

          em.itemTemplateEntities[Const.Item.HealingPotion] = EntityFactory.buildItemHealingPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MagicPotion] = EntityFactory.buildItemMagicPotionEntity(imageResources);
          em.itemTemplateEntities[Const.Item.MaxHpUpPotion] = EntityFactory.buildItemHpMaxUpPotionEntity(imageResources);
          
          em.magicSpellTemplateEntities[Const.MagicSpell.Fireball] = EntityFactory.buildMagicSpellEntity(Const.MagicSpell.Fireball, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.Heal] = EntityFactory.buildMagicSpellEntity(Const.MagicSpell.Heal, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.IceShard] = EntityFactory.buildMagicSpellEntity(Const.MagicSpell.IceShard, imageResources);
          em.magicSpellTemplateEntities[Const.MagicSpell.LightningBolt] = EntityFactory.buildMagicSpellEntity(Const.MagicSpell.LightningBolt, imageResources);

          const sgMagicSpellFireball = em.buildFromMagicSpellTemplate(Const.MagicSpell.Fireball);
          em.add(sgMagicSpellFireball);

          const sgFireMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.FireMagic,
                                                            sgMagicSpellFireball
                                                            /* add more fire spells */);
          em.add(sgFireMagic);

          const sgMagicSpellIceShard = em.buildFromMagicSpellTemplate(Const.MagicSpell.IceShard);
          em.add(sgMagicSpellIceShard);

          const sgIceMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.IceMagic,
                                                           sgMagicSpellIceShard
                                                           /* more ice spells */);
          em.add(sgIceMagic);

          const sgMagicSpellLightningBolt = em.buildFromMagicSpellTemplate(Const.MagicSpell.LightningBolt);
          em.add(sgMagicSpellLightningBolt);

          const sgLightningMagic = EntityFactory.buildSkillGroup(Const.SkillGroup.LightningMagic,
                                                                 sgMagicSpellLightningBolt
                                                                 /* more lightning! */);

          em.add(sgLightningMagic);

          const heroBowEntity = em.buildFromWeaponTemplate(Const.Weapon.Bow);
          em.add(heroBowEntity);

          const heroSwordEntity = em.buildFromWeaponTemplate(Const.Weapon.Sword);
          em.add(heroSwordEntity);

          const heroHealingPotionEntity = em.buildFromItemTemplate(Const.Item.HealingPotion);
          em.add(heroHealingPotionEntity);

          const heroEntity = EntityFactory.buildHeroEntity(imageResources);
          em.heroEntity = heroEntity;

          //heroEntity.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = heroBowEntity.id;

          //.//.//.//.//
          const heroStatComps = heroEntity.getAll('StatisticComponent');
          _.find(heroStatComps, c => c.name === Const.Statistic.HitPoints).currentValue -= 15;
          _.find(heroStatComps, c => c.name === Const.Statistic.MagicPoints).currentValue -= 13;
          //.//.//.//.//

          const heroArmor1 = em.buildFromArmorTemplate(Const.ArmorType.Robe, Const.ArmorMaterial.Cloth);
          em.add(heroArmor1);
          const heroArmor2 = em.buildFromArmorTemplate(Const.ArmorType.Tunic, Const.ArmorMaterial.Leather);
          em.add(heroArmor2);
          const heroArmor3 = em.buildFromArmorTemplate(Const.ArmorType.ChainMail, Const.ArmorMaterial.Iron);
          em.add(heroArmor3);
          const heroArmor4 = em.buildFromArmorTemplate(Const.ArmorType.PlateMail, Const.ArmorMaterial.Iron);
          em.add(heroArmor4);
          const heroArmor5 = em.buildFromArmorTemplate(Const.ArmorType.Shield, Const.ArmorMaterial.Wood);
          em.add(heroArmor5);
          const heroArmor6 = em.buildFromArmorTemplate(Const.ArmorType.Shield, Const.ArmorMaterial.Iron);
          em.add(heroArmor6);
          const heroArmor7 = em.buildFromArmorTemplate(Const.ArmorType.Shield, Const.ArmorMaterial.Steel);
          em.add(heroArmor7);

          //heroEntity.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId = heroArmor1.id;

          const heroInvEntRefComps = _.filter(heroEntity.getAll('EntityReferenceComponent'), c => c.typeId === Const.InventorySlot.Backpack);
          heroInvEntRefComps[0].entityId = heroSwordEntity.id;
          heroInvEntRefComps[1].entityId = heroHealingPotionEntity.id;
          heroInvEntRefComps[2].entityId = heroArmor2.id;
          heroInvEntRefComps[3].entityId = heroArmor3.id;
          heroInvEntRefComps[4].entityId = heroArmor4.id;
          heroInvEntRefComps[5].entityId = heroArmor5.id;
          heroInvEntRefComps[6].entityId = heroArmor6.id;
          heroInvEntRefComps[7].entityId = heroArmor7.id;

          const heroFireballSpellEntity = em.buildFromMagicSpellTemplate(Const.MagicSpell.Fireball);
          em.add(heroFireballSpellEntity);

          const heroIceShardSpellEntity = em.buildFromMagicSpellTemplate(Const.MagicSpell.IceShard);
          em.add(heroIceShardSpellEntity);

          const heroHealSpellEntity = em.buildFromMagicSpellTemplate(Const.MagicSpell.Heal);
          em.add(heroHealSpellEntity);

          heroEntity.get('EntityReferenceComponent', c => c.typeId === Const.MagicSpellSlot.Memory).entityId = heroHealSpellEntity.id;

          const heroSpellBookEntRefComps = _.filter(heroEntity.getAll('EntityReferenceComponent'), c => c.typeId === Const.MagicSpellSlot.SpellBook);
          heroSpellBookEntRefComps[0].entityId = heroFireballSpellEntity.id;
          heroSpellBookEntRefComps[1].entityId = heroIceShardSpellEntity.id;

          const worldWidth = 3;
          const worldHeight = 3;

          em.worldEntity = EntityFactory.buildWorldEntity(worldWidth, worldHeight, imageResources);
          const worldMapComp = em.worldEntity.get('WorldMapComponent');

          em.add(EntityFactory.buildWorldMapGuiEntity(imageResources));

          em.add(EntityFactory.buildVictorySplashEntity(imageResources))
            .add(EntityFactory.buildDefeatSplashEntity(imageResources));

          const archer = EntityFactory.buildCharacterClass(Const.CharacterClass.Archer);
          const warrior = EntityFactory.buildCharacterClass(Const.CharacterClass.Warrior);
          const wizard = EntityFactory.buildCharacterClass(Const.CharacterClass.Wizard, sgFireMagic, sgIceMagic, sgLightningMagic);

          em.add(archer)
            .add(warrior)
            .add(wizard);

          const characterClassListCtrl = EntityFactory.buildListControl();
          em.add(characterClassListCtrl);
          em.add(EntityFactory.buildCharacterCreationGui(imageResources, characterClassListCtrl, [ archer, warrior, wizard ]));

          em.add(EntityFactory.buildAbilitiesGui(imageResources));


          let firstLevelEnt;

          for (let y = 0; y < worldHeight; ++y) {

            for (let x = 0; x < worldWidth; ++x) {

              const i = (y * worldHeight) + x;

              const isFinalLevel = (i === (worldWidth * worldHeight - 1));

              const levelEntity = EntityFactory.buildRandomLevelEntity(i, levelResources, imageResources, isFinalLevel);

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

          em.currentLevelEntity = firstLevelEnt;

          const sm = this._screenManager;
          sm.add(new MainMenuScreen());
          //sm.add(new WorldScreen());
          //sm.add(new LevelScreen());
          //sm.add(new FinalScreen(Const.FinalGameState.Victory));

          this._game = new Game(sm);
          this._game.start();

        });

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

}