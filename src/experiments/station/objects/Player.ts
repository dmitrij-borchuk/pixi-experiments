import { GameObjects, Scene } from 'phaser'
import { TILE_SIZE } from '../config'
import { Main } from '../scenes'

export class Player extends GameObjects.Sprite {
  private keyW: Phaser.Input.Keyboard.Key
  private keyA: Phaser.Input.Keyboard.Key
  private keyS: Phaser.Input.Keyboard.Key
  private keyD: Phaser.Input.Keyboard.Key
  private lastMove = 0
  private moveDelay = 300

  constructor(scene: Main, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    this.keyW = scene.input.keyboard.addKey('W')
    this.keyA = scene.input.keyboard.addKey('A')
    this.keyS = scene.input.keyboard.addKey('S')
    this.keyD = scene.input.keyboard.addKey('D')

    this.initCamera()
  }
  private initCamera() {
    this.scene.cameras.main.setSize(this.scene.game.scale.width, this.scene.game.scale.height)
    this.scene.cameras.main.startFollow(this, true, 0.09, 0.09)
    this.scene.cameras.main.setZoom(2)
  }
  update(d: number) {
    if (this.lastMove + this.moveDelay > d) {
      return
    }
    if (this.keyW?.isDown) {
      this.move(d, 0, -1)
    }
    if (this.keyA?.isDown) {
      this.move(d, -1, 0)
    }
    if (this.keyS?.isDown) {
      this.move(d, 0, 1)
    }
    if (this.keyD?.isDown) {
      this.move(d, 1, 0)
    }
  }
  move(d: number, xOffset: number, yOffset: number) {
    const scene = this.scene as Main
    const newX = this.x + xOffset * TILE_SIZE
    const newY = this.y + yOffset * TILE_SIZE
    if (scene.blockingMap[newX / TILE_SIZE]?.[newY / TILE_SIZE]) {
      return
    }

    console.log('=-= 🚀 ~ Player ~ update ~ scene.blockingMap:', scene.blockingMap)
    console.log('=-= 🚀 ~ Player ~ update ~ this:', newX / TILE_SIZE, newY / TILE_SIZE)
    this.x = newX
    this.y = newY
    this.lastMove = d
  }
}
