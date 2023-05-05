import { Scene } from 'phaser'
import { loadGame, saveGame } from '../../../utils/gameUtils'
import { SCENES } from '../constants'
import { Scenario } from '../scenarios/test'
import { launchScene } from '../scenarios/tools'

export class GameScene extends Scene {
  public gameInProgress = false
  private scenario?: Scenario
  constructor() {
    super(SCENES.MAIN)
  }
  async create() {
    this.scene.setVisible(false)

    const menuScene = this.scene.get(SCENES.MENU)

    this.input.keyboard.on('keydown-ESC', () => {
      menuScene.scene.setVisible(!menuScene.scene.isVisible())
    })
    await launchScene(menuScene)
    menuScene.events.on('onContinueClick', () => {
      menuScene.scene.setVisible(false)
    })
    menuScene.events.on('onNewGameClick', () => {
      menuScene.scene.setVisible(false)
      this.newGame()
    })
    menuScene.events.on('onSaveClick', () => {
      this.saveGame()
    })
    menuScene.events.on('onLoadClick', () => {
      this.loadGame()
    })
  }

  private async newGame() {
    this.scenario = new Scenario()
    // this.scenario = new Scenario({
    //   sceneManager: this.scene,
    // })
    // const scenario = initScenario({
    //   sceneManager: this.scene,
    // })
    // const runner = new ScenarioRunner(scenario)
    // this.scenarioRunner = runner
    // await this.scenario.start()

    this.gameInProgress = true
  }

  private async saveGame() {
    if (!this.scenario) {
      throw new Error(`Can't save. Scenario not found.`)
    }
    const state = {
      // scenario: this.scenario.save(),
    }

    saveGame('testSave', state)
  }

  private async loadGame() {
    // this.scenario = new Scenario({
    //   sceneManager: this.scene,
    // })

    const state = loadGame('testSave')
    // this.scenario.load(state)
  }
}
