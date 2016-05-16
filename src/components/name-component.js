import Component from '../component';


export default class NameComponent extends Component {

  constructor(name, description = '') {

    super();

    this.name = name;
    this.description = description;

  }

  clone() {
    return new NameComponent(this.name, this.description);
  }

}
