import { Game } from './game'
import { GameMap } from './gameMap'
import { BlastDoor } from './items/BlastDoor'
import { Dwarf } from './items/Dwarf'
import { SteelPlate } from './items/SteelPlate'
import { Wall, WallBlueprint } from './items/Wall'
import { Level } from './level'
import { Log } from './log'
import { GameObjectKey } from './mapItems'
import { TaskManager } from './taskManager'

export interface GameObjectConstructor {
  x: number
  y: number
}
export interface GameObjectState extends GameObjectConstructor {
  key: GameObjectKey
  id: string
}
export interface GameObjectDependency {
  log: Log
  taskManager: TaskManager
}

export interface GameObject extends GameObjectState {
  // TODO
  // new (state: GameObjectState, deps: GameObjectDependency): Dwarf
  tick: (time: number, map: GameMap, level: Level, game: Game) => void
  // tick: (level: Level) => void
  isWalkable: boolean
  isConstruction: boolean
  getState: () => GameObjectState
}

// TODO: fix any
export const objectKey2class: Record<GameObjectKey, any> = {
  dwarf: Dwarf,
  wall: Wall,
  wallBlueprint: WallBlueprint,
  blastDoor: BlastDoor,
  steelPlate: SteelPlate,
}
