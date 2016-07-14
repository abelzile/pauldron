import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import _ from 'lodash';
import System from '../system';


export default class CharacterCreationInputSystem extends System {

  constructor(heroEntity) {

    super();

    this._heroEntity = heroEntity;

  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    const ent = EntityFinders.findCharacterCreationGui(entities);

    const allTextBtns = ent.getAll('TextButtonComponent');
    const startBtn = _.find(allTextBtns, c => c.id === 'start');
    const prevBodyBtn = _.find(allTextBtns, c => c.id === 'prev_body');
    const nextBodyBtn = _.find(allTextBtns, c => c.id === 'next_body');
    const prevHairBtn = _.find(allTextBtns, c => c.id === 'prev_hair');
    const nextHairBtn = _.find(allTextBtns, c => c.id === 'next_hair');

    const allSprites = ent.getAll('SpriteComponent');
    const randomHeroBtn = _.find(allSprites, c => c.id === 'random_hero');

    const mousePosition = input.getMousePosition();

    const allMcs = ent.getAll('MovieClipComponent');

    if (startBtn.containsCoords(mousePosition.x, mousePosition.y)) {

      const body = _.find(allMcs, c => c.id && c.id.startsWith('hero_body_') && c.movieClip.visible === true);
      const hair = _.find(allMcs, c => c.id && c.id.startsWith('hero_hair_') && c.movieClip.visible === true);

      const heroBody = body.clone();
      heroBody.id = 'hero_body';

      const heroHair = hair.clone();
      heroHair.id = 'hero_hair';

      this._heroEntity
          .add(heroBody)
          .add(heroHair);

      this.emit('character-creation-input-system.start');

      return;

    }

    if (randomHeroBtn.containsCoords(mousePosition.x, mousePosition.y)) {

      this._randomHero(allMcs);

      return;

    }

    let bodyDir = 0;
    let hairDir = 0;

    if (prevBodyBtn.containsCoords(mousePosition.x, mousePosition.y)) {
      bodyDir--;
    } else if (nextBodyBtn.containsCoords(mousePosition.x, mousePosition.y)) {
      bodyDir++;
    } else if (prevHairBtn.containsCoords(mousePosition.x, mousePosition.y)) {
      hairDir--;
    } else if (nextHairBtn.containsCoords(mousePosition.x, mousePosition.y)) {
      hairDir++;
    }
    
    if (hairDir === 0 && bodyDir === 0) { return; }

    let dir;
    let mcs;
    let index;

    if (bodyDir !== 0) {

      dir = bodyDir;
      mcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_body_'));
      index = _.findIndex(mcs, c => c.visible === true);

    } else if (hairDir !== 0) {

      dir = hairDir;
      mcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_hair_'));
      index = _.findIndex(mcs, c => c.visible === true);

    }

    mcs[index].visible = false;

    index = index + dir;

    if (index < 0) {
      index = mcs.length - 1;
    } else if (index === mcs.length) {
      index = 0;
    }

    mcs[index].visible = true;
    
  }

  _randomHero(allMcs) {

    const bodyMcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_body_'));
    const bodyIndex = _.findIndex(bodyMcs, c => c.visible === true);

    bodyMcs[bodyIndex].visible = false;

    _.sample(bodyMcs).visible = true;

    const hairMcs = _.filter(allMcs, c => c.id && c.id.startsWith('hero_hair_'));
    const hairIndex = _.findIndex(hairMcs, c => c.visible === true);

    hairMcs[hairIndex].visible = false;

    _.sample(hairMcs).visible = true;

  }

}