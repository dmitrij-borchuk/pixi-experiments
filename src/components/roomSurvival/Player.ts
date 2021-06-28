import { nanoid } from 'nanoid'
import { GameItem, GameItemType } from './GameState'

export class Player implements GameItem {
  public id = nanoid()
  public type: GameItemType = 'player'
  public x: number
  public y: number
  public sprite = 'player'
  public interactionDistance = 1

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}
