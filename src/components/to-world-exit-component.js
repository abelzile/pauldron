import ExitComponent from './exit-component';

export default class ToWorldExitComponent extends ExitComponent {

  constructor(position, levelToCompleteName = '') {
    super(position, 'world');
    this.levelToCompleteName = levelToCompleteName;
  }

  get isLevelCompleteExit() { return !!this.levelToCompleteName; }

}