import { GameObjects } from 'phaser'
import { TILE_SIZE } from '../config'
import { Main } from '../scenes'

const gasCanisterVolume = 2500
// TODO: open helmet when oxygen is present
export class Player extends GameObjects.Sprite {
  private keyW: Phaser.Input.Keyboard.Key
  private keyA: Phaser.Input.Keyboard.Key
  private keyS: Phaser.Input.Keyboard.Key
  private keyD: Phaser.Input.Keyboard.Key
  private lastMove = 0
  private moveDelay = 300
  gasCanister = 2500
  airPerBreath = 1
  breathingFrequency = 2000
  hp = 100
  lastBreath = 0

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
    this.refileOxygen()
    if (this.lastBreath + this.breathingFrequency < d) {
      this.breath()
      this.lastBreath = d
    }
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
  damage(v: number) {
    this.hp = this.hp - v

    if (this.hp <= 0) {
      console.log('Game over')
      this.hp = 0
    }
  }
  private refileOxygen() {
    if (this.gasCanister >= gasCanisterVolume) {
      return
    }
    const scene = this.scene as Main
    const gas = scene.getGasAtPoint(this.x, this.y)
    if (!gas) {
      return
    }
    const refileSpeed = 1
    const volume = Math.min(refileSpeed, gas.volume, gasCanisterVolume - this.gasCanister)
    this.gasCanister = this.gasCanister + volume
  }
  private breath() {
    const scene = this.scene as Main
    const gas = scene.getGasAtPoint(this.x, this.y)
    if (!gas) {
      const volume = Math.min(this.airPerBreath, this.gasCanister)
      this.gasCanister = this.gasCanister - volume
      if (this.airPerBreath > volume) {
        // TODO: add effects
        this.damage(10)
      }
      return
    }
    const volume = Math.min(this.airPerBreath, gas.volume)
    gas.volume = gas.volume - volume
    if (this.airPerBreath > volume) {
      this.damage(10)
    }
  }
  move(d: number, xOffset: number, yOffset: number) {
    const scene = this.scene as Main
    const newX = this.x + xOffset * TILE_SIZE
    const newY = this.y + yOffset * TILE_SIZE
    if (scene.blockingMap[newX / TILE_SIZE]?.[newY / TILE_SIZE]) {
      return
    }

    this.x = newX
    this.y = newY
    this.lastMove = d
  }
}
