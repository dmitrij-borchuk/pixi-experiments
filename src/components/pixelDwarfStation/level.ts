import { Game } from './game'
import { GameMap } from './gameMap'
import { GameObject, GameObjectState, objectKey2class } from './gameObject'
// import { BlastDoor } from './items/BlastDoor'
import { Dwarf } from './items/Dwarf'
import { Log } from './log'
import { GameObjectKey } from './mapItems'
import { TaskManager, TaskManagerState } from './taskManager'

export interface LevelState {
  mapHeight: number
  mapWidth: number
  mapObjects: GameObjectState[]
  tasksManager: TaskManagerState
}
export class Level {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  public map!: GameMap
  private mapHeight!: number
  private mapWidth!: number
  private scale = 10
  private mapOffset = {
    x: 0,
    y: 0,
  }
  private: any = null
  private taskManager: TaskManager
  private isRunning = false
  private time = 0

  constructor(private canvas: HTMLCanvasElement, state: LevelState, private log: Log, private game: Game) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('ctx2d is not available')
    }

    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height

    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.taskManager = new TaskManager(state.tasksManager)

    this.makeInitialStructures(state)

    this.start()
  }

  public start() {
    this.isRunning = true
    requestAnimationFrame(() => this.frame())
  }

  public stop() {
    this.isRunning = false
  }

  private frame() {
    if (!this.isRunning) {
      return
    }

    this.tick(this.time++, this.game)

    requestAnimationFrame(() => this.frame())
  }

  private makeInitialStructures(state: LevelState) {
    this.mapHeight = state.mapHeight
    this.mapWidth = state.mapWidth
    this.mapOffset = {
      x: Math.round(this.width / 2 - (this.mapWidth / 2) * this.scale),
      y: Math.round(this.height / 2 - (this.mapHeight / 2) * this.scale),
    }
    this.map = new GameMap({
      width: this.mapWidth,
      height: this.mapHeight,
    })

    state.mapObjects.forEach((o) => {
      const Constructor = objectKey2class[o.key]

      const item = new Constructor(o, {
        log: this.log,
        taskManager: this.taskManager,
      })
      this.map.addItem(item)
    })
  }

  private tick(time: number, game: Game) {
    this.map.items.forEach((item) => {
      // time: number, map: GameMap, level: Level, game: Game
      item.tick(time, this.map, this, game)
    })
    this.render()
  }

  private render() {
    const map = this.map
    // const spaceColor = '#070b40'
    this.ctx.fillStyle = '#eee'

    // const screenCenter = {
    //   x: Math.round(this.width / 2),
    //   y: Math.round(this.height / 2),
    // }
    this.ctx.fillRect(0, 0, this.width, this.height)

    map.items.forEach((item) => {
      this.drawItem(item.x, item.y, item)
    })
  }

  private drawItem(x: number, y: number, item: GameObject) {
    const ctx = this.ctx
    const scale = this.scale

    // TODO: use render from item
    const item2color: Record<GameObjectKey, string> = {
      dwarf: '#0f0',
      wall: '#444',
      wallBlueprint: '#88f',
      blastDoor: '#444',
      steelPlate: '#444',
    }

    if (item.render) {
      item.render(ctx, this.scale, this.mapOffset)
    } else {
      ctx.fillStyle = item2color[item.key]
      ctx.fillRect(x * scale + this.mapOffset.x, y * scale + this.mapOffset.y, scale, scale)
    }
  }

  // public getUnassignedTask() {
  //   return this.taskList.find((t) => t.assignee === null && t.isSuspended !== true)
  // }

  // TODO: Rename
  public onCanvasClick(x: number, y: number) {
    const mapX = Math.floor((x - this.mapOffset.x) / this.scale)
    const mapY = Math.floor((y - this.mapOffset.y) / this.scale)

    const items = this.map.getItems(mapX, mapY).filter((i) => i.isConstruction)
    if (items.length > 0) {
      return
    }

    this.map.addItem(
      new Dwarf(
        {
          x: mapX,
          y: mapY,
        },
        {
          log: this.log,
          taskManager: this.taskManager,
        }
      )
    )
    // this.map.addItem(
    //   new WallBlueprint(
    //     {
    //       x: mapX,
    //       y: mapY,
    //     },
    //     {
    //       log: this.log,
    //       taskManager: this.taskManager,
    //     }
    //   )
    // )

    // this.taskManager.addTask({
    //   type: 'build',
    //   details: {
    //     x: mapX,
    //     y: mapY,
    //   },
    //   assignee: null,
    //   name: 'Building wall',
    // })
  }

  public getState(): LevelState {
    return {
      mapObjects: this.map.items.map((i) => i.getState()),
      tasksManager: this.taskManager.getState(),
      mapHeight: this.mapHeight,
      mapWidth: this.mapWidth,
    }
  }

  public moveMap(xOffset: number, yOffset: number) {
    this.mapOffset = {
      x: this.mapOffset.x + xOffset,
      y: this.mapOffset.y + yOffset,
    }
  }
}
