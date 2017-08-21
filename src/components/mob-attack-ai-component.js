import * as Const from '../const';
import AiComponent from './ai-component';

export default class MobAttackAiComponent extends AiComponent {
  constructor(mobAttackAiType) {
    super(Const.MobAttackAiState.Ready);

    if (!mobAttackAiType) {
      throw new Error('mobAttackAiType parameter must have a valid mob attack ai type value.');
    }

    this.mobAttackAiType = mobAttackAiType;
    this.stateTime[Const.MobAttackAiState.AttackCoolingDown] = 0;
    this.stateTime[Const.MobAttackAiState.Attacking] = 0;
    this.stateTime[Const.MobAttackAiState.AttackWarmingUp] = 0;
    this.stateTime[Const.MobAttackAiState.Casting] = 0;
    this.stateTime[Const.MobAttackAiState.CastingCoolingDown] = 0;
    this.stateTime[Const.MobAttackAiState.CastingWarmingUp] = 0;
    this.stateTime[Const.MobAttackAiState.Ready] = Number.MAX_SAFE_INTEGER;
    this.timeLeftInCurrentState = this.stateTime[this.state];
  }

  ready() {
    this.changeState(Const.MobAttackAiState.Ready);
  }

  attackWarmUp(mousePosition) {
    this.changeState(Const.MobAttackAiState.AttackWarmingUp, this._buildMousePositionObj(mousePosition));
  }

  attackCoolDown() {
    this.changeState(Const.MobAttackAiState.AttackCoolingDown);
  }

  attack(mousePosition) {
    this.changeState(Const.MobAttackAiState.Attacking, this._buildMousePositionObj(mousePosition));
  }

  castWarmUp(mousePosition) {
    this.changeState(Const.MobAttackAiState.CastingWarmingUp, this._buildMousePositionObj(mousePosition));
  }

  cast(mousePosition) {
    this.changeState(Const.MobAttackAiState.Casting, this._buildMousePositionObj(mousePosition));
  }

  castCoolDown() {
    this.changeState(Const.MobAttackAiState.CastingCoolingDown);
  }

  _buildMousePositionObj(mousePosition) {
    if (mousePosition) {
      return { mousePosition: mousePosition };
    }
    return null;
  }
}
