// TODO: max speed

import { Bullet } from './bullet'

// TODO: change controls (ship is pointing to the cursor, UP - faster, LEFT and RIGHT - strafe)
export class Ship {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private physics!: Phaser.Physics.Arcade.ArcadePhysics
  private scene!: Phaser.Scene
  public polygon!: Phaser.GameObjects.Polygon

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.polygon = scene.add.polygon(200, 200, [0, 0, 28, 7, 0, 14], 0x000000)
    this.polygon.setStrokeStyle(2, 0xffffff)
    scene.physics.add.existing(this.polygon, false)
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.physics = scene.physics
  }

  create() {
    const body = this.polygon.body as Phaser.Physics.Arcade.Body
    body.setDrag(100, 100)

    const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

    // Fires bullet on left click of mouse
    this.scene.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, time: any, lastFired: any) => {
        // TODO: check it
        if (this.polygon.active === false) return

        // Get bullet from bullets group
        const bullet: Bullet = playerBullets.get().setActive(true).setVisible(true)

        if (bullet) {
          bullet.fire(this.polygon, { x: pointer.worldX, y: pointer.worldY })
          // // TODO: sometimes bullets go through the enemy
          // this.enemies.forEach((enemy) => {
          //   this.physics.add.collider(enemy, bullet, this.enemyHitCallback.bind(this))
          // })
          // this.walls.children.getArray().forEach((item) => {
          //   this.physics.add.collider(item, bullet, this.enemyHitCallback.bind(this))
          // })
        }
      },
      this
    )
  }

  update(time: any, delta: number) {
    const body = this.polygon.body as Phaser.Physics.Arcade.Body

    if (this.cursors.up?.isDown) {
      this.physics.velocityFromRotation(body.rotation * (Math.PI / 180), 200, body.acceleration)
    } else {
      body.setAcceleration(0, 0)
    }

    if (this.cursors.left?.isDown) {
      body.setAngularVelocity(-300)
    } else if (this.cursors.right?.isDown) {
      body.setAngularVelocity(300)
    } else {
      body.setAngularVelocity(0)
    }
  }
}
