import Component from '../component';


export default class SkillGroupComponent extends Component {

  constructor(skillGroupTypeId, name) {

    super();

    this.skillGroupTypeId = skillGroupTypeId;
    this.name = name;

  }

  clone() {
    return new SkillGroupComponent(this.skillGroupTypeId, this.name);
  }

}