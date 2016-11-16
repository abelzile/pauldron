import _ from 'lodash';
import System from '../system';
import * as Pixi from 'pixi.js';


export default class LevelLogRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._messages = [];
    this._sprite = undefined;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const textStyle = { font: '16px "silkscreennormal"', fill: '#ffffff' };
    const textScale = 0.3333333333333333;

    const width = 400;

    this._sprite = this._pixiContainer.addChild(new Pixi.Text('', textStyle));
    this._sprite.width = width;
    this._sprite.position.x = (screenWidth - width) / scale;
    this._sprite.scale.set(textScale);

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