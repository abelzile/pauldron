import Component from '../component';
import Vector from '../vector';


export default class MovementComponent extends Component {

  constructor(directionVector = new Vector(),
              velocityVector = new Vector(),
              movementAngle = 0) {

    super();

    this._directionVector = directionVector;
    this._velocityVector = velocityVector;
    this._movementAngle = movementAngle;

  }

  get directionVector() { return this._directionVector; }

  get velocityVector() { return this._velocityVector; }

  get movementAngle() { return this._movementAngle; }
  set movementAngle(value) { this._movementAngle = value; }

  zeroAll() {

    this._directionVector.zero();
    this._velocityVector.zero();
    this._movementAngle = 0;

  }

  clone() {
    return new MovementComponent(this._directionVector.clone(),
                                 this._velocityVector.clone(),
                                 this._movementAngle);
  }

}
