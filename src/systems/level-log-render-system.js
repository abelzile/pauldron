import * as ArrayUtils from '../utils/array-utils';
import * as Const from '../const';
import * as Pixi from 'pixi.js';
import System from '../system';


export default class LevelLogRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager) {

    super();

    this.MaxMessageAge = 5000;

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;

    this._messages = [];
    this._log = [];
    this._logMsgText = undefined;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    const textScale = 2 / 3;
    const width = 400;

    const logMsgText = new Pixi.extras.BitmapText('', {
      font: '8px Silkscreen',
      tint: 0xffffff
    });
    logMsgText.scale.set(textScale);
    logMsgText.position.x = (Const.ScreenWidth - width) / Const.ScreenScale;

    this._pixiContainer.addChild(logMsgText);

    this._logMsgText = logMsgText;

  }

  processEntities(gameTime, entities, input) {

    const messages = this._messages;

    if (messages.length === 0) { return; }

    const log = this._log;

    ArrayUtils.clear(log);

    for (let i = messages.length; i-- > 0;) {

      const message = messages[i];

      message.age += gameTime;

      if (message.age > this.MaxMessageAge) {
        messages.splice(i, 1);
        continue;
      }

      log.push(message.msg);

    }

    this._logMsgText.text = log.join('\n');

  }
  
  addMessage(msg) {
    this._messages.push({ msg: msg, age: 0 });
  }

}