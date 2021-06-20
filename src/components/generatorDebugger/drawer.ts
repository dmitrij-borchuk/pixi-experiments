import { BlockGeneratorResult } from '../../utils/stationGenerator'
import { Movable } from './Movable'

export class Drawer extends Movable {
  private canvas: HTMLCanvasElement
  private scale = 10
  private state?: BlockGeneratorResult

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.canvas = canvas

    canvas.addEventListener('click', this.onCanvasClick)
    this.addListener('move', () => {
      if (this.state) this.draw(this.state)
    })
  }

  onCanvasClick = (e: MouseEvent) => {
    const x = e.offsetX
    const y = e.offsetY

    // TODO: show info
    console.log('=-=', x, y)
  }

  public setState(state: BlockGeneratorResult, clearOffset = false) {
    this.state = state
    if (clearOffset) {
      this.offset = { x: 0, y: 0 }
    }
    this.draw(state)
  }

  private draw = (state: BlockGeneratorResult) => {
    const ctx = this.canvas.getContext('2d')

    if (!ctx) return

    // const map = this.map
    // const spaceColor = '#070b40'
    ctx.fillStyle = '#eee'

    // const screenCenter = {
    //   x: Math.round(this.width / 2),
    //   y: Math.round(this.height / 2),
    // }
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    state.objects.forEach((item) => {
      this.drawItem(item)
    })
  }

  private drawItem(item: BlockGeneratorResult['objects'][number]) {
    const ctx = this.canvas.getContext('2d')

    if (!ctx) return
    const scale = this.scale

    // TODO: use render from item
    const item2color: Record<string, string> = {
      dwarf: '#0f0',
      wall: '#444',
      wallBlueprint: '#88f',
      blastDoor: '#444',
      steelPlate: '#444',
      yellow: '#f0f78c',
    }

    const { x, y } = item

    // if (item.render) {
    //   item.render(ctx, this.scale, this.mapOffset)
    // } else {
    ctx.fillStyle = item2color[item.type]
    ctx.fillRect(x * scale + this.offset.x, y * scale + this.offset.y, scale, scale)
    // }
  }

  // destroy() {
  //   this.level.stop()
  //   this.canvas.removeEventListener('keydown', this.onKeyDown)
  //   this.canvas.removeEventListener('click', this.onCanvasClick)
  // }
}
