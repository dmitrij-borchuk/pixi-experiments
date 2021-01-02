import { GameState, ConstructedObject, StuffObject } from './types'

export function generateInitialStructure(): GameState {
  const walls = new Map<string, ConstructedObject | StuffObject>([
    [
      '51|51',
      {
        kind: 'stuff',
        type: 'frame',
        amount: 20,
      },
    ],
    [
      '49|49',
      {
        kind: 'construction',
        type: 'crate',
        angle: 0,
        health: 100,
        step: 0,
        data: {
          content: [
            {
              kind: 'stuff',
              type: 'ironPlate',
              amount: 20,
            },
            {
              kind: 'stuff',
              type: 'solarPanel',
              amount: 1,
            },
            {
              kind: 'stuff',
              type: 'glass',
              amount: 10,
            },
          ],
        },
        ingredients: [],
        variant: 'crate',
      },
    ],
  ])

  return {
    world: {
      x: 0,
      y: 0,
      h: 100,
      w: 100,
    },
    player: {
      position: [50, 50] as [number, number],
      backpack: [{ type: 'frame', amount: 20 }],
      belt: [],
    },
    map: {
      layers: {
        walls,
        floor: new Map(),
        pipes: new Map(),
        cables: new Map(),
        stuff: new Map(),
      },
    },
  }
}
