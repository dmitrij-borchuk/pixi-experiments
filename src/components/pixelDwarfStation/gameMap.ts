import PF from '@skeldjs/pathfinding.js'
import { GameObject, GameObjectState, objectKey2class } from './gameObject'

export interface GameMapState {
  items?: GameObjectState[]
  width: number
  height: number
}

export class GameMap {
  public items: GameObject[] = []
  public width: number
  public height: number
  private pathGrid

  constructor(state: GameMapState) {
    const { width, height, items = [] } = state
    this.height = height
    this.width = width
    this.pathGrid = new PF.Grid(width, height)

    this.items = items.map((i) => {
      const Constructor = objectKey2class[i.key]
      const instance = new Constructor() as GameObject
      if (!instance.isWalkable) {
        this.pathGrid.setWalkableAt(i.x, i.y, false)
      }
      return instance
    })
  }

  public addItem(value: GameObject) {
    if (value.x < 0) {
      value.x = 0
    }
    if (value.x >= this.width) {
      value.x = this.width - 1
    }
    if (value.y < 0) {
      value.y = 0
    }
    if (value.y >= this.height) {
      value.y = this.height - 1
    }

    // ConstructionsKey
    if (!value.isWalkable) {
      this.pathGrid.setWalkableAt(value.x, value.y, false)
    }

    this.items.push(value)
  }

  public findPath(x1: number, y1: number, x2: number, y2: number): [number, number][] {
    const finder = new PF.AStarFinder({
      allowDiagonal: true,
    })
    const gridBackup = this.pathGrid.clone()

    // console.log('=-= path', x1, y1, x2, y2, gridBackup)

    return finder.findPath(x1, y1, x2, y2, gridBackup)
  }

  public getNeighbors(x: number, y: number) {
    const node = this.pathGrid.nodes[y][x]
    return this.pathGrid.getNeighbors(node, 1)
  }

  public getItems(x: number, y: number) {
    return this.items.filter((i) => i.x === x && i.y === y)
  }

  public getState() {
    return {
      items: this.items.map((i) => i.getState()),
      width: this.width,
      height: this.height,
    }
  }
}
