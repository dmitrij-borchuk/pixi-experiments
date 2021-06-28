import { EventEmitter } from 'events'

type ControlsConfig = {
  step: number
}
export class Controls extends EventEmitter {
  private config: ControlsConfig

  constructor(config: ControlsConfig) {
    super()
    this.config = config
    window.addEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      this.move(-this.config.step, 0)
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      this.move(this.config.step, 0)
    }
    if (e.key === 'ArrowUp' || e.key === 'w') {
      this.move(0, this.config.step)
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      this.move(0, -this.config.step)
    }
  }

  private move(x: number, y: number) {
    this.emit('move', { x, y })
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    this.removeAllListeners()
  }
}
