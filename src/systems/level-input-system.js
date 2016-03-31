import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HeroComponent from '../components/hero-component';
import System from '../system';


export default class LevelInputSystem extends System {

  constructor(entityManager) {

    super();

    this._entityManager = entityManager;

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
