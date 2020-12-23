export interface ObjectInstanceConfig {
  id: string
  state: 'kit' | 'constructed'
  amount: number
  position: [number, number]
}

export function generateInitialStructure() {
  return {
    world: {
      x: 0,
      y: 0,
      h: 100,
      w: 100,
    },
    player: {
      position: [50, 50] as [number, number],
    },
    objects: [
      {
        id: 'frame',
        state: 'kit',
        amount: 20,
        position: [52, 52],
      },
    ],
  }
}
