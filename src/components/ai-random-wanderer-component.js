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
StateTime[State.KnockingBack] = 500;
StateTime[State.Waiting] = 4000;
StateTime[State.Wandering] = 500;

export default class AiRandomWandererComponent extends AiComponent {

  constructor() {
    
    super(State.Waiting);

    this.timeLeftInCurrentState = StateTime[this.state];
    
  }

  attackWarmUp(transitionData) {
    this.changeState(State.AttackWarmingUp, transitionData);
  }

  attackCoolDown(transitionData) {
    this.changeState(State.AttackCoolingDown, transitionData);
  }

  attack(transitionData) {
    this.changeState(State.Attacking, transitionData);
  }

  knockBack(transitionData) {
    this.changeState(State.KnockingBack, transitionData);
  }

  wait(transitionData) {
    this.changeState(State.Waiting, transitionData);
  }

  wander(transitionData) {
    this.changeState(State.Wandering, transitionData);
  }

  clone() {
    return new AiRandomWandererComponent();
  }

}
