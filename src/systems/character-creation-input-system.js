import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ObjectUtils from '../utils/object-utils';
import _ from 'lodash';
import System from '../system';


export default class CharacterCreationInputSystem extends System {

  constructor(heroEntity) {

    super();

    this._heroEntity = heroEntity;

    this._gui = undefined;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._gui = EntityFinders.findCharacterCreationGui(entities);

  }

  processEntities(gameTime, entities, input) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    const mousePosition = input.getMousePosition();

    const items = [].concat(this._gui.getAll('ButtonComponent'), this._getCharClassListItems(entities));

    for (const item of items) {

      if (item.containsCoords(mousePosition.x, mousePosition.y)) {

        this._processClick(item, entities);

        return;

      }

    }

  }

  _processClick(btn, entities) {

    switch (btn.id) {

      case 'randomize_hero':

        this._randomizeHero(this._gui.getAll('MovieClipComponent'));

        break;

      case 'prev_body':

        this._setAppearance(-1, 0, this._gui.getAll('MovieClipComponent'));

        break;

      case 'next_body':

        this._setAppearance(1, 0, this._gui.getAll('MovieClipComponent'));

        break;

      case 'prev_hair':

        this._setAppearance(0, -1, this._gui.getAll('MovieClipComponent'));

        break;

      case 'next_hair':

        this._setAppearance(0, 1, this._gui.getAll('MovieClipComponent'));

        break;

      case 'next':

        this._updateHero(this._gui.getAll('MovieClipComponent'), entities);

        this.emit('next');

        break;

      default:

        if (ObjectUtils.getTypeName(btn) === 'ListItemComponent') {
          this._setCharacterClass(btn, entities);
        }

        break;

    }

  }

  _getCharClassListItems(entities) {

    const entRefs = this._gui.getAllKeyed('EntityReferenceComponent', 'typeId');
    return EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId).getAll('ListItemComponent');

  }

  _setAppearance(bodyDir, hairDir, allMcs) {

    let dir;
    let mcs;
    let index;

    if (bodyDir !== 0) {

      dir = bodyDir;
      mcs = _.filter(allMcs, c => c.id && c.id.startsWith('body_standing_'));
      index = _.findIndex(mcs, c => c.visible === true);

    } else if (hairDir !== 0) {

      dir = hairDir;
      mcs = _.filter(allMcs, c => c.id && c.id.startsWith('hair_'));
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

  _setCharacterClass(selectedItem, entities) {

    _.forEach(this._getCharClassListItems(entities), item => { item.selected = false; });

    selectedItem.selected = true;

  }

  _updateHero(allMcs, entities) {

    const bodyStanding = _.find(allMcs, c => c.movieClip.visible === true && c.id && c.id.startsWith('body_standing_'));

    const parts = bodyStanding.id.split('_');
    const num = parts[parts.length - 1];

    const heroBodyStanding = bodyStanding.clone();
    heroBodyStanding.id = 'body_standing';

    const bodyWalking = _.find(allMcs, c => c.id === 'body_walking_' + num);
    const heroBodyWalking = bodyWalking.clone();
    heroBodyWalking.id = 'body_walking';

    const hair = _.find(allMcs, c => c.movieClip.visible === true && c.id && c.id.startsWith('hair_'));

    const heroHair = hair.clone();
    heroHair.id = 'hair';

    const selectedCharClassListItem = _.find(this._getCharClassListItems(entities), c => c.selected === true);

    const characterClass = _.find(EntityFinders.findCharacterClasses(entities), e => e.get('CharacterClassComponent').typeId === selectedCharClassListItem.value);

    const heroCharClass = characterClass.get('CharacterClassComponent').clone();

    this._heroEntity
        .add(heroBodyStanding)
        .add(heroBodyWalking)
        .add(heroHair)
        .add(heroCharClass)
        ;

  }

  _randomizeHero(mcs) {

    this._setRandomVisible(_.filter(mcs, c => c.id && c.id.startsWith('body_standing_')));
    this._setRandomVisible(_.filter(mcs, c => c.id && c.id.startsWith('hair_')));

  }

  _setRandomVisible(mcs) {

    _.forEach(mcs, mc => { mc.visible = false; });

    _.sample(mcs).visible = true;

  }

}