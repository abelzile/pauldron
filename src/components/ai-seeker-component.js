import * as EnumUtils from '../utils/enum-utils';
import AiComponent from './ai-component';
import StateMachine from 'javascript-state-machine';


export const Event = EnumUtils.create({
                                        Attack: 'attack',
                                        KnockBack: 'knockBack',
                                        Seek: 'seek',
                                        Stop: 'stop'
                                      });

export const State = EnumUtils.create({
                                        AttackWarmingUp: 'attackWarmingUp',
                                        AttackCoolingDown: 'attackCoolingDown',
                                        Attacking: 'attacking',
                                        KnockingBack: 'knockingBack',
                                        Seeking: 'seeking',
                                        Waiting: 'waiting'
                                      });

export default class AiSeekerComponent extends AiComponent {

  constructor() {

    super();

    this.stateMachine = StateMachine.create({
                                              initial: State.Waiting,
                                              events: [
                                                {
                                                  name: Event.Attack,
                                                  from: [State.Seeking, State.Waiting],
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
                                                  name: Event.Seek,
                                                  from: State.Waiting,
                                                  to: State.Seeking
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

    const component = new AiSeekerComponent();
    component.timeLeftInCurrentState = 0;

    return component;

  }

}
