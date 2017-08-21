import Component from '../component';

export default class ParticleEmitterComponent extends Component {
  constructor(emitter) {
    super(function(component) {
      component.emitter.destroy();
    });
    this.emitter = emitter;
  }
}
