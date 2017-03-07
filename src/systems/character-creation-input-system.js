import * as _ from 'lodash';
import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as ObjectUtils from '../utils/object-utils';
import System from '../system';


export default class CharacterCreationInputSystem extends System {

  constructor(entityManager) {

    super();

    this._entityManager = entityManager;

    this._gui = undefined;
    this._interactiveComps = [];

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._gui = EntityFinders.findCharacterCreationGui(entities);

    ArrayUtils.clear(this._interactiveComps);
    ArrayUtils.append(this._interactiveComps,
                      this._gui.getAll('ButtonComponent'),
                      this._getCharClassListItems(entities));

  }

  processEntities(gameTime, entities, input) {

    if (!input.isPressed(Const.Button.LeftMouse)) { return; }

    const mousePosition = input.getMousePosition();

    for (let i = 0; i < this._interactiveComps.length; ++i) {

      const item = this._interactiveComps[i];

      if (item.containsCoords(mousePosition.x, mousePosition.y)) {

        this._processClick(item, entities);

        return;

      }

    }

  }

  _processClick(btn, entities) {

    const mcs = this._gui.getAll('AnimatedSpriteComponent');

    switch (btn.id) {

      case 'randomize_hero':

        this._randomizeHero(mcs);

        break;

      case 'prev_body':

        this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('body_standing_')));
        this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('face_neutral_')));

        break;

      case 'next_body':

        this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('body_standing_')));
        this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('face_neutral_')));

        break;

      case 'prev_hair':

        this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('hair_')));

        break;

      case 'next_hair':

        this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('hair_')));

        break;

      case 'next':

        this._updateHero(mcs, entities);

        const world = this._entityManager.worldEntity.get('WorldMapComponent');

        this.emit('next', world.getWorldDataByNum(0).levelName);

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

  _setAppearance(dir, mcs) {

    let index = _.findIndex(mcs, c => c.visible === true);

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

    this._clearCharacterClass(entities);

    selectedItem.selected = true;

  }

  _clearCharacterClass(entities) {

    const items = this._getCharClassListItems(entities);

    for (let i = 0; i < items.length; ++i) {
      items[i].selected = false;
    }

  }

  _updateHero(allMcs, entities) {

    const bodyStanding = _.find(allMcs, c => c.animatedSprite.visible === true && c.id && c.id.startsWith('body_standing_'));
    const parts = bodyStanding.id.split('_');
    const num = parts[parts.length - 1];
    const heroBodyStanding = bodyStanding.clone();
    heroBodyStanding.id = 'body_standing';
    heroBodyStanding.scale.set(1);

    const bodyWalking = _.find(allMcs, c => c.id === 'body_walking_' + num);
    const heroBodyWalking = bodyWalking.clone();
    heroBodyWalking.id = 'body_walking';
    heroBodyWalking.scale.set(1);

    const hair = _.find(allMcs, c => c.animatedSprite.visible === true && c.id && c.id.startsWith('hair_'));
    const heroHair = hair.clone();
    heroHair.id = 'hair';
    heroHair.scale.set(1);

    const neutralFaces = _.filter(allMcs, c => c.id && c.id.startsWith('face_neutral_'));
    const faceIndex = _.findIndex(neutralFaces, c => c.visible === true);
    const heroNeutralFace = neutralFaces[faceIndex].clone();
    heroNeutralFace.id = 'face_neutral';
    heroNeutralFace.scale.set(1);

    const attackFaces = _.filter(allMcs, c => c.id && c.id.startsWith('face_attack_'));
    const heroAttackFace = attackFaces[faceIndex].clone();
    heroAttackFace.id = 'face_attack';
    heroAttackFace.scale.set(1);

    const knockbackFaces = _.filter(allMcs, c => c.id && c.id.startsWith('face_knockback_'));
    const heroKnockbackFace = knockbackFaces[faceIndex].clone();
    heroKnockbackFace.id = 'face_knockback';
    heroKnockbackFace.scale.set(1);

    const selectedCharClassListItem = _.find(this._getCharClassListItems(entities), c => c.selected === true);
    const characterClass = _.find(EntityFinders.findCharacterClasses(entities), e => e.get('CharacterClassComponent').typeId === selectedCharClassListItem.value);
    const equipableSlots = _.values(Const.EquipableInventorySlot);

    let backpackIndex = 0;

    _.chain(characterClass.getAll('EntityReferenceComponent'))
     .map(c => {

       const hero = this._entityManager.heroEntity;
       const equipment = EntityFinders.findById(entities, c.entityId);
       const icon = equipment.get('InventoryIconComponent');

       switch (c.typeId) {

         case 'weapon':
         case 'armor':

           const equipSlots = _.intersection(equipableSlots, icon.allowedSlotTypes);

           if (equipSlots.length > 0) {

             const slot = hero.getAll('EntityReferenceComponent', c => c.typeId === equipSlots[0])[0];
             slot.entityId = equipment.id;

           }

           break;

         case 'item':

           if (backpackIndex < Const.BackpackSlotCount) {

             const slot = hero.getAll('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Backpack)[backpackIndex];
             slot.entityId = equipment.id;

             backpackIndex++;

           }

           break;

         case 'bounding_box': {

           const slot = hero.getAll('EntityReferenceComponent', c => c.typeId === 'bounding_box')[0];
           slot.entityId = equipment.id;

           break;

         }

       }

     })
     .value();

    const heroCharClass = characterClass.get('CharacterClassComponent').clone();

    this._entityManager.heroEntity
        .add(heroBodyStanding)
        .add(heroBodyWalking)
        .add(heroHair)
        .add(heroNeutralFace)
        .add(heroAttackFace)
        .add(heroKnockbackFace)
        .add(heroCharClass)
        ;

  }

  _randomizeHero(mcs) {

    const bodyIndex = this._setRandomVisible(_.filter(mcs, c => c.id && c.id.startsWith('body_standing_')));
    this._setRandomVisible(_.filter(mcs, c => c.id && c.id.startsWith('hair_')));

    const mcs2 = _.filter(mcs, c => c.id && c.id.startsWith('face_neutral_'));

    this._setVisible(mcs2, bodyIndex);

  }

  _setRandomVisible(mcs) {

    this._hideAll(mcs);
    ArrayUtils.sample(mcs).visible = true;

    return _.findIndex(mcs, c => c.visible === true);

  }

  _setVisible(mcs, index) {

    this._hideAll(mcs);
    mcs[index].visible = true;

  }

  _hideAll(mcs) {

    for (let i = 0; i < mcs.length; ++i) {
      mcs[i].visible = false;
    }

  }

}