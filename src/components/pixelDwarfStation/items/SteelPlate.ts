import { nanoid } from 'nanoid'
import { GameObject, GameObjectDependency, GameObjectConstructor } from '../gameObject'
import { Log } from '../log'
import { GameObjectKey } from '../mapItems'

export class SteelPlate implements GameObject {
  public key: GameObjectKey = 'steelPlate'
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
  public isWalkable = true
  public isConstruction = false

  public tick() {}
}
