// export class Player extends Phaser.Physics.Arcade.Sprite {
//   // private container: ObjectInstanceDescriptor[] = []
//   // public addToContainer(item: ObjectInstanceDescriptor) {
//   //   this.container.push(item)
//   // }

//   // public getContent() {
//   //   return this.container
//   // }
//   create() {
//     // sprite = this.physics.add.image(400, 300, 'ship');

//     sprite.setDamping(true)
//     sprite.setDrag(0.99)
//     sprite.setMaxVelocity(200)

//     cursors = this.input.keyboard.createCursorKeys()

//     text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' })
//   }
// }

export class Ship {
  // export class Bullet extends Phaser.GameObjects.Polygon {
  // speed!: number
  // born!: number
  // direction!: number
  // xSpeed!: number
  // ySpeed!: number
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private physics!: Phaser.Physics.Arcade.ArcadePhysics
  private polygon!: Phaser.GameObjects.Polygon

  constructor(scene: Phaser.Scene) {
    // const polygon2 = scene.add.polygon(200, 200, [7, 0, 14, 27, 0, 27])
    // polygon2.setStrokeStyle(2, 0xffffff)
    // const polygon = new Phaser.GameObjects.Polygon(scene, 200, 200, [7, 0, 14, 27, 0, 27])
    this.polygon = scene.add.polygon(200, 200, [0, 0, 28, 7, 0, 14])
    this.polygon.setStrokeStyle(2, 0xffffff)
    scene.physics.add.existing(this.polygon, false)
    // const renderTexture = new Phaser.GameObjects.RenderTexture(scene, 200, 200, 13, 26)
    // renderTexture.draw(polygon)
    // super(scene, 0, 0, renderTexture.texture)
    // Phaser.Physics.Arcade.Sprite.call(this, scene, 200, 200, renderTexture.texture)
    // sprite = scene.physics.add.sprite(400, 300, renderTexture.texture);

    // this.enableBody(true, 200, 200, true, true)
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.physics = scene.physics
    // this.setDrag(0.99)
    // this.speed = 1
    // this.born = 0
    // this.direction = 0
    // this.xSpeed = 0
    // this.ySpeed = 0
    // this.setDisplaySize(tileSize * 0.2, tileSize * 0.2)
  }

  // // Fires a bullet from the player to the reticle
  // fire(shooter: { x: number; y: number; rotation: number }, target: { x: number; y: number }): void {
  //   this.setPosition(shooter.x, shooter.y) // Initial position
  //   this.direction = Math.atan((target.x - this.x) / (target.y - this.y))

  //   // Calculate X and y velocity of bullet to moves it from shooter to target
  //   if (target.y >= this.y) {
  //     this.xSpeed = this.speed * Math.sin(this.direction)
  //     this.ySpeed = this.speed * Math.cos(this.direction)
  //   } else {
  //     this.xSpeed = -this.speed * Math.sin(this.direction)
  //     this.ySpeed = -this.speed * Math.cos(this.direction)
  //   }

  //   this.rotation = shooter.rotation // angle bullet with shooters rotation
  //   this.born = 0 // Time since new bullet spawned
  // }
  create() {
    // console.log('=-= cr this.body', this.body)
    const body = this.polygon.body as Phaser.Physics.Arcade.Body
    body.setDrag(100, 100)
  }

  // Updates the position of the bullet each cycle
  update(time: any, delta: number) {
    // this.x += this.xSpeed * delta
    // this.y += this.ySpeed * delta
    // this.born += delta
    // if (this.born > 1800) {
    //   this.setActive(false)
    //   this.setVisible(false)
    // }
    const body = this.polygon.body as Phaser.Physics.Arcade.Body

    if (this.cursors.up?.isDown) {
      console.log('=-= body.rotation', body.rotation)
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

    // if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    // {
    //     fireBullet();
    // }

    // this.physics.world.wrap(this, 32)

    // bullets.forEachExists(screenWrap, this);
  }
}
