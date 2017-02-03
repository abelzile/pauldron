import Component from '../component';
import Vector from '../vector';

export default class MovementComponent extends Component {

  constructor(
    directionVector = new Vector(),
    velocityVector = new Vector(),
    movementAngle = 0
  ) {

    super();

    this.directionVector = directionVector;
    this.velocityVector = velocityVector;
    this.movementAngle = movementAngle;

  }

  zeroAll() {
    this.directionVector.zero();
    this.velocityVector.zero();
    this.movementAngle = 0;
  }

  clone() {
    return new MovementComponent(
      this.directionVector.clone(),
      this.velocityVector.clone(),
      this.movementAngle
    );
  }

}
