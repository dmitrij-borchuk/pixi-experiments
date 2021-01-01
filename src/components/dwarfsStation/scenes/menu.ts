import { Scene } from 'phaser'
import { SCENES } from '../constants'

export class MenuScene extends Scene {
  constructor() {
    super(SCENES.MENU)
  }
  preload() {}
  create() {
    // TODO: move to come onclick event
    this.scene.launch(SCENES.MAIN)
    this.scene.setVisible(false)
    this.scene.moveAbove(SCENES.HUD)
    // TODO: this.scene.get(SCENES.MAIN).events.on('escBtn') - show menu
  }
  update(time: number, delta: number) {}
}
