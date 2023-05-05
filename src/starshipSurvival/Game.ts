import { Scene } from 'phaser'
import { SimpleMenuScene } from '../shared/SimpleMenu/SimpleMenu'
import { launchScene } from './utils'

export class GameScene extends Scene {
  public gameInProgress = false
  private menuScene!: SimpleMenuScene
  constructor() {
    super('game')
  }
  async create() {
    // this.scene.setVisible(false)
    this.menuScene = this.scene.get(SimpleMenuScene.key) as SimpleMenuScene
    await launchScene(this.menuScene)
    this.menuScene.addButton('Editor', () => this.launchEditor())
  }

  private async launchEditor() {
    this.menuScene.toggleMenu(false)
  }

  // private async saveGame() {
  //   if (!this.scenario) {
  //     throw new Error(`Can't save. Scenario not found.`)
  //   }
  //   const state = {
  //     scenario: this.scenario.save(),
  //   }

  //   saveGame('testSave', state)
  // }

  // private async loadGame() {
  //   this.scenario = new Scenario({
  //     sceneManager: this.scene,
  //   })

  //   const state = loadGame('testSave')
  //   this.scenario.load(state)
  // }
}
