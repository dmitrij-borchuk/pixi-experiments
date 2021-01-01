import { Scene } from 'phaser'

export type Layer = 'floor' | 'walls' | 'pipes' | 'cables' | 'stuff'
export type GameEvent = `placedObject.${Layer}`

export interface BuildVariant {
  // TODO:
  // titleKey: string
  // title: string
  // view: string
  buildProps: {
    isSolid?: boolean
    steps: {
      toMake?: {
        ingredients: {
          name: string
          amount: number
        }[]
      }
      gasOpaque: boolean
      lightOpaque: boolean
      view: string
    }[]
    layer: string
  }
}

export interface ObjectConfig {
  id: string
  displayNameKey: string
  defaultDisplayName: string
  isContainer: boolean
  view: string
  isDroppable: boolean
  stack: number
  maxHealth: number
  isBuildable: boolean
}
export interface ConstructionObjectConfig extends ObjectConfig {
  isBuildable: true
  variants: Record<string, BuildVariant>
}
export interface StuffObjectConfig extends ObjectConfig {
  isBuildable: false
}

export interface ObjectInstanceDescriptor {
  type: string
  amount: number
}

export type Position = [number, number]

export interface ConstructedObject {
  kind: 'construction'
  type: string
  step: number
  angle: number
  health: number
  variant: string
  ingredients: {
    name: string
    amount: number
  }[]
  data?: any
}

export interface PlayerState {
  position: Position
  backpack: ObjectInstanceDescriptor[]
  belt: ObjectInstanceDescriptor[]
}

export interface StuffObject {
  kind: 'stuff'
  type: string
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

export interface BaseScene extends Scene {
  map: {
    layers: Record<Layer, Map<string, ConstructedObject | StuffObject>>
  }
  applyWorld: (world: GameState) => void
}
