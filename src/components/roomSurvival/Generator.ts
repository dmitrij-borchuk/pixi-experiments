import { nanoid } from 'nanoid'
import { GameItem, GameItemType } from './GameState'

export class Generator implements GameItem {
  public id = nanoid()
  public type: GameItemType = 'static'
  public x: number
  public y: number
  public sprite = 'generator'

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}
