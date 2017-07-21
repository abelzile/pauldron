import * as EnumUtils from '../utils/enum-utils';
import AiComponent from '../components/ai-component';

export const State = EnumUtils.create({
  AttackWarmingUp: 'attackWarmingUp',
  Attacking: 'attacking',
  CastingSpellWarmingUp: 'castingSpellWarmingUp',
  CastingSpell: 'castingSpell',
  KnockingBack: 'knockingBack',
  Standing: 'standing',
  Walking: 'walking'
});

export const StateTime = Object.create(null);
StateTime[State.Standing] = Number.MAX_SAFE_INTEGER;
StateTime[State.Walking] = Number.MAX_SAFE_INTEGER;

export default class HeroComponent extends AiComponent {
  constructor() {
    super(State.Standing);

    this.timeLeftInCurrentState = StateTime[this.state];
  }

  attackWarmUp(mousePosition) {
    this.changeState(State.AttackWarmingUp, { mousePosition: mousePosition });
  }

  attack(mousePosition) {
    this.changeState(State.Attacking, { mousePosition: mousePosition });
  }

  castSpellWarmUp(mousePosition) {
    this.changeState(State.CastingSpellWarmingUp, { mousePosition: mousePosition });
  }

  castSpell(mousePosition) {
    this.changeState(State.CastingSpell, { mousePosition: mousePosition });
  }

  knockBack(angle, duration) {
    this.changeState(State.KnockingBack, { angle: angle, duration: duration });
  }

  stand() {
    this.changeState(State.Standing);
  }

  walk() {
    this.changeState(State.Walking);
  }
}
