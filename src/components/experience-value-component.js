import Component from '../component';


export default class ExperienceValueComponent extends Component {

  constructor(value) {
    super();
    this.value = value;
  }

  clone() {
    return new ExperienceValueComponent(this.value);
  }

}