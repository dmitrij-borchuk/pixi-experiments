import { nanoid } from 'nanoid'
import { Container, GameItem, GameItemType } from './GameState'

export class Crate implements Container {
  public id = nanoid()
  public x: number
  public y: number
  public sprite = 'crate'
  public type: GameItemType = 'container'
  private content: GameItem[] = []

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public getContent() {
    return this.content
  }

  public addContent(item: GameItem) {
    this.content.push(item)

    return this.content
  }

  public removeContent(id: string) {
    const index = this.content.findIndex((d) => d.id === id)
    if (index >= 0) {
      this.content.splice(index, 1)
    }

    return this.content
  }
}
