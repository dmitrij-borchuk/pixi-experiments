import Phaser, { Scene } from 'phaser'

const tileSize = 120

export class Bullet extends Phaser.GameObjects.Image {
  speed!: number
  born!: number
  direction!: number
  xSpeed!: number
  ySpeed!: number

  constructor(scene: Scene) {
    super(scene, 0, 0, 'bullet')
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet')
    this.speed = 1
    this.born = 0
    this.direction = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.setDisplaySize(tileSize * 0.2, tileSize * 0.2)
  }

  // Fires a bullet from the player to the reticle
  fire(shooter: { x: number; y: number; rotation: number }, target: { x: number; y: number }): void {
    this.setPosition(shooter.x, shooter.y) // Initial position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y))
    // console.log('=-= direction', this.direction / (Math.PI / 180))
    // console.log('=-= target', target)
    // console.log('=-= shooter', shooter)

    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction)
      this.ySpeed = this.speed * Math.cos(this.direction)
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction)
      this.ySpeed = -this.speed * Math.cos(this.direction)
    }

    this.rotation = shooter.rotation // angle bullet with shooters rotation
    this.born = 0 // Time since new bullet spawned
  }

  // Updates the position of the bullet each cycle
  update(time: any, delta: number) {
    this.x += this.xSpeed * delta
    this.y += this.ySpeed * delta
    this.born += delta
    if (this.born > 1800) {
      this.setActive(false)
      this.setVisible(false)
    }
  }
}
