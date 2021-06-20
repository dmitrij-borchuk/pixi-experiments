import { EventEmitter } from 'events'
import { nanoid } from 'nanoid'
import { Level, LevelState } from './level'
import { Log } from './log'
import { GameObjectKey } from './mapItems'

export interface GameState {
  level: LevelState
}
export class Game extends EventEmitter {
  static EVENT = {
    LOG: 'log',
  }
  private level: Level
  private canvas: HTMLCanvasElement
  private log: Log

  constructor(canvas: HTMLCanvasElement) {
    super()

    this.log = new Log()
    this.canvas = canvas
    this.log.addListener(Log.EVENT.LOG, (d) => {
      this.emit(Game.EVENT.LOG, d)
    })

    const makeDwarf = () => ({
      key: 'dwarf' as GameObjectKey,
      x: 25,
      y: 25,
      id: nanoid(),
    })
    const dwarfs = [makeDwarf(), makeDwarf(), makeDwarf(), makeDwarf(), makeDwarf()]
    this.level = new Level(
      canvas,
      {
        mapObjects: dwarfs,
        tasksManager: {
          tasks: [],
        },
        mapHeight: 50,
        mapWidth: 50,
      },
      this.log,
      this
    )

    canvas.addEventListener('keydown', this.onKeyDown)
    canvas.addEventListener('click', this.onCanvasClick)
  }

  onCanvasClick = (e: MouseEvent) => {
    const x = e.offsetX
    const y = e.offsetY

    this.level.onCanvasClick(x, y)
  }

  onKeyDown = (e: KeyboardEvent) => {
    const step = 10

    if (e.key === 'ArrowLeft') {
      this.level.moveMap(step, 0)
    }
    if (e.key === 'ArrowRight') {
      this.level.moveMap(-step, 0)
    }
    if (e.key === 'ArrowUp') {
      this.level.moveMap(0, step)
    }
    if (e.key === 'ArrowDown') {
      this.level.moveMap(0, -step)
    }
  }

  save(): GameState {
    return {
      level: this.level.getState(),
    }
  }

  load(state: GameState) {
    console.log('=-= load', state)
    this.level.stop()
    this.level = new Level(this.canvas, state.level, this.log, this)
  }

  destroy() {
    this.level.stop()
    this.canvas.removeEventListener('keydown', this.onKeyDown)
    this.canvas.removeEventListener('click', this.onCanvasClick)
  }
}
