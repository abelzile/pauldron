import Component from '../component';

export default class InteractionDelayComponent extends Component {
  constructor(maxInterationDelay) {
    super();
    this.maxInterationDelayTime = maxInterationDelay;
    this.currentInteractionDelayTime = 0;
  }

  get isInteractable() {
    return this.currentInteractionDelayTime >= this.maxInterationDelayTime;
  }
}
