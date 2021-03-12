import { Scene } from 'phaser'
// import { SCENES } from '../constants'
// import { MainScene } from './game'
// import { run as runTestScenario } from '../scenarios/test'

export class MenuScene extends Scene {
  constructor() {
    super('menu')
  }
  preload() {}
  create() {
    this.scene.setVisible(false)
    this.scene.moveAbove('hud')
    // TODO: this.scene.get(SCENES.MAIN).events.on('escBtn') - show menu
    this.scene.start('main')
    this.scene.start('hud')
  }
  update(time: number, delta: number) {}

  // private runScenario() {
  //   // TODO: move to come onclick event
  //   const mainScene = this.scene.get(SCENES.MAIN) as MainScene
  //   runTestScenario(mainScene)
  // }

  // private loadGame() {
  //   // // TODO: apply scenario some how
  //   // const loadedGame = loadGame<GameState>('ds1')
  //   // const mainScene = this.scene.get(SCENES.MAIN) as MainScene
  //   // mainScene.applyWorld(loadedGame)
  // }
}
