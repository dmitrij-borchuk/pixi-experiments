import { GameState } from './types'

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
      backpack: [
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
        { id: 'frame', amount: 20 },
      ],
      belt: [],
    },
    map: {
      '51|51': {
        kind: 'stuff',
        id: 'frame',
        amount: 20,
      },
      '49|49': {
        kind: 'construction',
        id: 'crate',
        angle: 0,
        health: 100,
        step: 0,
        data: {
          content: [
            {
              kind: 'stuff',
              id: 'ironPlate',
              amount: 20,
            },
          ],
        },
      },
    },
  }
}
