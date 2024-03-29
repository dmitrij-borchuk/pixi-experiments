import { Scene } from 'phaser'
import { Player } from '../../objects/Player'
import { TILE_SIZE } from '../../config'
import { Door } from '../../objects/Door'
import { Gas } from '../../objects/Gas'
import { Wall } from '../../objects/Wall'
import { getTileFromCoords } from '../../mapUtils'

export class Main extends Scene {
  private player!: Player
  public blockingMap: boolean[][] = []
  public tool: string | null = null
  constructor() {
    super('main')
  }
  objects: any[] = []
  create(): void {
    this.player = new Player(this, 0, 0)

    this.input.on(
      'pointerdown',
      (e: any) => {
        const x = Math.round(e.worldX / TILE_SIZE) * TILE_SIZE
        const y = Math.round(e.worldY / TILE_SIZE) * TILE_SIZE
        this.onUseTool(x, y)
      },
      this
    )
  }
  onUseTool(x: number, y: number) {
    if (this.tool) {
      this.createItem(this.tool, x, y)
    }
  }
  createItem(type: string, x: number, y: number, config?: any) {
    console.log('=-= 🚀 ~ Main ~ createItem ~ type:', type)
    // TODO: switch
    if (type === 'Wall') {
      const wall = new Wall(this, x, y)
      this.addBlocking(x, y)
      this.objects.push(wall)
    } else if (type === 'Door') {
      const door = new Door(this, x, y)
      this.addBlocking(x, y)
      this.objects.push(door)
    } else if (type === 'Gas') {
      this.objects.push(
        new Gas(this, x, y, {
          // TODO: get from loading
          volume: 2500,
        })
      )
    } else if (type === 'clear') {
      const items = this.getItemsAtPoint(x, y)
      items.forEach((i) => {
        this.objects.splice(this.objects.indexOf(i), 1)
        i.destroy()
      })
    } else {
      console.error('Unknown type', type)
    }
  }
  addBlocking(x: number, y: number) {
    this.blockingMap[x / TILE_SIZE] = this.blockingMap[x / TILE_SIZE] || []
    this.blockingMap[x / TILE_SIZE][y / TILE_SIZE] = true
  }
  update(d: number): void {
    this.player?.update(d)
    // TODO: optimize
    this.objects.forEach((o) => o.update(d))
  }
  getState() {
    // TODO: Save state
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
      },
      objects: this.objects.map((o) => ({
        x: o.x,
        y: o.y,
        type: o.constructor.name,
      })),
    }
  }
  setState(data: any) {
    // TODO: clear before load
    this.player.x = data.player.x
    this.player.y = data.player.y
    data.objects.forEach((o: any) => {
      this.createItem(o.type, o.x, o.y)
    })
  }
  setTool(tool: string) {
    this.tool = tool
  }

  getGasAtPoint(x: number, y: number) {
    const tileCoords = getTileFromCoords(x, y)
    const scene = this
    for (let i = 0; i < scene.objects.length; i++) {
      const element = scene.objects[i]
      const objectTile = getTileFromCoords(element.x, element.y)
      const isSameTile = objectTile.x === tileCoords.x && objectTile.y === tileCoords.y
      const isGas = element instanceof Gas
      if (isSameTile && isGas) {
        return element
      }
    }

    return null
  }
  getItemsAtPoint(x: number, y: number) {
    const tileCoords = getTileFromCoords(x, y)
    const scene = this
    return scene.objects.filter((o) => {
      const objectTile = getTileFromCoords(o.x, o.y)
      const isSameTile = objectTile.x === tileCoords.x && objectTile.y === tileCoords.y

      return isSameTile
    })
  }

  onDeath() {
    console.log('=========')
    console.log('Game over')
    console.log('=========')

    this.scene.pause()
    this.game.events.emit('death')
  }

  uiChanged() {
    this.game.events.emit('ui-change', {
      hp: this.player.hp / 100,
      oxygen: this.player.gasCanister / this.player.gasCanisterVolume,
    })
  }
}
