import { Container, GameItem } from './GameState'

export function isContainer(item: GameItem): item is Container {
  return item.type === 'container'
}
