import { Dwarf } from './items/Dwarf'
import { Wall, WallBlueprint } from './items/Wall'

export type Creature = Dwarf
export type Construction = Wall | WallBlueprint

// export type MapItem = Creature | Construction

export type CreatureKey = 'dwarf'

export const CONSTRUCTIONS_KEYS = ['wall', 'blastDoor'] as const
export type ConstructionsKey = typeof CONSTRUCTIONS_KEYS[number]
export const BLUEPRINT_KEYS = ['wallBlueprint'] as const
export type BluePrintKey = typeof BLUEPRINT_KEYS[number]
export const ITEMS_KEYS = ['steelPlate'] as const
export type ItemsKey = typeof ITEMS_KEYS[number]

export type GameObjectKey = CreatureKey | ConstructionsKey | BluePrintKey | ItemsKey
