import * as EntityFinders from '../entity-finders';
import DialogRenderSystem from './dialog-render-system';
import _ from 'lodash';
import * as Pixi from 'pixi.js';


export default class CharacterCreationRenderSystem extends DialogRenderSystem {

  constructor(pixiContainer, renderer, entityManager) {

    super(pixiContainer, renderer);

    this.HeroScale = 2;

    this._entityManager = entityManager;

  }
  
  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const gui = EntityFinders.findCharacterCreationGui(entities);

    this.drawDialogHeader(gui.get('DialogHeaderComponent'));

    const headings = gui.getAllKeyed('BitmapTextComponent', 'id');
    const mcs = gui.getAll('MovieClipComponent');
    const textBtns = gui.getAllKeyed('TextButtonComponent', 'id');
    const spriteBtns = gui.getAllKeyed('SpriteButtonComponent', 'id');
    const entRefs = gui.getAllKeyed('EntityReferenceComponent', 'typeId');

    this._drawHeadings(headings);

    this._drawNextButton(textBtns);

    const heroBodyMcs = _.filter(mcs, c => c.id && c.id.startsWith('body_standing_'));
    const heroHairMcs = _.filter(mcs, c => c.id && c.id.startsWith('hair_'));
    const heroNeutralFaceMcs = _.filter(mcs, c => c.id && c.id.startsWith('face_neutral_'));

    this._drawHero(heroHairMcs, heroBodyMcs, heroNeutralFaceMcs);

    _.sample(heroHairMcs).visible = true;
    _.sample(heroBodyMcs).visible = true;
    const idx = _.findIndex(heroBodyMcs, c => c.visible === true);
    heroNeutralFaceMcs[idx].visible = true;

    this._drawHeroNextPrevButtons(textBtns, heroHairMcs, heroBodyMcs);

    this._drawRandomHeroButton(spriteBtns, heroBodyMcs);

    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);

    this._drawCharacterClassListCtrl(charClassListCtrl);

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
    const halfScreenWidth = screenWidth / 2;

    const g = charClassListCtrl.get('GraphicsComponent');
    this.pixiContainer.addChild(g.graphics);

    const items = charClassListCtrl.getAll('ListItemComponent');

    let y = screenHeight / scale / 3;

    for (const item of items) {

      const sprite = item.sprite;
      this.pixiContainer.addChild(sprite);
      sprite.position.x = ((halfScreenWidth - sprite.width * scale) / 2 + halfScreenWidth) / scale;
      sprite.position.y = y;

      y += sprite.height + 2;

    }

  }

  _drawNextButton(allBtns) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;

    const nextBtn = allBtns['next'];
    nextBtn.initialize(this.pixiContainer)
    nextBtn.setPosition(screenWidth / scale - nextBtn.width - 12,
                        screenHeight / scale - nextBtn.height - 10)

  }

  _drawRandomHeroButton(allSprites, heroBodyMcs) {

    const heroMc = heroBodyMcs[0].movieClip;

    const randBtn = allSprites['randomize_hero'];
    randBtn.initialize(this.pixiContainer);
    randBtn.setPosition(heroMc.position.x + ((heroMc.width - randBtn.width) / 2),
                        heroMc.position.y + heroMc.height + 4);

  }

  _drawHero(heroHairMcs, heroBodyMcs, heroNeutralFaceMcs) {

    const screenWidth = this.renderer.width;
    const screenHeight = this.renderer.height;
    const scale = this.renderer.globalScale;
    const halfScreenWidth = screenWidth / 2;

    const allMcs = [].concat(heroBodyMcs, heroHairMcs, heroNeutralFaceMcs);

    for (const mc of allMcs) {

      this.pixiContainer.addChild(mc.movieClip);
      mc.scale.set(this.HeroScale);
      mc.position.x = (halfScreenWidth - (mc.width * scale)) / 2 / scale;
      mc.position.y = screenHeight / scale / 3;
      mc.visible = false;

    }

  }

  _drawHeroNextPrevButtons(allBtns, heroHairMcs, heroBodyMcs) {

    const prevBodyBtnSprite = allBtns['prev_body'];
    prevBodyBtnSprite.initialize(this.pixiContainer);
    prevBodyBtnSprite.setPosition(heroBodyMcs[0].movieClip.position.x - prevBodyBtnSprite.width,
                                  heroBodyMcs[0].movieClip.position.y + (heroBodyMcs[0].movieClip.height / 2));

    const nextBodyBtnSprite = allBtns['next_body'];
    nextBodyBtnSprite.initialize(this.pixiContainer);
    nextBodyBtnSprite.setPosition(heroBodyMcs[0].movieClip.position.x + heroBodyMcs[0].movieClip.width,
                                  heroBodyMcs[0].movieClip.position.y + (heroBodyMcs[0].movieClip.height / 2));

    const prevHairBtnSprite = allBtns['prev_hair'];
    prevHairBtnSprite.initialize(this.pixiContainer);
    prevHairBtnSprite.setPosition(heroHairMcs[0].movieClip.position.x - prevHairBtnSprite.width,
                                  heroHairMcs[0].movieClip.position.y);

    const nextHairBtnSprite = allBtns['next_hair'];
    nextHairBtnSprite.initialize(this.pixiContainer);
    nextHairBtnSprite.setPosition(heroHairMcs[0].movieClip.position.x + heroHairMcs[0].movieClip.width,
                                  heroHairMcs[0].movieClip.position.y);
    
  }

  processEntities(gameTime, entities) {

    const gui = EntityFinders.findCharacterCreationGui(entities);
    const entRefs = gui.getAllKeyed('EntityReferenceComponent', 'typeId');
    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);

    const items = charClassListCtrl.getAll('ListItemComponent');
    const selectedItem = _.find(items, c => c.selected === true);

    if (!selectedItem) { return; }

    const s = selectedItem.sprite;
    charClassListCtrl.get('GraphicsComponent')
                     .graphics
                     .clear()
                     .beginFill(0x0070fc)
                     .drawRect(s.position.x - 1, s.position.y, s.width + 2, s.height + 1)
                     .endFill();

  }

  unload(entities) {
  }

}