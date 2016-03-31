import * as EnumUtils from '../utils/enum-utils';
import AiComponent from './ai-component';
import StateMachine from 'javascript-state-machine';


export const Event = EnumUtils.create({
                                        Attack: 'attack',
                                        Go: 'go',
                                        KnockBack: 'knockBack',
                                        Stop: 'stop'
                                      });

export const State = EnumUtils.create({
                                        AttackWarmingUp: 'attackWarmingUp',
                                        AttackCoolingDown: 'attackCoolingDown',
                                        Attacking: 'attacking',
                                        KnockingBack: 'knockingBack',
                                        Waiting: 'waiting',
                                        Wandering: 'wandering'
                                      });

export default class AiRandomWandererComponent extends AiComponent {

  constructor() {

    super();

    this.stateMachine = StateMachine.create({
                                              initial: State.Waiting,
                                              events: [
                                                {
                                                  name: Event.Attack,
                                                  from: [State.Wandering, State.Waiting],
                                                  to: State.AttackWarmingUp
                                                },
                                                {
                                                  name: Event.Attack,
                                                  from: State.AttackWarmingUp,
                                                  to: State.Attacking
                                                },
                                                {
                                                  name: Event.Attack,
                                                  from: State.Attacking,
                                                  to: State.AttackCoolingDown
                                                },
                                                {
                                                  name: Event.Go,
                                                  from: State.Waiting,
                                                  to: State.Wandering
                                                },
                                                {
                                                  name: Event.Stop,
                                                  from: ['*'],
                                                  to: State.Waiting
                                                },
                                                {
                                                  name: Event.KnockBack,
                                                  from: ['*'],
                                                  to: State.KnockingBack
                                                }
                                              ]
                                            });

  }

  clone() {

    const component = new AiRandomWandererComponent();
    component.timeLeftInCurrentState = 0;

    return component;

  }

}
