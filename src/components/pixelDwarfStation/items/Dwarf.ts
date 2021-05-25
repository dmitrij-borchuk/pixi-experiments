import { nanoid } from 'nanoid'
import { getRandom } from '../../../utils/random'
import { GameMap } from '../gameMap'
import { GameObject, GameObjectConstructor, GameObjectDependency, GameObjectState } from '../gameObject'
import { Log } from '../log'
import { GameObjectKey } from '../mapItems'
import { Path } from '../path'
import { Task } from '../task'
import { TaskManager } from '../taskManager'
import { Wall } from './Wall'

interface DwarfStateInitial extends GameObjectConstructor {
  task?: string
}
interface DwarfState extends GameObjectState, DwarfStateInitial {}

export class Dwarf implements GameObject {
  public key: GameObjectKey = 'dwarf'
  private task?: Task
  public isConstruction = false
  public isWalkable = true
  public x: number
  public y: number
  public id: string
  private log: Log
  private taskManager: TaskManager
  private speed = 6
  private lastStep = 0

  constructor(state: DwarfStateInitial, deps: GameObjectDependency) {
    this.log = deps.log
    this.taskManager = deps.taskManager
    this.x = state.x
    this.y = state.y
    this.task = this.taskManager.taskList.find((t) => t.id === state.task)
    this.id = nanoid()
  }

  public tick(time: number, map: GameMap) {
    if (time - this.lastStep < this.speed) {
      return
    }

    this.lastStep = time

    if (!this.task || this.task.type === 'walk') {
      // TODO: on tick all dwarfs get task one by one and the first in the list always get the task
      // Try to get new task
      const task = this.taskManager.getUnassignedTask()
      if (task) {
        if (this.task) {
          this.taskManager.removeTask(this.task.id)
        }
        this.task = task
        this.task.assignee = this.id
      }
    }

    if (!this.task) {
      // Lets walk a little bit
      this.task = this.taskManager.addTask(this.goSomewhere(map))
    }

    this.doTask(map, this.task)
  }

  private goSomewhere(map: GameMap): Task {
    return {
      id: nanoid(),
      type: 'walk',
      details: {
        // Skip map border
        x: getRandom(map.width - 2, 1),
        y: getRandom(map.height - 2, 1),
      },
      name: 'Walking',
      assignee: this.id,
    }
  }

  private doTask(map: GameMap, task: Task) {
    // Move
    if (task.type === 'walk') {
      try {
        const path = map.findPath(this.x, this.y, task.details.x, task.details.y)
        const { isThere } = this.checkDestination(path)

        if (isThere) {
          if (this.task) {
            this.taskManager.removeTask(this.task.id)
          }
          this.task = undefined
        } else {
          this.moveTo(path)
        }
      } catch (error) {
        if (this.task) {
          const { x, y } = this.task.details
          this.log.add({ message: `Dwarf: can't find path to ${x} ${y}` })
          // Can't move to destination, cancel movement
          this.taskManager.removeTask(this.task.id)
          this.task = undefined
        }

        return
      }

      return
    }

    // Build
    if (task.type === 'build') {
      try {
        const path = map.findPath(this.x, this.y, task.details.x, task.details.y)

        const { isNear, isThere } = this.checkDestination(path)

        if (isNear) {
          map.addItem(
            new Wall(
              {
                x: task.details.x,
                y: task.details.y,
              },
              { log: this.log, taskManager: this.taskManager }
            )
          )
          if (this.task) {
            this.taskManager.removeTask(this.task.id)
          }
          this.task = undefined

          return
        }

        if (isThere) {
          const neighbors = map.getNeighbors(this.x, this.y)
          if (neighbors.length > 0) {
            this.moveTo([
              [this.x, this.y],
              [neighbors[0].x, neighbors[0].y],
            ])
          }

          return
        }

        this.moveTo(path)

        return
      } catch (error) {
        if (this.task) {
          const { x, y } = this.task.details
          this.task.assignee = null
          // TODO: Figure out how to unsuspend task when it is become available
          this.task.isSuspended = true
          this.log.add({ message: `Dwarf: can't find path to ${x} ${y} (${this.task.name})` })
          // this.taskManager.removeTask(this.task.id)
          // Can't move to destination, cancel movement
          this.task = undefined
        }

        return
      }
    }
  }

  private moveTo(path: Path) {
    if (path.length > 1) {
      this.x = path[1][0]
      this.y = path[1][1]
    }
  }

  private checkDestination(path: Path) {
    if (path.length === 1) {
      return {
        isThere: true,
        isNear: false,
      }
    }

    return {
      isThere: false,
      isNear: path.length === 2,
    }
  }

  public getState(): DwarfState {
    return {
      key: this.key,
      x: this.x,
      y: this.y,
      task: this.task?.id,
      id: this.id,
    }
  }
}
