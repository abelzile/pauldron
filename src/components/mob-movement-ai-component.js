import * as Const from '../const';
import AiComponent from './ai-component';

export default class MobMovementAiComponent extends AiComponent {
  constructor(
    mobMovementAiType,
    initialState = Const.MobMovementAiState.Sleeping,
    movingTime = 500,
    waitingTime = 4000,
    wakingTime = 1000
  ) {
    super(initialState);

    if (!mobMovementAiType) {
      throw new Error('mobMovementAiType parameter must have a valid mob movement ai type value.');
    }

    this.mobMovementAiType = mobMovementAiType;
    this.stateTime[Const.MobMovementAiState.Moving] = movingTime;
    this.stateTime[Const.MobMovementAiState.Waiting] = waitingTime;
    this.stateTime[Const.MobMovementAiState.Waking] = wakingTime;
    this.stateTime[Const.MobMovementAiState.Sleeping] = Number.MAX_SAFE_INTEGER;
    this.stateTime[Const.MobMovementAiState.KnockingBack] = -1;
    this.timeLeftInCurrentState = this.stateTime[this.state];
  }

  knockBack(angle, duration) {
    this.changeState(Const.MobMovementAiState.KnockingBack, { angle: angle, duration: duration });
  }

  move() {
    this.changeState(Const.MobMovementAiState.Moving);
  }

  wait() {
    this.changeState(Const.MobMovementAiState.Waiting);
  }

  wake() {
    this.changeState(Const.MobMovementAiState.Waking);
  }
}
