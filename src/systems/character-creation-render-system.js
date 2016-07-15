import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';
import _ from 'lodash';
import Pixi from 'pixi.js';


export default class CharacterCreationRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer, entityManager) {

    super(pixiContainer, renderer);
    
    this._entityManager = entityManager;

    this.HeroScale = 2;

  }
  
  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    const ent = EntityFinders.findCharacterCreationGui(entities);

    this.drawFrame(ent);

    const headings = ent.getAllKeyed('BitmapTextComponent', 'id');
    const mcs = ent.getAll('MovieClipComponent');
    const btns = ent.getAllKeyed('TextButtonComponent', 'id');
    const sprites = ent.getAll('SpriteComponent');
    const entRefs = ent.getAllKeyed('EntityReferenceComponent', 'typeId');

    this._drawHeadings(headings);

    this._drawStartButton(btns);

    const heroBodyMcs = _.filter(mcs, c => c.id && c.id.startsWith('hero_body_'));
    const heroHairMcs = _.filter(mcs, c => c.id && c.id.startsWith('hero_hair_'));

    this._drawHero(heroHairMcs, heroBodyMcs)

    _.sample(heroHairMcs).visible = true;
    _.sample(heroBodyMcs).visible = true;

    this._drawHeroNextPrevButtons(btns, heroHairMcs, heroBodyMcs);

    this._drawRandomHeroButton(sprites, heroBodyMcs);

    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);

    this._drawCharacterClassListCtrl(charClassListCtrl, screenWidth, scale, screenHeight);

    charClassListCtrl.getAll('ListItemComponent')[0].selected = true;

  }

  _drawHeadings(headings) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;
    const halfScreenWidth = screenWidth / 2;
    const fifthScreenHeight = screenHeight / 5;

    const appearanceHeading = headings['select_appearance'];
    appearanceHeading.sprite.align = 'center';
    this.pixiContainer.addChild(appearanceHeading.sprite);
    appearanceHeading.sprite.position.x = (halfScreenWidth - appearanceHeading.sprite.width * scale) / 2 / scale;
    appearanceHeading.sprite.position.y = fifthScreenHeight / scale;

    const classHeading = headings['select_class'];
    classHeading.sprite.align = 'center';
    this.pixiContainer.addChild(classHeading.sprite);
    classHeading.sprite.position.x = ((halfScreenWidth - classHeading.sprite.width * scale) / 2 + halfScreenWidth) / scale;
    classHeading.sprite.position.y = fifthScreenHeight / scale;

  }

  _drawCharacterClassListCtrl(charClassListCtrl) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    const g = charClassListCtrl.get('GraphicsComponent');
    this.pixiContainer.addChild(g.graphics);

    const items = charClassListCtrl.getAll('ListItemComponent');

    const x = ((screenWidth / scale) / 5) * 3;
    let y = (screenHeight / scale) / 3;
    let h = 0;
    let w = 0;

    for (const item of items) {

      const sprite = item.bitmapTextComponent.sprite;
      this.pixiContainer.addChild(sprite);
      sprite.position.x = x;
      sprite.position.y = y;

      y += sprite.height;
      h += sprite.height;

      if (sprite.width > w) {
        w = sprite.width;
      }

    }

  }

  _drawStartButton(allBtns) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    const startBtn = allBtns['start'];
    const sprite = startBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(sprite);
    sprite.position.x = screenWidth / scale - sprite.width - 6;
    sprite.position.y = screenHeight / scale - sprite.height - 6;

  }

  _drawRandomHeroButton(allSprites, heroBodyMcs) {

    const randomHero = _.find(allSprites, c => c.id && c.id === 'randomize_hero');
    const sprite = randomHero.sprite;
    this.pixiContainer.addChild(sprite);
    const heroMc = heroBodyMcs[0].movieClip;
    sprite.position.x = heroMc.position.x + ((heroMc.width - sprite.width) / 2);
    sprite.position.y = heroMc.position.y + heroMc.height + 4;

  }

  _drawHero(heroHairMcs, heroBodyMcs) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;
    const halfScreenWidth = screenWidth / 2;

    const allMcs = [].concat(heroBodyMcs, heroHairMcs);

    for (const c of allMcs) {

      const mc = c.movieClip;
      this.pixiContainer.addChild(mc);
      mc.position.x = (halfScreenWidth - (mc.width * this.HeroScale * scale)) / 2 / scale; //(((halfScreenWidth - (mc.width * scale)) / 2)) / scale;
      mc.position.y = (screenHeight / scale) / 3;
      mc.visible = false;
      mc.scale.set(this.HeroScale);

    }

  }

  _drawHeroNextPrevButtons(allBtns, heroHairMcs, heroBodyMcs) {

    const prevBodyBtn = allBtns['prev_body'];
    const nextBodyBtn = allBtns['next_body'];

    const prevBodyBtnSprite = prevBodyBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(prevBodyBtnSprite);
    prevBodyBtnSprite.position.x = heroBodyMcs[0].movieClip.position.x - prevBodyBtnSprite.width;
    prevBodyBtnSprite.position.y = heroBodyMcs[0].movieClip.position.y + (heroBodyMcs[0].movieClip.height / 2);

    const nextBodyBtnSprite = nextBodyBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(nextBodyBtnSprite);
    nextBodyBtnSprite.position.x = heroBodyMcs[0].movieClip.position.x + heroBodyMcs[0].movieClip.width;
    nextBodyBtnSprite.position.y = prevBodyBtnSprite.position.y;

    const prevHairBtn = allBtns['prev_hair'];
    const nextHairBtn = allBtns['next_hair'];

    const prevHairBtnSprite = prevHairBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(prevHairBtnSprite);
    prevHairBtnSprite.position.x = heroHairMcs[0].movieClip.position.x - prevHairBtnSprite.width;
    prevHairBtnSprite.position.y = heroHairMcs[0].movieClip.position.y;

    const nextHairBtnSprite = nextHairBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(nextHairBtnSprite);
    nextHairBtnSprite.position.x = heroHairMcs[0].movieClip.position.x + heroHairMcs[0].movieClip.width;
    nextHairBtnSprite.position.y = prevHairBtnSprite.position.y;
    
  }

  processEntities(gameTime, entities) {

    const ent = EntityFinders.findCharacterCreationGui(entities);
    const entRefs = ent.getAllKeyed('EntityReferenceComponent', 'typeId');
    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);

    const items = charClassListCtrl.getAll('ListItemComponent');
    const selectedItem = _.find(items, c => c.selected === true);
    const s = selectedItem.bitmapTextComponent.sprite;
    const g = charClassListCtrl.get('GraphicsComponent').graphics;
    g.clear()
     .beginFill(0x0070fc)
     .drawRect(s.position.x, s.position.y, s.width, s.height)
     .endFill();

  }

  unload(entities) {
  }


}