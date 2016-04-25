import _ from 'lodash';
import System from '../system';
import Pixi from 'pixi.js';


export default class LevelLogRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const labelTextStyle = { font: '16px "silkscreennormal"', fill: '#ffffff' };
    const labelTextScale = 0.3333333333333333;

    this._messages = [];

    this._sprite = this._pixiContainer.addChild(new Pixi.Text('', labelTextStyle));
    this._sprite.width = 200;
    this._sprite.position.x = (screenWidth - 200) / scale;
    this._sprite.scale.set(labelTextScale);


  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {
  }

  processEntities(gameTime, entities, input) {

    if (this._messages.length === 0) { return; }

    const log = [];

    this._messages = _
      .chain(this._messages)
      .map(m => {

        m.age += gameTime;

        if (m.age > 5000) { return undefined; }

        log.push(m.msg);

        return m;

      })
      .compact()
      .value();

    this._sprite.text = log.join('\n');

  }
  
  addMessage(msg) {

    this._messages.push({ msg: msg, age: 0 });

  }

}