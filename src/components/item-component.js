import * as StringUtils from '../utils/string-utils';
import Component from '../component';


export default class ItemComponent extends Component {

  constructor(itemTypeId) {

    super();

    this.itemTypeId = itemTypeId;

  }

  clone() {
    return new ItemComponent(this.itemTypeId);
  }
  
  toInventoryDisplayString() {
    return StringUtils.formatIdString(this.itemTypeId);
  }

}
