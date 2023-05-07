import { GameObjects } from 'phaser'
import { TILE_SIZE } from '../config'
import { Main } from '../scenes'
import { Gas } from './Gas'

export class Door extends GameObjects.Sprite {
  open: boolean = false
  constructor(scene: Main, x: number, y: number) {
    super(scene, x, y, 'door')
    scene.add.existing(this)
    this.setDisplaySize(TILE_SIZE, TILE_SIZE)
    this.setInteractive()
    this.on('pointerdown', () => {
      this.onDoorClick()
    })
  }
  onDoorClick() {
    const scene = this.scene as Main
    this.open = !this.open
    scene.blockingMap[this.x / TILE_SIZE][this.y / TILE_SIZE] = !this.open

    this.setTexture(this.open ? 'doorOpen' : 'door')

    if (!this.open) {
      this.dealWithGas()
    }
  }
  dealWithGas() {
    const scene = this.scene as Main
    const gas = scene.getGasAtPoint(this.x, this.y)
    const { blockingMap } = scene
    const x = this.x / TILE_SIZE
    const y = this.y / TILE_SIZE
    if (gas) {
      const siblings = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]
      const possibleTargets = siblings
        .filter(([x, y]) => {
          return !blockingMap[x]?.[y]
        })
        .map(([x, y]) => {
          return {
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            item: scene.getGasAtPoint(x * TILE_SIZE, y * TILE_SIZE),
          }
        })
      if (possibleTargets.length === 0) {
        return
      }
      const v = gas.volume / possibleTargets.length
      possibleTargets.forEach((target) => {
        if (!target.item) {
          scene.objects.push(new Gas(scene, target.x, target.y, { volume: v }))
        } else {
          target.item.volume = target.item.volume + v
        }
      })

      gas.destroy()
      scene.objects.splice(scene.objects.indexOf(gas), 1)
    }
  }
}
