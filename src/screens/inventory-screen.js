import _ from 'lodash';
import InventoryInputSystem from '../systems/inventory-input-system';
import InventoryRenderSystem from '../systems/inventory-render-system';
import InventoryUpdateSystem from '../systems/inventory-update-system';
import UseItemSystem from '../systems/use-item-system';
import Screen from '../screen';

export default class InventoryScreen extends Screen {
  constructor(levelScreen) {
    super(true);

    this._inputSystem = null;
    this._updateSystem = null;
    this._renderSystems = null;
    this._useItemSystem = null;

    this._levelScreen = levelScreen;
  }

  activate(entities) {
    super.activate(entities);

    const renderer = this.screenManager.renderer;
    const entityManager = this.screenManager.entityManager;

    this.scale.set(renderer.globalScale, renderer.globalScale);

    this._renderSystems = [new InventoryRenderSystem(this, renderer, entityManager)];

    for (const renderSys of this._renderSystems) {
      renderSys.initialize(entities);
    }

    this._useItemSystem = new UseItemSystem(renderer, entityManager);

    this._inputSystem = new InventoryInputSystem();
    this._inputSystem.initialize(entities);
    this._inputSystem.on('close', () => {
      this.exitScreen();
    });

    this._updateSystem = new InventoryUpdateSystem(renderer, entityManager)
      .on('inventory-update-system.start-drag', iconSprite => {
        // sprite drag end events don't work properly if sprite is not drawn above sprite it is overlapping, so move current sprite to draw last
        this.swapChildren(iconSprite, _.last(this.children));
      })
      .on('inventory-update-system.trash-entity', ent => {
        const iconSprite = ent.get('InventoryIconComponent').sprite.removeAllListeners();

        this.removeChild(iconSprite);

        if (ent.has('AnimatedSpriteComponent')) {
          this._levelScreen.removeChild(ent.get('AnimatedSpriteComponent').animatedSprite);
        }

        if (ent.has('MeleeAttackComponent')) {
          this._levelScreen.removeChild(ent.get('MeleeAttackComponent').graphics);
        }
      })
      .on('use-item', (hero, item) => {
        this._useItemSystem.useItem(hero, item);
      })
      .initialize(entities);
  }

  unload(entities) {
    this._inputSystem.removeAllListeners();
    this._inputSystem.unload(entities);

    this._updateSystem.removeAllListeners();
    this._updateSystem.unload(entities, this._levelScreen);

    for (const renderSystem of this._renderSystems) {
      renderSystem.removeAllListeners();
      renderSystem.unload(entities, this._levelScreen);
    }

    this._useItemSystem.removeAllListeners();
    this._useItemSystem.unload(entities);
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
