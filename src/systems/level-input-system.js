import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import EntityReferenceComponent from '../components/entity-reference-component';
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
    const hero = this._entityManager.heroEntity;
    const heroAi = hero.get('HeroComponent');

    if (heroAi.state !== HeroComponent.State.Standing && heroAi.state !== HeroComponent.State.Walking) {
      return;
    }

    if (input.isPressed(Const.Button.I)) {
      this.emit('show-inventory-screen');
      return;
    }

    if (input.isPressed(Const.Button.B)) {
      this.emit('show-abilities-screen');
      return;
    }

    if (input.isPressed(Const.Button.M)) {
      this.emit('show-map-screen');
      return;
    }

    if (input.isPressed(Const.Button.E)) {
      const visitedMerchant = EntityFinders.findMerchantMobs(this._entityManager.getEntitiesAdjacentToHero()).find(
        this._isMerchantVisitable
      );

      if (visitedMerchant) {
        this.emit('show-merchant-screen', visitedMerchant);
      }

      return;
    }

    const mousePosition = input.getMousePosition().clone();
    const mouseFacingDirection = mousePosition.x < this.Half ? Const.Direction.West : Const.Direction.East;
    const facing = hero.get('FacingComponent');

    if (input.isPressed(Const.Button.LeftMouse)) {
      facing.facing = mouseFacingDirection;
      heroAi.attackWarmUp(mousePosition);

      return;
    }

    if (input.isPressed(Const.Button.RightMouse)) {
      facing.facing = mouseFacingDirection;
      heroAi.castSpellWarmUp(mousePosition);

      return;
    }

    for (let i = 0; i < Const.HotbarSlotCount; ++i) {
      if (!input.isPressed(this._numberButtons[i])) {
        continue;
      }

      const entRefComps = hero.getAll('EntityReferenceComponent');
      const hotbarSlot = entRefComps.filter(EntityReferenceComponent.isHotbarSlot)[i];
      const useSlot = entRefComps.find(EntityReferenceComponent.isInventoryUseSlot);

      if (!hotbarSlot.isEmpty) {
        useSlot.entityId = hotbarSlot.entityId;
        hotbarSlot.empty();
        this.emit('use-hotbar-item', i);
      }

      break;
    }

    const movementComp = hero.get('MovementComponent');
    movementComp.directionVector.zero();

    if (input.isDown(Const.Button.W)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf180Degrees);
    } else if (input.isDown(Const.Button.S)) {
      movementComp.directionVector.y = Math.cos(Const.RadiansOf360Degrees);
    }

    if (input.isDown(Const.Button.A)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf270Degrees);
      facing.facing = Const.Direction.West;
    } else if (input.isDown(Const.Button.D)) {
      movementComp.directionVector.x = Math.sin(Const.RadiansOf90Degrees);
      facing.facing = Const.Direction.East;
    }

    if (movementComp.directionVector.x === 0 && movementComp.directionVector.y === 0) {
      heroAi.stand();
    } else {
      heroAi.walk();
    }
  }

  _isMerchantVisitable(merchant) {
    return merchant.get('MerchantComponent').isVisitable;
  }
}
