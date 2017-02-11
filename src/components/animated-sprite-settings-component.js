import Component from '../component';
import Vector from '../vector';


export default class AnimatedSpriteSettingsComponent extends Component {

  constructor(id) {

    super();

    if (!id) { throw new Error('AnimatedSpriteSettingsComponent requires an id.'); }

    this.id = id;

    this.visible = true;
    this.position = new Vector();
    this.animationSpeed = 1;
    this.anchor = new Vector();
    this.pivot = new Vector();
    this.rotation = 0;
    this.positionOffset = new Vector();

  }

  clone() {

    const settings = new AnimatedSpriteSettingsComponent(this.id);
    settings.visible = this.visible;
    settings.position.x = this.position.x;
    settings.position.y = this.position.y;
    settings.animationSpeed = this.animationSpeed;
    settings.anchor.x = this.anchor.x;
    settings.anchor.y = this.anchor.y;
    settings.pivot.x = this.pivot.x;
    settings.pivot.y = this.pivot.y;
    settings.rotation = this.rotation;
    settings.positionOffset.x = this.positionOffset.x;
    settings.positionOffset.y = this.positionOffset.y;

    return settings;

  }

}