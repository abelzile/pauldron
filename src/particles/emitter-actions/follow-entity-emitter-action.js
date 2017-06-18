import EmitterAction from './emitter-action';

export default class FollowEntityEmitterAction extends EmitterAction {
  constructor(entity) {
    super();
    this.entity = entity;
  }

  initialize(emitter) {}

  update(emitter, time) {
    if (!this.entity || this.entity.deleted) {
      return;
    }

    const position = this.entity.get('PositionComponent');
    emitter.position.x = position.x;
    emitter.position.y = position.y;
  }
}
