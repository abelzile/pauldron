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

    const mousePosition = input.getMousePosition();

    const ent = EntityFinders.findCharacterCreationGui(entities);

    const allTextBtns = ent.getAllKeyed('TextButtonComponent', 'id');
    const allSprites = ent.getAllKeyed('SpriteComponent', 'id');
    const allMcs = ent.getAll('MovieClipComponent');

    if (allSprites['randomize_hero'].containsCoords(mousePosition.x, mousePosition.y)) {

      this._randomizeHero(allMcs);

      return;

    }

    const entRefs = ent.getAllKeyed('EntityReferenceComponent', 'typeId');
    const charClassListCtrl = EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId);
    const charClassListItems = charClassListCtrl.getAll('ListItemComponent');

    for (const item of charClassListItems) {

      if (item.containsCoords(mousePosition.x, mousePosition.y)) {

        this._setCharacterClass(item, charClassListItems);

        return;

      }

    }

    let bodyDir = 0;
    let hairDir = 0;

    if (allTextBtns['prev_body'].containsCoords(mousePosition.x, mousePosition.y)) {
      bodyDir--;
    } else if (allTextBtns['next_body'].containsCoords(mousePosition.x, mousePosition.y)) {
      bodyDir++;
    } else if (allTextBtns['prev_hair'].containsCoords(mousePosition.x, mousePosition.y)) {
      hairDir--;
    } else if (allTextBtns['next_hair'].containsCoords(mousePosition.x, mousePosition.y)) {
      hairDir++;
    }
    
    if (hairDir !== 0 || bodyDir !== 0) {

      this._setAppearance(bodyDir, hairDir, allMcs);

      return;

    }

    if (allTextBtns['next'].containsCoords(mousePosition.x, mousePosition.y)) {

      this._updateHero(allMcs, charClassListItems, entities);

      this.emit('character-creation-input-system.next');

      return;

    }

  }

  _setAppearance(bodyDir, hairDir, allMcs) {

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

    } else {
      return;
    }

    mcs[index].visible = false;

    index += dir;

    if (index < 0) {
      index = mcs.length - 1;
    } else if (index === mcs.length) {
      index = 0;
    }

    mcs[index].visible = true;

  }

  _setCharacterClass(selectedItem, items) {

    _.forEach(items, item => { item.selected = false; });

    selectedItem.selected = true;

  }

  _updateHero(allMcs, charClassListItems, entities) {

    const body = _.find(allMcs, c => c.movieClip.visible === true && c.id && c.id.startsWith('hero_body_'));

    const heroBody = body.clone();
    heroBody.id = 'hero_body';

    const hair = _.find(allMcs, c => c.movieClip.visible === true && c.id && c.id.startsWith('hero_hair_'));

    const heroHair = hair.clone();
    heroHair.id = 'hero_hair';

    const selectedCharClassListItem = _.find(charClassListItems, c => c.selected === true);

    const characterClass = _.find(EntityFinders.findCharacterClasses(entities), e => e.get('CharacterClassComponent').typeId === selectedCharClassListItem.value);

    const heroCharClass = characterClass.get('CharacterClassComponent').clone();

    this._heroEntity
        .add(heroBody)
        .add(heroHair)
        .add(heroCharClass)
        ;

  }

  _randomizeHero(allMcs) {

    this._setRandomVisible(_.filter(allMcs, c => c.id && c.id.startsWith('hero_body_')));
    this._setRandomVisible(_.filter(allMcs, c => c.id && c.id.startsWith('hero_hair_')));

  }

  _setRandomVisible(mcs) {

    _.forEach(mcs, mc => { mc.visible = false; });

    _.sample(mcs).visible = true;

  }

}