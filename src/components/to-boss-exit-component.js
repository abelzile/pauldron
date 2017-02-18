import ExitComponent from './exit-component';

export default class ToBossExitComponent extends ExitComponent {

  constructor(position, toLevelName, toLevelType = '') {

    if (!toLevelType) {
      throw new Error('toLevelType value missing.');
    }

    super(position, toLevelName, toLevelType, false);

  }

}