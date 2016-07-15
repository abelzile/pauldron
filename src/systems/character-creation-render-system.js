import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';
import _ from 'lodash';


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

    const allMcs = ent.getAll('MovieClipComponent');
    const heroBodyMcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_body_'));
    const heroHairMcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_hair_'));
    const allBtns = ent.getAll('TextButtonComponent');
    const allSprites = ent.getAll('SpriteComponent');
    const entRefs = ent.getAllKeyed('EntityReferenceComponent', 'typeId');

    this._drawStartButton(allBtns);

    this._drawBodies(heroBodyMcs);

    _.sample(heroBodyMcs).visible = true;

    this._drawBodyNextPrevButtons(allBtns, heroBodyMcs);

    this._drawHair(heroHairMcs);

    _.sample(heroHairMcs).visible = true;

    this._drawHairNextPrevButtons(allBtns, heroHairMcs);

    this._drawRandomHeroButton(allSprites, heroBodyMcs);

    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);

    this._drawCharacterClassListCtrl(charClassListCtrl, screenWidth, scale, screenHeight);

    charClassListCtrl.getAll('ListItemComponent')[0].selected = true;

  }

  _drawCharacterClassListCtrl(charClassListCtrl) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    const g = charClassListCtrl.get('GraphicsComponent');
    this.pixiContainer.addChild(g.graphics);

    const items = charClassListCtrl.getAll('ListItemComponent');

    const x = ((screenWidth / scale) / 5) * 3;
    let yStart = (screenHeight / scale) / 3;
    let y = yStart;
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

    const startBtn = _.find(allBtns, c => c.id === 'start');
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

  _drawHair(heroHairMcs) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    _.each(heroHairMcs, c => {

      this.pixiContainer.addChild(c.movieClip);
      c.movieClip.position.set((screenWidth / scale) / 5, (screenHeight / scale) / 3);
      c.visible = false;
      c.movieClip.scale.set(this.HeroScale);

    });

  }

  _drawBodies(heroBodyMcs) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    _.each(heroBodyMcs, c => {

      this.pixiContainer.addChild(c.movieClip);
      c.movieClip.position.set((screenWidth / scale) / 5, (screenHeight / scale) / 3);
      c.visible = false;
      c.movieClip.scale.set(this.HeroScale);

    });

  }

  _drawBodyNextPrevButtons(allBtns, heroBodyMcs) {

    const prevBtn = _.find(allBtns, c => c.id === 'prev_body');
    const nextBtn = _.find(allBtns, c => c.id === 'next_body');

    const prevBtnSprite = prevBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(prevBtnSprite);
    prevBtnSprite.position.x = heroBodyMcs[0].movieClip.position.x - prevBtnSprite.width;
    prevBtnSprite.position.y = heroBodyMcs[0].movieClip.position.y + (heroBodyMcs[0].movieClip.height / 2);

    const nextBtnSprite = nextBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(nextBtnSprite);
    nextBtnSprite.position.x = heroBodyMcs[0].movieClip.position.x + heroBodyMcs[0].movieClip.width;
    nextBtnSprite.position.y = prevBtnSprite.position.y;

  }

  _drawHairNextPrevButtons(allBtns, heroHairMcs) {

    const prevBtn = _.find(allBtns, c => c.id === 'prev_hair');
    const nextBtn = _.find(allBtns, c => c.id === 'next_hair');

    const prevBtnSprite = prevBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(prevBtnSprite);
    prevBtnSprite.position.x = heroHairMcs[0].movieClip.position.x - prevBtnSprite.width;
    prevBtnSprite.position.y = heroHairMcs[0].movieClip.position.y;

    const nextBtnSprite = nextBtn.bitmapTextComponent.sprite;
    this.pixiContainer.addChild(nextBtnSprite);
    nextBtnSprite.position.x = heroHairMcs[0].movieClip.position.x + heroHairMcs[0].movieClip.width;
    nextBtnSprite.position.y = prevBtnSprite.position.y;

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