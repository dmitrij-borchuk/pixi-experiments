export interface ObjectConfig {
  id: string
  displayNameKey: string
  defaultDisplayName: string
  isContainer?: boolean
  view: string
  isDroppable?: boolean
  isBuildable?: boolean
  stack?: number
  buildProps?: {
    isSolid?: boolean
    buildSteps?: {
      toMake?: {
        ingredients: {
          name: string
          amount: number
        }[]
      }
      gasOpaque: boolean
      lightOpaque: boolean
    }[]
  }
  maxHealth?: number
}

export interface ObjectInstanceDescriptor {
  id: string
  amount: string
}

export type Position = [number, number]

export interface ConstructedObject {
  kind: 'construction'
  id: string
  step: number
  angle: number
  health: number
  data?: any
}

export interface PlayerState {
  position: Position
  backpack: ObjectInstanceDescriptor[]
  belt: ObjectInstanceDescriptor[]
}

export interface StuffObject {
  kind: 'stuff'
  id: string
  amount: number
}

export interface GameState {
  world: {
    x: number
    y: number
    h: number
    w: number
  }
  map: Record<string, ConstructedObject | StuffObject>
  player: PlayerState
}
