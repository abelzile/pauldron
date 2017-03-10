import Component from '../component';
import Vector from '../vector';

export default class MovementComponent extends Component {
  constructor(directionVector = new Vector(), velocityVector = new Vector(), movementAngle = 0) {
    super();
    this.directionVector = directionVector;
    this.velocityVector = velocityVector;
    this._movementAngle = movementAngle;
  }

  get movementAngle() {
    return this._movementAngle;
  }
  set movementAngle(value) {
    this._movementAngle = value;
    this.directionVector.x = Math.cos(this._movementAngle);
    this.directionVector.y = Math.sin(this._movementAngle);
  }

  zeroAll() {
    this.directionVector.zero();
    this.velocityVector.zero();
    this._movementAngle = 0;
  }

  clone() {
    return new MovementComponent(this.directionVector.clone(), this.velocityVector.clone(), this._movementAngle);
  }
}
