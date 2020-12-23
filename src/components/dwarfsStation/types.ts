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
}

export interface ObjectInstanceDescriptor {
  id: string
  amount: string
}
