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
  kind: 'constructed'
  id: string
  step: number
  angle: number
  health: number
  position: Position
}

export interface PlayerState {
  position: Position
  backpack: ObjectInstanceDescriptor[]
  belt: ObjectInstanceDescriptor[]
}

export interface LyingObject {
  kind: 'lying'
  id: string
  amount: number
  position: Position
}

export interface GameState {
  world: {
    x: number
    y: number
    h: number
    w: number
  }
  map: Record<string, ConstructedObject | LyingObject>
  player: PlayerState
}
