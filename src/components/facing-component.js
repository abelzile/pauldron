import * as Const from '../const';
import Component from '../component';


export default class FacingComponent extends Component {

  constructor(facing = Const.Direction.East) {
    super();
    this.facing = facing;
  }

}