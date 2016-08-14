import * as Const from '../const';
import * as HeroComponent from '../components/hero-component';
import _ from 'lodash';
import System from '../system';


export default class LevelInputSystem extends System {

  constructor(entityManager) {

    super();

    this.Half = 664; // screen width / 2 + hero width * scale / 2

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
    
    if (input.isPressed(Const.Button.B)) {
      this.emit('level-input-system.show-abilities-screen');
      return;
    }

    const hero = this._entityManager.heroEntity;
    const heroAi = hero.get('HeroComponent');

    if (!(heroAi.state === HeroComponent.State.Standing || heroAi.state === HeroComponent.State.Walking)) { return; }

    const mousePosition = input.getMousePosition();
    const mouseFacingDirection = (mousePosition.x < this.Half) ? Const.Direction.West : Const.Direction.East;

    const facing = hero.get('FacingComponent');

    if (input.isPressed(Const.Button.LeftMouse)) {

      facing.facing = mouseFacingDirection;
      heroAi.attack(mousePosition);

      return;

    }

    if (input.isPressed(Const.Button.RightMouse)) {

      facing.facing = mouseFacingDirection;
      heroAi.castSpell(mousePosition);

      return;

    }

    for (let i = 0; i < Const.HotbarSlotCount; ++i) {

      if (!input.isPressed(this._numberButtons[i])) { continue; }

      const entRefComps = hero.getAll('EntityReferenceComponent');
      const hotbarSlots = _.filter(entRefComps, e => e.typeId === Const.InventorySlot.Hotbar);
      const useSlot = _.find(entRefComps, e => e.typeId === Const.InventorySlot.Use);

      useSlot.entityId = hotbarSlots[i].entityId;
      hotbarSlots[i].entityId = '';

      break;

    }

    const movementComp = hero.get('MovementComponent');
    movementComp.directionVector.zero();

    let walk = false;
    if (input.isDown(Const.Button.W)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf180Degrees);
      walk = true;
    } else if (input.isDown(Const.Button.S)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf360Degrees);
      walk = true;
    }

    if (input.isDown(Const.Button.A)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf270Degrees);
      facing.facing = Const.Direction.West;
      walk = true;
    } else if (input.isDown(Const.Button.D)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf90Degrees);
      facing.facing = Const.Direction.East;
      walk = true;
    }

    if (walk) {
      heroAi.walk();
    } else {
      heroAi.stand();
    }

  }

}
