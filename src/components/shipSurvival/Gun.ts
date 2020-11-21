import Phaser, { Scene } from 'phaser'
import { TILE_SIZE } from './constants'
import { Usable } from './types'

export class Gun extends Phaser.GameObjects.Image implements Usable {
  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x || 0, y || 0, 'laserGun')
    Phaser.GameObjects.Image.call(this, scene, x || 0, y || 0, 'laserGun')
    this.setDisplaySize(TILE_SIZE, TILE_SIZE)
  }

  public use() {
    // TODO: need to remove from `objectMap`
    this.destroy()

    return {
      inventory: ['laserGun'],
    }
  }
}
