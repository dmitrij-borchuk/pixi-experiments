import { GameObjects, Scene } from 'phaser'
import { TILE_SIZE } from '../config'
import { Main } from '../scenes'

export class Door extends GameObjects.Sprite {
  open: boolean = false
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'door')
    scene.add.existing(this)
    this.setDisplaySize(TILE_SIZE, TILE_SIZE)
    this.setInteractive()
    this.on('pointerdown', () => {
      this.open = !this.open
      // this.setFrame(1)
      const scene = this.scene as Main
      scene.blockingMap[this.x / TILE_SIZE][this.y / TILE_SIZE] = !this.open

      this.setTexture(this.open ? 'doorOpen' : 'door')
    })
  }
  update(d: number) {}
}
