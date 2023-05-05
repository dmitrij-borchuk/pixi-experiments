import Phaser from 'phaser'
import { getDirection } from '../../utils/direction'
import { cartesianSpeedFromAngular } from '../../utils/speed'
import { Coords } from '../../utils/types'

// TODO: move to shared
export class Bullet extends Phaser.GameObjects.Image {
  speed!: number
  born!: number
  xSpeed!: number
  ySpeed!: number
  private timeToLive = 1800

  constructor(scene: Phaser.Scene, texture: string | Phaser.Textures.Texture, timeToLive?: number) {
    super(scene, 0, 0, texture)
    Phaser.GameObjects.Image.call(this, scene, 0, 0, texture)
    this.speed = 1
    this.born = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.setSize(12, 12)
    if (timeToLive) {
      this.timeToLive = timeToLive
    }
  }

  // Fires a bullet from the player to the target
  fire(shooter: DirectedPoint, target: Coords): void {
    this.setPosition(shooter.x, shooter.y) // Initial position

    const direction = getDirection(this, target)

    // Calculate X and y velocity of bullet to moves it from shooter to target
    const { x, y } = cartesianSpeedFromAngular(this.speed, direction)
    this.xSpeed = x
    this.ySpeed = y

    this.rotation = shooter.rotation // angle bullet with shooters rotation
    this.born = 0 // Time since new bullet spawned
  }

  // Updates the position of the bullet each cycle
  update(time: any, delta: number) {
    this.x += this.xSpeed * delta
    this.y += this.ySpeed * delta
    this.born += delta
    if (this.born > this.timeToLive) {
      // Disable object for the future usage
      this.setActive(false)
      this.setVisible(false)
    }
  }
}

interface DirectedPoint {
  x: number
  y: number
  rotation: number
}
