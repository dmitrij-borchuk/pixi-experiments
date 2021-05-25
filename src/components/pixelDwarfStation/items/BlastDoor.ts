import { nanoid } from 'nanoid'
import { Game } from '../game'
import { GameMap } from '../gameMap'
import { GameObject, GameObjectDependency, GameObjectConstructor } from '../gameObject'
import { Level } from '../level'
import { Log } from '../log'
import { GameObjectKey } from '../mapItems'

export class BlastDoor implements GameObject {
  public key: GameObjectKey = 'blastDoor'
  public x: number
  public y: number
  public id: string
  private log: Log
  private lastNeighbors: Record<string, string[]> = {}
  private isOpen = false
  private openDelay = 120
  private lastOpenAt = 0

  constructor(state: GameObjectConstructor, deps: GameObjectDependency) {
    this.x = state.x
    this.y = state.y
    this.log = deps.log
    this.id = nanoid()
  }
  getState() {
    return {
      key: this.key,
      x: this.x,
      y: this.y,
      id: this.id,
    }
  }
  public isWalkable = true
  public isConstruction = false

  public tick(time: number, map: GameMap, level: Level, game: Game) {
    const coords = [
      [this.x, this.y - 1],
      [this.x, this.y + 1],
      [this.x - 1, this.y],
      [this.x + 1, this.y],
    ]

    const hasMovement = coords.some(([x, y]) => this.checkNeighborsMovement(map, x, y))

    if (hasMovement) {
      this.isOpen = true
      this.lastOpenAt = time
    } else if (time - this.lastOpenAt > this.openDelay) {
      this.isOpen = false
    }
  }

  private checkNeighborsMovement(map: GameMap, x: number, y: number) {
    const neighbors = map.getItems(x, y).map((i) => i.id)
    const previousNeighbors = this.lastNeighbors[`${x}:${y}`] || []

    if (previousNeighbors.length !== neighbors.length) {
      return true
    }

    return previousNeighbors.every((pn) => neighbors.includes(pn))
  }
}
