import Component from '../component';


export default class ExperienceComponent extends Component {

  constructor(points = 0) {
    super();
    this.points = points;
  }

  clone() {
    return new ExperienceComponent(this.points);
  }

  static levelToPoints(level) {
    //return (level * (level - 1) / 2) * 1000; //1000
    return (level * (level - 1) / 2) * 100; //100
  }

  static pointsToLevel(points) {
    //return (25 + Math.sqrt(5 * (125 + m))) / 50; //1000
    return (5 + Math.sqrt(25 + 2 * points)) / 10; //100
  }

}