import { ObjectInstanceDescriptor } from './types'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private container: ObjectInstanceDescriptor[] = []
  public addToContainer(item: ObjectInstanceDescriptor) {
    this.container.push(item)
  }

  public getContent() {
    return this.container
  }
}
