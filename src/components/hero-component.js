import AiComponent from '../components/ai-component';
import * as EnumUtils from '../utils/enum-utils';


// For now, think of 'Normal' state as accepting user input from keyboard/mouse, while anything else means the
// hero is being effected by some other influence (hit by mob, etc) and not accepting user input.

export const State = EnumUtils.create({
                                        Attacking: 'attacking',
                                        CastingSpell: 'castingSpell',
                                        KnockingBack: 'knockingBack',
                                        Normal: 'normal',
                                      });

export const StateTime = Object.create(null);
StateTime[State.KnockingBack] = 500;
StateTime[State.Normal] = Number.MAX_SAFE_INTEGER;

export default class HeroComponent extends AiComponent {

  constructor() {
    
    super(State.Normal);
    
    this.timeLeftInCurrentState = StateTime[this.state];
    
  }

  attack(transitionData) {
    this.changeState(State.Attacking, transitionData);
  }

  castSpell(transitionData) {
    this.changeState(State.CastingSpell, transitionData);
  }

  knockBack(transitionData) {
    this.changeState(State.KnockingBack, transitionData);
  }
  
  normal(transitionData) {
    this.changeState(State.Normal, transitionData);
  }

  clone() {
    throw new Error('Not implemented.');
  }

}
