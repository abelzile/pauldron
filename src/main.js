import * as Const from './const';
import * as EntityFactory from './entity-factory';
import _ from 'lodash';
import EntityManager from './entity-manager';
import Game from './game';
import Input from './input';
import LevelScreen from './screens/level-screen';
import MainMenuScreen from './screens/main-menu-screen';
import Pixi from 'pixi.js';
import ScreenManager from './screen-manager';
import WebFontLoader from 'webfontloader';
import WorldScreen from './screens/world-screen';


export default class Main {

  go() {

    WebFontLoader.load({custom: {families: ['Press Start 2P', 'silkscreennormal']}});
    
    Pixi.utils._saidHello = true;
    Pixi.SCALE_MODES.DEFAULT = Pixi.SCALE_MODES.NEAREST;

    const options = Object.create(null);
    options.transparent = false;
    options.roundPixels = true;

    const renderer = new Pixi.autoDetectRenderer(1280, 720, options);
    renderer.backgroundColor = 0x000000;
    renderer.globalScale = 3;
    renderer.tilePxSize = 16;

    document.body.appendChild(renderer.view);

    const input = new Input(renderer);
    const em = new EntityManager();
    const sm = new ScreenManager(renderer, input, em);
    em.on('entity-manager.remove', (e) => {
      sm.cleanUpEntity(e);
    });

    const levelResources = Object.create(null);
    levelResources['cave'] = require('./data/resource-descriptions/cave.json');
    levelResources['dungeon'] = require('./data/resource-descriptions/dungeon.json');
    levelResources['woodland'] = require('./data/resource-descriptions/woodland.json');
    levelResources['cave_level'] = require('./data/level-descriptions/cave-level.json');
    levelResources['dungeon_level'] = require('./data/level-descriptions/dungeon-level.json');
    levelResources['level_0'] = require('./data/level-descriptions/level-0.json');
    levelResources['level_1'] = require('./data/level-descriptions/level-1.json');

    Pixi.loader
      .add('cave', require('file!./media/images/levels/cave.png'))
      .add('dungeon', require('file!./media/images/levels/dungeon.png'))
      .add('woodland', require('file!./media/images/levels/woodland.png'))
      .add('hero', require('file!./media/images/hero.png'))
      .add('mob_blue_slime', require('file!./media/images/mobs/blue-slime.png'))
      .add('mob_orc', require('file!./media/images/mobs/orc.png'))
      .add('mob_skeleton', require('file!./media/images/mobs/skeleton.png'))
      .add('mob_zombie', require('file!./media/images/mobs/zombie.png'))
      .add('projectiles', require('file!./media/images/weapons/projectiles.png'))
      .add('weapons', require('file!./media/images/weapons/weapons.png'))
      .add('hero_armor', require('file!./media/images/armor/hero-armor.png'))
      .add('containers', require('file!./media/images/containers.png'))
      .add('items', require('file!./media/images/items.png'))
      .add('level_gui', require('file!./media/images/levels/level-gui.png'))
      .add('world', require('file!./media/images/world.png'))
      .on('progress', (loader, resource) => {
        //console.log(resource.name);
      })
      .load((imageLoader, imageResources) => {

        em.add(EntityFactory.buildMainMenuNewGameMenuItemEntity())
          .add(EntityFactory.buildMainMenuContinueMenuItemEntity())
          .add(EntityFactory.buildInventoryEntity())
          .add(EntityFactory.buildLevelGuiEntity(imageResources));

        em.mobTemplateEntities[Const.Mob.BlueSlime] = EntityFactory.buildMobBlueSlimeTemplateEntity(imageResources);
        em.mobTemplateEntities[Const.Mob.Orc] = EntityFactory.buildMobOrcTemplateEntity(imageResources);
        em.mobTemplateEntities[Const.Mob.Skeleton] = EntityFactory.buildMobSkeletonTemplateEntity(imageResources);
        em.mobTemplateEntities[Const.Mob.Zombie] = EntityFactory.buildMobZombieTemplateEntity(imageResources);

        em.weaponTemplateEntities[Const.Weapon.Axe] = EntityFactory.buildWeaponAxeTemplateEntity();
        em.weaponTemplateEntities[Const.Weapon.BlueSlimePunch] = EntityFactory.buildWeaponBlueSlimePunchTemplateEntity();
        em.weaponTemplateEntities[Const.Weapon.Bow] = EntityFactory.buildWeaponBowTemplateEntity(imageResources);
        em.weaponTemplateEntities[Const.Weapon.Sword] = EntityFactory.buildWeaponSwordTemplateEntity(imageResources);
        em.weaponTemplateEntities[Const.Weapon.ZombiePunch] = EntityFactory.buildWeaponZombiePunchTemplateEntity();

        em.projectileTemplateEntities[Const.Projectile.Arrow] = EntityFactory.buildProjectileArrowTemplateEntity(imageResources);

        em.armorTemplateEntities[Const.Armor.Leather] = EntityFactory.buildArmorHeroLeatherTemplateEntity(imageResources);

        em.containerTemplateEntities[Const.Container.WoodChest] = EntityFactory.buildContainerWoodChestTemplateEntity(imageResources);

        em.itemTemplateEntities[Const.Item.HealingPotion] = EntityFactory.buildItemHealingPotionTemplateEntity(imageResources);
        em.itemTemplateEntities[Const.Item.MagicPotion] = EntityFactory.buildItemMagicPotionTemplateEntity(imageResources);
        em.itemTemplateEntities[Const.Item.MaxHpUpPotion] = EntityFactory.buildItemHpMaxUpPotionTemplateEntity(imageResources);

        const heroBowEntity = em.buildFromWeaponTemplate(Const.Weapon.Bow);
        em.add(heroBowEntity);

        const heroSwordEntity = em.buildFromWeaponTemplate(Const.Weapon.Sword);
        em.add(heroSwordEntity);

        const heroArmorEntity = em.buildFromArmorTemplate(Const.Armor.Leather);
        em.add(heroArmorEntity);

        const heroHealingPotionEntity = em.buildFromItemTemplate(Const.Item.HealingPotion);
        em.add(heroHealingPotionEntity);

        const heroEntity = EntityFactory.buildHeroEntity(imageResources);
        heroEntity.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Hand1).entityId = heroBowEntity.id;
        heroEntity.get('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Body).entityId = heroArmorEntity.id;

        const heroInventoryComps = _.filter(heroEntity.getAll('EntityReferenceComponent'), c => c.typeId === Const.InventorySlot.Backpack);
        heroInventoryComps[0].entityId = heroSwordEntity.id;
        heroInventoryComps[1].entityId = heroHealingPotionEntity.id;

        em.heroEntity = heroEntity;

        const worldWidth = 3;
        const worldHeight = 3;

        em.worldEntity = EntityFactory.buildWorld(worldWidth, worldHeight, imageResources);
        const worldMapComp = em.worldEntity.get('WorldMapComponent');

        em.add(EntityFactory.buildWorldMapPointerEntity(imageResources))
          .add(EntityFactory.buildWorldTravelButtonEntity())
          .add(EntityFactory.buildWorldCancelButtonEntity())

        let firstLevelEnt;

        for (let y = 0; y < worldHeight; ++y) {

          for (let x = 0; x < worldWidth; ++x) {

            const i = (y * worldHeight) + x;

            const levelEntity = EntityFactory.buildRandomLevelEntity(i, levelResources, imageResources);

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

        //sm.add(new MainMenuScreen());
        //sm.add(new WorldScreen());
        sm.add(new LevelScreen());



        const game = new Game(sm);
        game.start();

      });

  }

}