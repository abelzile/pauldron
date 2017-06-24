import * as _ from 'lodash';
import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import System from '../system';

export default class CharacterCreationInputSystem extends System {
  constructor(entityManager) {
    super();

    this._entityManager = entityManager;
  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
    const gui = EntityFinders.findCharacterCreationGui(entities);

    const btns = gui.getAllKeyed('ButtonComponent', 'id');
    btns['randomize_hero'].on('click', () => {
      this._randomizeHero(gui.getAll('AnimatedSpriteComponent'));
    });
    btns['prev_body'].on('click', () => {
      const mcs = gui.getAll('AnimatedSpriteComponent');
      this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('body_standing_')));
      this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('face_neutral_')));
    });
    btns['next_body'].on('click', () => {
      const mcs = gui.getAll('AnimatedSpriteComponent');
      this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('body_standing_')));
      this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('face_neutral_')));
    });
    btns['prev_hair'].on('click', () => {
      const mcs = gui.getAll('AnimatedSpriteComponent');
      this._setAppearance(-1, mcs.filter(c => c.id && c.id.startsWith('hair_')));
    });
    btns['next_hair'].on('click', () => {
      const mcs = gui.getAll('AnimatedSpriteComponent');
      this._setAppearance(1, mcs.filter(c => c.id && c.id.startsWith('hair_')));
    });
    btns['next'].once('click', () => {
      const mcs = gui.getAll('AnimatedSpriteComponent');
      this._createHero(mcs, entities);

      this.emit('next', this._entityManager.worldEntity.getOne('WorldMapTileComponent').id);
    });

    const listItems = this._getCharClassListItems(gui, entities);
    for (const listItem of listItems) {
      listItem.on('click', () => {
        this._setCharacterClass(listItem, entities);
      });
    }
  }

  processEntities(gameTime, entities, input) {}

  unload(entities) {
    const gui = EntityFinders.findCharacterCreationGui(entities);

    for (const btn of gui.getAll('ButtonComponent', 'id')) {
      btn.removeAllListeners();
    }
    for (const listItem of this._getCharClassListItems(gui, entities)) {
      listItem.removeAllListeners();
    }
  }

  _getCharClassListItems(gui, entities) {
    const entRefs = gui.getAllKeyed('EntityReferenceComponent', 'typeId');
    return EntityFinders.findById(entities, entRefs['character_class_list_control'].entityId).getAll(
      'ListItemComponent'
    );
  }

  _setAppearance(dir, mcs) {
    let index = mcs.findIndex(c => c.visible === true);

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
    for (const item of this._getCharClassListItems(EntityFinders.findCharacterCreationGui(entities), entities)) {
      item.selected = false;
    }
  }

  _createHero(allMcs, entities) {
    const bodyStanding = allMcs.find(
      c => c.animatedSprite.visible === true && c.id && c.id.startsWith('body_standing_')
    );
    const parts = bodyStanding.id.split('_');
    const num = parts[parts.length - 1];
    const heroBodyStanding = bodyStanding.clone();
    heroBodyStanding.id = 'body_standing';
    heroBodyStanding.scale.set(1);

    const bodyWalking = allMcs.find(c => c.id === 'body_walking_' + num);
    const heroBodyWalking = bodyWalking.clone();
    heroBodyWalking.id = 'body_walking';
    heroBodyWalking.scale.set(1);

    const hair = allMcs.find(c => c.animatedSprite.visible === true && c.id && c.id.startsWith('hair_'));
    const heroHair = hair.clone();
    heroHair.id = 'hair';
    heroHair.scale.set(1);

    const neutralFaces = allMcs.filter(c => c.id && c.id.startsWith('face_neutral_'));
    const faceIndex = neutralFaces.findIndex(c => c.visible === true);
    const heroNeutralFace = neutralFaces[faceIndex].clone();
    heroNeutralFace.id = 'face_neutral';
    heroNeutralFace.scale.set(1);

    const attackFaces = allMcs.filter(c => c.id && c.id.startsWith('face_attack_'));
    const heroAttackFace = attackFaces[faceIndex].clone();
    heroAttackFace.id = 'face_attack';
    heroAttackFace.scale.set(1);

    const knockbackFaces = allMcs.filter(c => c.id && c.id.startsWith('face_knockback_'));
    const heroKnockbackFace = knockbackFaces[faceIndex].clone();
    heroKnockbackFace.id = 'face_knockback';
    heroKnockbackFace.scale.set(1);

    const selectedCharClassListItem = this._getCharClassListItems(
      EntityFinders.findCharacterCreationGui(entities),
      entities
    ).find(c => c.selected === true);
    const characterClass = EntityFinders.findCharacterClasses(entities).find(
      e => e.get('CharacterClassComponent').typeId === selectedCharClassListItem.value
    );
    const equipableSlots = _.values(Const.EquipableInventorySlot);

    let backpackIndex = 0;

    for (const c of characterClass.getAll('EntityReferenceComponent')) {
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
            const slot = hero.getAll('EntityReferenceComponent', c => c.typeId === Const.InventorySlot.Backpack)[
              backpackIndex
            ];
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
    }

    const heroCharClass = characterClass.get('CharacterClassComponent').clone();
    const stats = characterClass.getAll('StatisticComponent').map(c => c.clone());

    this._entityManager.heroEntity
      .addRange(stats)
      .add(heroBodyStanding)
      .add(heroBodyWalking)
      .add(heroHair)
      .add(heroNeutralFace)
      .add(heroAttackFace)
      .add(heroKnockbackFace)
      .add(heroCharClass);
  }

  _randomizeHero(mcs) {
    const bodyIndex = this._setRandomVisible(mcs.filter(c => c.id && c.id.startsWith('body_standing_')));
    this._setRandomVisible(mcs.filter(c => c.id && c.id.startsWith('hair_')));

    const mcs2 = mcs.filter(c => c.id && c.id.startsWith('face_neutral_'));

    this._setVisible(mcs2, bodyIndex);
  }

  _setRandomVisible(mcs) {
    this._hideAll(mcs);
    _.sample(mcs).visible = true;

    return mcs.findIndex(c => c.visible === true);
  }

  _setVisible(mcs, index) {
    this._hideAll(mcs);
    mcs[index].visible = true;
  }

  _hideAll(mcs) {
    for (const mc of mcs) {
      mc.visible = false;
    }
  }
}
