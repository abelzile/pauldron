import AiComponent from '../components/ai-component';
import StateMachine from 'javascript-state-machine';
import * as EnumUtils from '../utils/enum-utils';


// For now, think of 'Normal' state as accepting user input from keyboard/mouse, while anything else means the
// hero is being effected by some other influence (hit by mob, etc) and not accepting user input.

export const Event = EnumUtils.create({
                                        Attack: 'attack',
                                        CastSpell: 'castSpell',
                                        KnockBack: 'knockBack',
                                        Normal: 'normal'
                                      });

export const State = EnumUtils.create({
                                        Attacking: 'attacking',
                                        CastingSpell: 'castingSpell',
                                        KnockingBack: 'knockingBack',
                                        Normal: 'normal',
                                      });

export default class HeroComponent extends AiComponent {

  constructor() {

    super();

    this.stateMachine = StateMachine.create({
                                              initial: State.Normal,
                                              events: [
                                                {
                                                  name: Event.Normal,
                                                  from: [
                                                    State.Attacking,
                                                    State.CastingSpell,
                                                    State.KnockingBack
                                                  ],
                                                  to: State.Normal
                                                },
                                                {
                                                  name: Event.KnockBack,
                                                  from: [
                                                    State.Attacking,
                                                    State.CastingSpell,
                                                    State.KnockingBack,
                                                    State.Normal
                                                  ],
                                                  to: State.KnockingBack
                                                },
                                                {
                                                  name: Event.Attack,
                                                  from: State.Normal,
                                                  to: State.Attacking
                                                },
                                                {
                                                  name: Event.CastSpell,
                                                  from: State.Normal,
                                                  to: State.CastingSpell
                                                }
                                              ]
                                            });




  }

  clone() {
    throw new Error('Not implemented.');
  }

}
