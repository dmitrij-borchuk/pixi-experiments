import { GameState } from './types'

export interface ObjectInstanceConfig {
  id: string
  state: 'kit' | 'constructed'
  amount: number
  position: [number, number]
}

export function generateInitialStructure(): GameState {
  return {
    world: {
      x: 0,
      y: 0,
      h: 100,
      w: 100,
    },
    player: {
      position: [50, 50] as [number, number],
      backpack: [],
      belt: [],
    },
    map: {
      '51|51': {
        kind: 'lying',
        id: 'frame',
        amount: 20,
        position: [52, 52],
      },
    },
  }
}
