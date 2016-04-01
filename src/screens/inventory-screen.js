import Screen from '../screen';
import InventoryInputSystem from '../systems/inventory-input-system';
import InventoryRenderSystem from '../systems/inventory-render-system';
import InventoryUpdateSystem from '../systems/inventory-update-system';
import _ from 'lodash';


export default class InventoryScreen extends Screen {

  constructor(levelScreen) {

    super(true);

    this._levelScreen = levelScreen;

    this._inputSystem = undefined;
    this._updateSystem = undefined;
    this._renderSystems = undefined;

  }

  activate(entities) {

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [
      new InventoryRenderSystem(this, renderer, entityManager)
    ];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._inputSystem = new InventoryInputSystem();
    this._inputSystem.on('inventory-input-system.exit', () => {
      this.exitScreen();
    });

    this._updateSystem = new InventoryUpdateSystem(renderer, entityManager);
    this._updateSystem.on('inventory-update-system.start-drag', iconSprite => {

      // sprite drag end events don't work properly if sprite is not drawn above sprite it is overlapping, so move current sprite to draw last
      this.swapChildren(iconSprite, _.last(this.children));

    });
    this._updateSystem.on('inventory-update-system.trash-entity', ent => {

      const iconSprite = ent.get('InventoryIconComponent').iconSprite;

      iconSprite.removeAllListeners('mousedown')
                .removeAllListeners('mousemove')
                .removeAllListeners('mouseup')
                .removeAllListeners('mouseupoutside');
      
      this.removeChild(iconSprite);

      if (ent.has('MovieClipComponent')) {
        this._levelScreen.removeChild(ent.get('MovieClipComponent').movieClip);
      }

      if (ent.has('MeleeAttackComponent')) {
        this._levelScreen.removeChild(ent.get('MeleeAttackComponent').graphics);
      }

    });
    this._updateSystem.initialize(entities);

  }

  unload(entities) {

    _.each(this._renderSystems, s => { s.unload(entities, this._levelScreen); });
    this._inputSystem.removeAllListeners('inventory-input-system.exit');
    this._updateSystem.removeAllListeners('inventory-update-system.start-drag');
    this._updateSystem.removeAllListeners('inventory-update-system.trash-entity');
    this._updateSystem.unload(entities, this._levelScreen);

    this._levelScreen = undefined;

    this._renderSystems = undefined;
    this._inputSystem = undefined;
    this._updateSystem = undefined;

  }

  update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen) {

    super.update(gameTime, entities, otherScreenHasFocus, coveredByOtherScreen);

    this._updateSystem.process(gameTime, entities);

  }

  handleInput(gameTime, entities, input) {

    super.handleInput(gameTime, entities, input);

    this._inputSystem.process(gameTime, entities, input);

  }

  draw(gameTime, entities) {

    super.draw(gameTime, entities);

    for (const renderSys of this._renderSystems) {
      renderSys.process(gameTime, entities);
    }

  }

}
