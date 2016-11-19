import Component from '../component';


export default class AnimatedSpriteSettingsComponent extends Component {

  constructor(id) {

    super();

    if (!id) { throw new Error('AnimatedSpriteSettingsComponent requires an id.'); }

    this.id = id;

    this.visible = true;
    this.position = { x: 0, y: 0 };
    this.animationSpeed = 1;
    this.anchor = { x: 0, y: 0 };
    this.pivot = { x: 0, y: 0 };
    this.rotation = 0;
    this.positionOffset = { x: 0, y: 0 };

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