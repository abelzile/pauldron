import * as Const from '../const';
import System from '../system';

export default class DialogRenderSystem extends System {
  constructor(pixiContainer, renderer) {
    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
  }

  get pixiContainer() {
    return this._pixiContainer;
  }

  get renderer() {
    return this._renderer;
  }

  drawDialogHeader(dialogHeaderComp) {
    const alpha = Const.ScreenDecoAlpha;

    const topLeftDecoSpriteComp = dialogHeaderComp.topLeftDecoSpriteComponent;

    if (topLeftDecoSpriteComp) {
      const topLeftSprite = topLeftDecoSpriteComp.sprite;
      this._pixiContainer.addChild(topLeftSprite);
      topLeftSprite.position.set(0, 0);
      topLeftSprite.alpha = alpha;
    }

    const topRightDecoSpriteComp = dialogHeaderComp.topRightDecoSpriteComponent;

    if (topRightDecoSpriteComp) {
      const topRightSprite = topRightDecoSpriteComp.sprite;
      this._pixiContainer.addChild(topRightSprite);
      topRightSprite.position.set(this._renderer.width / this._renderer.globalScale, 0);
      topRightSprite.alpha = alpha;
    }

    const bottomLeftDecoSpriteComp = dialogHeaderComp.bottomLeftDecoSpriteComponent;

    if (bottomLeftDecoSpriteComp) {
      const bottomLeftSprite = bottomLeftDecoSpriteComp.sprite;
      this._pixiContainer.addChild(bottomLeftSprite);
      bottomLeftSprite.position.set(0, this._renderer.height / this._renderer.globalScale);
      bottomLeftSprite.alpha = alpha;
    }

    const bottomRightDecoSpriteComponent = dialogHeaderComp.bottomRightDecoSpriteComponent;

    if (bottomRightDecoSpriteComponent) {
      const bottomRightSprite = bottomRightDecoSpriteComponent.sprite;
      this._pixiContainer.addChild(bottomRightSprite);
      bottomRightSprite.position.set(
        this._renderer.width / this._renderer.globalScale,
        this._renderer.height / this._renderer.globalScale
      );
      bottomRightSprite.alpha = alpha;
    }

    const screenWidth = this._renderer.width;
    const scale = this._renderer.globalScale;

    const topOffset = 2;
    const headerTextComponent = dialogHeaderComp.headerTextComponent;

    if (headerTextComponent) {
      const headerTextSprite = headerTextComponent.sprite;
      this._pixiContainer.addChild(headerTextSprite);
      headerTextSprite.position.set((screenWidth - headerTextSprite.textWidth * scale) / 2 / scale, topOffset);
    }

    const closeButtonMcComponent = dialogHeaderComp.closeButtonMcComponent;

    if (closeButtonMcComponent) {
      const closeButtonMc = closeButtonMcComponent.animatedSprite;
      this._pixiContainer.addChild(closeButtonMc);
      closeButtonMc.position.set((screenWidth - closeButtonMc.width * scale) / scale - 2, topOffset);
    }
  }
}
