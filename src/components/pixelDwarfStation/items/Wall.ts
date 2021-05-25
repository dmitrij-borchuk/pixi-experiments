import { nanoid } from 'nanoid'
import { GameObject, GameObjectDependency, GameObjectConstructor } from '../gameObject'
import { Log } from '../log'
import { GameObjectKey } from '../mapItems'

export class Wall implements GameObject {
  public key: GameObjectKey = 'wall'
  public x: number
  public y: number
  public id: string
  private log: Log

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
  public isWalkable = false
  public isConstruction = true

  public tick() {}
}
export class WallBlueprint implements GameObject {
  public key: GameObjectKey = 'wallBlueprint'
  public isConstruction = true
  public isWalkable = true
  public x: number
  public y: number
  public id: string
  private log: Log

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

  public tick() {}
}
