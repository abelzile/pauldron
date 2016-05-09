import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import _ from 'lodash';
import System from '../system';


export default class LevelInputSystem extends System {

  constructor(entityManager) {

    super();

    this._entityManager = entityManager;
    this._numberButtons = [
      Const.Button.One,
      Const.Button.Two,
      Const.Button.Three,
      Const.Button.Four,
      Const.Button.Five,
      Const.Button.Six,
      Const.Button.Seven,
      Const.Button.Eight,
      Const.Button.Nine,
      Const.Button.Zero
    ];

  }

  checkProcessing() {
    return true;
  }

  processEntities(gameTime, entities, input) {

    if (input.isPressed(Const.Button.I)) {
      this.emit('level-input-system.show-inventory-screen');
      return;
    }

    const heroEnt = this._entityManager.heroEntity;
    const heroComp = heroEnt.get('HeroComponent');

    if (heroComp.currentState !== HeroComponent.State.Normal) { return; }

    const mobEnts = EntityFinders.findMobs(this._entityManager.entitySpatialGrid.getAdjacentEntities(heroEnt));
    const weaponEnts = EntityFinders.findWeapons(entities);

    if (input.isPressed(Const.Button.LeftMouse)) {
      heroComp.stateMachine.attack(gameTime, input, heroEnt, mobEnts, weaponEnts);
      return;
    }

    const magicSpellEnts = EntityFinders.findMagicSpells(entities);

    if (input.isPressed(Const.Button.RightMouse)) {
      heroComp.stateMachine.castSpell(gameTime, input, heroEnt, magicSpellEnts);
      return;
    }

    for (let i = 0; i < Const.HotbarSlotCount; ++i) {

      if (!input.isPressed(this._numberButtons[i])) { continue; }

      const entRefComps = heroEnt.getAll('EntityReferenceComponent');
      const hotbarSlots = _.filter(entRefComps, e => e.typeId === Const.InventorySlot.Hotbar);
      const useSlot = _.find(entRefComps, e => e.typeId === Const.InventorySlot.Use);

      useSlot.entityId = hotbarSlots[i].entityId;
      hotbarSlots[i].entityId = '';

      break;

    }

    const movementComp = heroEnt.get('MovementComponent');
    movementComp.directionVector.zero();

    if (input.isDown(Const.Button.W)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf180Degrees);
    } else if (input.isDown(Const.Button.S)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf360Degrees);
    }

    if (input.isDown(Const.Button.A)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf270Degrees);
    } else if (input.isDown(Const.Button.D)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf90Degrees);
    }

  }

}
