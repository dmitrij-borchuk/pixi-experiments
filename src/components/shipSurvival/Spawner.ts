import Phaser from 'phaser'
import { RoomScene } from './phaser'

export class Spawner extends Phaser.GameObjects.GameObject {
  private lastEnemyOffset = 0
  private timeout = 20000

  constructor(public scene: RoomScene, public x?: number, public y?: number) {
    super(scene, 'spawner')
    Phaser.GameObjects.GameObject.call(this, scene, 'spawner')
    this.checkAndCreate()
  }

  private checkAndCreate() {
    if (this.x !== undefined && this.y !== undefined) {
      this.scene.createEnemy(this.x, this.y)
    }
  }

  update(time: any, delta: any) {
    if (time - this.lastEnemyOffset > this.timeout) {
      this.lastEnemyOffset = time
      this.checkAndCreate()
    }
  }
}
