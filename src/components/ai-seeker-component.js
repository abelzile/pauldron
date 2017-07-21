import * as EnumUtils from '../utils/enum-utils';
import AiComponent from './ai-component';


export const State = EnumUtils.create({
                                        AttackWarmingUp: 'attackWarmingUp',
                                        AttackCoolingDown: 'attackCoolingDown',
                                        Attacking: 'attacking',
                                        KnockingBack: 'knockingBack',
                                        Seeking: 'seeking',
                                        Waiting: 'waiting'
                                      });

export const StateTime = Object.create(null);
StateTime[State.AttackCoolingDown] = 1000;
StateTime[State.Seeking] = Number.MAX_SAFE_INTEGER;
StateTime[State.Waiting] = 4000;

export default class AiSeekerComponent extends AiComponent {

  constructor() {

    super(State.Waiting);

    this.timeLeftInCurrentState = StateTime[this.state];

  }
  
  attackWarmUp() {
    this.changeState(State.AttackWarmingUp);
  }

  attackCoolDown() {
    this.changeState(State.AttackCoolingDown);
  }

  attack() {
    this.changeState(State.Attacking);
  }

  knockBack(angle, duration) {
    this.changeState(State.KnockingBack, { angle: angle, duration: duration });
  }
  
  seek() {
    this.changeState(State.Seeking);
  }
  
  wait() {
    this.changeState(State.Waiting);
  }

  clone() {
    return new AiSeekerComponent();
  }

}
