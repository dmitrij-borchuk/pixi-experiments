import { GameObjects, Scene } from 'phaser'
import { TILE_SIZE } from '../config'
import { Main } from '../scenes'
import { getTileFromCoords } from '../mapUtils'
import { getRandomFromArray } from '../mathUtils'

const minAlpha = 0
const maxAlpha = 0.5
export class Gas extends GameObjects.Container {
  step = 300
  lastStep = 0
  volume = 0
  text: GameObjects.Text
  constructor(scene: Scene, x: number, y: number, config?: GasConfig) {
    super(scene, x, y)
    const rec = new GameObjects.Rectangle(scene, 0, 0, TILE_SIZE, TILE_SIZE, 0x0000ff)
    const txtValue = (config?.volume || 0).toFixed(2)
    this.text = new GameObjects.Text(scene, -16, -16, `${txtValue}`, {
      color: '#ffffff',
      fontSize: '8px',
    })
    this.add(rec)
    this.add(this.text)
    this.alpha = calcAlpha(config?.volume || 0)
    this.volume = config?.volume || 0
    scene.add.existing(this)
    this.lastStep = this.scene.time.now + Phaser.Math.Between(0, this.step)
  }

  update(d: number) {
    this.setAlpha(calcAlpha(this.volume))
    this.text.setText(this.volume.toFixed(2))
    if (this.lastStep + this.step > d) {
      return
    }
    const scene = this.scene as Main

    if (this.volume < 0.1) {
      scene.objects.splice(scene.objects.indexOf(this), 1)
      this.destroy()
      return
    }

    const { blockingMap } = scene
    const x = this.x / TILE_SIZE
    const y = this.y / TILE_SIZE
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
        return this.getGasAtPoint(x * TILE_SIZE, y * TILE_SIZE)
      })
    const target = getRandomFromArray(possibleTargets)
    if (!target.item) {
      scene.objects.push(new Gas(scene, target.x, target.y, { volume: this.volume / 2 }))
      this.volume = this.volume / 2
    } else if (target.item.volume < this.volume) {
      const v = (this.volume - target.item.volume) / 2
      target.item.volume = target.item.volume + v
      this.volume = this.volume - v
    }
    this.lastStep = d
  }

  getGasAtPoint(x: number, y: number) {
    const tileCoords = getTileFromCoords(x, y)
    const scene = this.scene as Main
    for (let i = 0; i < scene.objects.length; i++) {
      const element = scene.objects[i]
      const objectTile = getTileFromCoords(element.x, element.y)
      const isSameTile = objectTile.x === tileCoords.x && objectTile.y === tileCoords.y
      const isGas = element instanceof Gas
      if (isSameTile && isGas) {
        return {
          x: x,
          y: y,
          item: element,
        }
      }
    }

    return {
      x: x,
      y: y,
      item: null,
    }
  }
}

type GasConfig = {
  volume: number
}

function calcAlpha(volume: number) {
  return ((maxAlpha - minAlpha) / 100) * volume + minAlpha
}
