import { EventEmitter } from 'events'
import { nanoid } from 'nanoid'
import { Controls } from '../../utils/controls'
import { Coords } from '../../utils/types'
import { Crate } from './Crate'
import { GameItem, GameState, MapLayer } from './GameState'
import { Generator } from './Generator'
import { isContainer } from './helpers'
import { Player } from './Player'

export class Game extends EventEmitter {
  static EVENTS = {
    stateChanged: 'stateChanged',
  }
  public state!: GameState
  private controls: Controls
  private player: Player
  private movableMap: boolean[][]
  private roomSize = 16

  constructor() {
    super()

    this.movableMap = makeMovableMap(this.roomSize, this.roomSize)
    this.player = new Player(Math.floor(this.roomSize / 2), Math.floor(this.roomSize / 2))
    const roomWalls = makeRoomWithSprite(0, 0, this.roomSize, this.roomSize, 'wallGrey')
    const generator = new Generator(Math.floor(this.roomSize / 2), Math.floor(this.roomSize / 2) - 1)
    const crate = new Crate(Math.floor(this.roomSize / 2), Math.floor(this.roomSize / 2) - 1)
    crate.addContent(generator)
    const roomItems = [...roomWalls, crate]
    this.state = {
      map: {
        roomSize: this.roomSize,
        room: {
          layers: [
            {
              name: 'floor',
              show: true,
              items: fillRectWithSprite(0, 0, this.roomSize, this.roomSize, 'floor'),
            },
            {
              name: 'objects',
              show: true,
              items: [...roomItems, this.player],
            },
          ],
        },
      },
      ui: {
        container: {
          show: false,
          content: [],
        },
      },
    }
    updateMovableMap(this.movableMap, roomItems)
    this.controls = new Controls({ step: 1 })
    this.controls.on('move', this.onMove)

    this.emit(Game.EVENTS.stateChanged, this.state)
  }

  private onMove = (e: Coords) => {
    const newX = this.player.x + e.x
    const newY = this.player.y - e.y
    if (newX >= this.roomSize || newX < 0 || newY >= this.roomSize || newY < 0) {
      // Out of room
      return
    }
    if (this.movableMap[newX][newY]) {
      this.player.x = newX
      this.player.y = newY
      this.emit(Game.EVENTS.stateChanged, this.state)
    }
  }

  public destroy() {
    this.controls.destroy()
    this.removeAllListeners()
  }

  public onClick(x: number, y: number) {
    if (getDistance(this.player, { x, y }) > this.player.interactionDistance) {
      // Too far
      return
    }

    const itemsHere = getOnCoords(this.state.map.room.layers, { x, y })
    const firstItem = itemsHere[0]

    if (isContainer(firstItem)) {
      const content = firstItem.getContent()

      this.state.ui.container.show = true
      this.state.ui.container.content = content
      this.emit(Game.EVENTS.stateChanged, this.state)
    }
  }
}

function fillRectWithSprite(left: number, top: number, w: number, h: number, sprite: string) {
  const tiles = []

  for (let x = left; x < w; x++) {
    for (let y = top; y < h; y++) {
      const element: GameItem = {
        x,
        y,
        sprite: sprite,
        type: 'static',
        id: nanoid(),
      }
      tiles.push(element)
    }
  }

  return tiles
}

function makeRoomWithSprite(left: number, top: number, w: number, h: number, sprite: string) {
  const tiles: GameItem[] = []

  for (let x = left; x < w; x++) {
    for (let y = top; y < h; y++) {
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
        if (x === Math.floor(w / 2) || y === Math.floor(h / 2)) {
          continue
        }
        tiles.push({
          x,
          y,
          sprite,
          type: 'static',
          id: nanoid(),
        })
      }
    }
  }

  return tiles
}

function makeMovableMap(w: number, h: number) {
  const map: boolean[][] = []

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      map[x] = map[x] || []
      map[x][y] = true
    }
  }

  return map
}

function updateMovableMap(map: boolean[][], items: Coords[]) {
  items.forEach((item) => {
    map[item.x][item.y] = false
  })
}

function getDistance(a: Coords, b: Coords) {
  const xDist = Math.abs(a.x - b.x)
  const yDist = Math.abs(a.y - b.y)

  return Math.max(xDist, yDist)
}

function getOnCoords(layers: MapLayer[], coords: Coords) {
  const result: GameItem[] = []
  layers.forEach((layer) => {
    const found = layer.items.find((item) => item.x === coords.x && item.y === coords.y)
    if (found) {
      result.push(found)
    }
  })

  return result.reverse()
}
