import * as EnumUtils from '../utils/enum-utils';
import AiComponent from './ai-component';


export const State = EnumUtils.create({
                                        AttackWarmingUp: 'attackWarmingUp',
                                        AttackCoolingDown: 'attackCoolingDown',
                                        Attacking: 'attacking',
                                        KnockingBack: 'knockingBack',
                                        Waiting: 'waiting',
                                        Wandering: 'wandering'
                                      });

export const StateTime = Object.create(null);
StateTime[State.AttackWarmingUp] = 1000;
StateTime[State.AttackCoolingDown] = 1000;
//StateTime[State.KnockingBack] = 500;
StateTime[State.Waiting] = 4000;
StateTime[State.Wandering] = 500;

export default class AiRandomWandererComponent extends AiComponent {

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

  wait() {
    this.changeState(State.Waiting);
  }

  wander() {
    this.changeState(State.Wandering);
  }

  clone() {
    return new AiRandomWandererComponent();
  }

}
