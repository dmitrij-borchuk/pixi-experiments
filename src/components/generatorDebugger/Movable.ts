import { EventEmitter } from 'events'

export class Movable extends EventEmitter {
  protected offset = {
    x: 0,
    y: 0,
  }
  private step = 10

  constructor(canvas: HTMLCanvasElement) {
    super()
    canvas.addEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      this.move(this.step, 0)
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      this.move(-this.step, 0)
    }
    if (e.key === 'ArrowUp' || e.key === 'w') {
      this.move(0, this.step)
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      this.move(0, -this.step)
    }
  }

  private move(x: number, y: number) {
    this.offset = {
      x: this.offset.x + x,
      y: this.offset.y + y,
    }
    this.emit('move', { x: this.offset.x, y: this.offset.y })
  }
}
