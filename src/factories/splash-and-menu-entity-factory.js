import Entity from '../entity';
import MainMenuItemSpriteComponent from '../components/main-menu-item-sprite-component';
import VictoryTextComponent from '../components/victory-text-component';
import DefeatTextComponent from '../components/defeat-text-component';


export function buildMainMenuNewGameMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('New Game'));

}

export function buildMainMenuContinueMenuItemEntity() {

  return new Entity()
    .add(new MainMenuItemSpriteComponent('Continue'));

}

export function buildVictorySplashEntity(resources) {

  return new Entity()
    .add(new VictoryTextComponent('Congratulations!\nClick to play again!',
                                  {
                                    font: '16px silkscreennormal',
                                    fill: '#ffffff',
                                    align: 'center'
                                  }));

}

export function buildDefeatSplashEntity(resources) {

  return new Entity()
    .add(new DefeatTextComponent('You have been defeated.\nClick to try again.',
                                 {
                                   font: '16px silkscreennormal',
                                   fill: '#ff0000',
                                   align: 'center'
                                 }));

}