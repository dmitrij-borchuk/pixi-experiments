export type GameItemType = 'container' | 'static' | 'player'
export interface GameItem {
  id: string
  x: number
  y: number
  sprite: string
  type: GameItemType
}
export interface Container extends GameItem {
  getContent: () => GameItem[]
  addContent: (item: GameItem) => GameItem[]
  removeContent: (id: string) => GameItem[]
}
export type ContainerItem = {
  sprite: string
  amount: number
}
export type MapLayer = {
  show: boolean
  name: string
  items: GameItem[]
}
export type GameState = {
  map: {
    roomSize: number
    room: {
      layers: MapLayer[]
    }
  }
  ui: {
    container: {
      show: boolean
      content: GameItem[]
    }
  }
}
