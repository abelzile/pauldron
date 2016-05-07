import * as Const from '../const';
import * as EntityFinders from '../entity-finders';
import * as HexGrid from '../hex-grid';
import _ from 'lodash';
import System from '../system'


export default class WorldMapRenderSystem extends System {

  constructor(pixiContainer, renderer, entityManager, hexLayout) {

    super();

    this._pixiContainer = pixiContainer;
    this._renderer = renderer;
    this._entityManager = entityManager;
    this._hexLayout = hexLayout;

  }

  checkProcessing() {
    return true;
  }

  initialize(entities) {

    this._initHeader(EntityFinders.findWorldMapGui(entities).get('ScreenHeaderComponent'), 61); // 61 is arbitrary and looks nice.

    this._initWorld();

    this._initGui(entities);

  }

  processEntities(gameTime, entities) {

    this._drawWorld();

    this._drawGui(entities);

  }

  _initWorld() {

    var worldEnt = this._entityManager.worldEntity;

    for (const layer of worldEnt.get('WorldMapComponent').spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const sprite = this._pixiContainer.addChild(row[x]);
          sprite.anchor.set(.5, .5); // hex calculations are made from center of hex.

        }

      }

    }

  }

  _initGui(entities) {

    const screenWidth = this._renderer.width;
    const screenHeight = this._renderer.height;
    const scale = this._renderer.globalScale;

    const gui = EntityFinders.findWorldMapGui(entities);



    const pointerComp = gui.get('WorldMapPointerComponent');
    const pointerMc = this._pixiContainer.addChild(pointerComp.movieClip);
    pointerMc.anchor.set(.5, 1);

    const btnComps = gui.getAll('TextButtonComponent');
    const texts = [Const.WorldButtonText.Cancel, Const.WorldButtonText.Travel];
    let x = screenWidth;
    let y;

    for (const text of texts) {

      //TODO: also do button background.

      const btnComp = _.find(btnComps, c => c.bitmapTextComponent.sprite.text === text);
      const btnSprite = this._pixiContainer.addChild(btnComp.bitmapTextComponent.sprite);

      x -= (btnSprite.textWidth * scale);
      y = (screenHeight - (btnSprite.textHeight * scale));
      btnSprite.position.set(x / scale, y / scale);

    }

  }

  _initHeader(headerComp, marginY) {

    const screenWidth = this._renderer.width;
    const scale = this._renderer.globalScale;
    const half = screenWidth / 2;
    const quarter = screenWidth / 4;
    const y = marginY / 2 + 10;

    const dividerGraphics = this._pixiContainer.addChild(headerComp.dividerGraphicsComponent.graphics);
    dividerGraphics.clear()
                   .lineStyle(1, 0xffffff, 1)
                   .moveTo(quarter / scale, y / scale)
                   .lineTo((quarter + half) / scale, y / scale)
                   .lineStyle(0)
                   .beginFill(Const.Color.DarkBlueGray, 1)
                   .drawRect(screenWidth / 2 / scale, (Math.floor(y / scale)) - 2, 5, 5)
                   .endFill();

    const dividerDecoSprite = this._pixiContainer.addChild(headerComp.dividerDecorationSpriteComponent.sprite);
    dividerDecoSprite.position.set((screenWidth / 2 / scale) + 1, (Math.floor(y / scale)) - 1);

    const headerTextSprite = this._pixiContainer.addChild(headerComp.headerTextComponent.sprite);
    headerTextSprite.position.set((screenWidth - (headerTextSprite.textWidth * scale)) / 2 / scale, 2); // y of 2 is arbitrary and looks nice.

    const arbitraryTextYOffset = 1; //purely to make decos line up with font. Annoying.

    const textDecoLeftSprite = this._pixiContainer.addChild(headerComp.textDecorationLeftSpriteComponent.sprite);
    textDecoLeftSprite.position.set(headerTextSprite.position.x - textDecoLeftSprite.width - 2,
                                    (headerTextSprite.position.y + (headerTextSprite.height / 2)) - arbitraryTextYOffset);

    const textDecoRightSprite = this._pixiContainer.addChild(headerComp.textDecorationRightSpriteComponent.sprite);
    textDecoRightSprite.position.set(headerTextSprite.position.x + headerTextSprite.width + 4,
                                     (headerTextSprite.position.y + (headerTextSprite.height / 2)) - arbitraryTextYOffset);

  }

  _drawWorld() {

    const worldEnt = this._entityManager.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');

    for (const layer of worldMapComp.spriteLayers) {

      for (let y = 0; y < layer.length; ++y) {

        const row = layer[y];

        for (let x = 0; x < row.length; ++x) {

          const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(x, y));

          const sprite = row[x];
          sprite.position.set(point.x, point.y);

        }

      }

    }

  }

  _drawGui(entities) {

    const gui = EntityFinders.findWorldMapGui(entities);

    const pointerComp = gui.get('WorldMapPointerComponent');

    const pointedToHex = this._getPointedToHex(pointerComp);
    const point = HexGrid.hex_to_pixel(this._hexLayout, HexGrid.Hex(pointedToHex.q, pointedToHex.r));

    pointerComp.movieClip.position.set(point.x, point.y);

    const em = this._entityManager;
    const worldEnt = em.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    const pointedToWorldData = worldMapComp.worldData[pointedToHex.r][pointedToHex.q];

    const btnComps = gui.getAll('TextButtonComponent');
    const travelBtnComp = _.find(btnComps, c => c.bitmapTextComponent.sprite.text === Const.WorldButtonText.Travel);
    travelBtnComp.bitmapTextComponent.sprite.visible = pointedToWorldData.levelEntityId !== em.currentLevelEntity.id;

  }

  _getPointedToHex(worldMapPointerComp) {

    const em = this._entityManager;
    const currentLevelEnt = em.currentLevelEntity;
    const worldEnt = em.worldEntity;
    const worldMapComp = worldEnt.get('WorldMapComponent');
    let pointedToHex = worldMapPointerComp.pointedToHex;

    if (!pointedToHex) {
      pointedToHex = worldMapComp.getHexWithLevelEntityId(currentLevelEnt.id);
    }

    return pointedToHex;

  }

}