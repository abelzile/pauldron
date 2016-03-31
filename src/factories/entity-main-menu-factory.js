import Entity from '../entity';
import MainMenuItemSpriteComponent from '../components/main-menu-item-sprite-component';


export function buildMainMenuNewGameMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('New Game'));

}

export function buildMainMenuContinueMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('Continue'));

}
