import { GameObjects, Scene } from 'phaser'
import { TILE_SIZE } from '../config'

export class Wall extends GameObjects.Sprite {
  open: boolean = false
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'wall')
    this.setDisplaySize(TILE_SIZE, TILE_SIZE)
    scene.add.existing(this)
  }
}
