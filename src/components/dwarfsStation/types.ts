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

export interface ConstructedObjectDescriptor {
  id: string
  step: number
  angle: number
  health: number
}
