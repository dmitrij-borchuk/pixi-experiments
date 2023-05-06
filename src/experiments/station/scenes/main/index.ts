import { GameObjects, Scene } from 'phaser'
import { Player } from '../../objects/Player'
import { TILE_SIZE } from '../../config'

export class Main extends Scene {
  private player!: GameObjects.Sprite
  public blockingMap: boolean[][] = []
  public tool: string | null = null
  constructor() {
    super('main')
  }
  objects: any[] = []
  create(): void {
    this.player = new Player(this, 0, 0)

    this.input.on(
      'pointerdown',
      (e: any) => {
        const x = Math.round(e.worldX / TILE_SIZE) * TILE_SIZE
        const y = Math.round(e.worldY / TILE_SIZE) * TILE_SIZE
        this.onUseTool(x, y)
      },
      this
    )
  }
  onUseTool(x: number, y: number) {
    if (this.tool === 'wall') {
      this.createWall(x, y)
    }
  }
  createWall(x: number, y: number) {
    const wall = this.add.image(x, y, 'wall')
    wall.setDisplaySize(TILE_SIZE, TILE_SIZE)
    this.objects.push(wall)
    this.blockingMap[x / TILE_SIZE] = this.blockingMap[x / TILE_SIZE] || []
    this.blockingMap[x / TILE_SIZE][y / TILE_SIZE] = true
    return wall
  }
  update(d: number): void {
    // this.cameras.main.x
    // console.log('=-= 🚀 ~ Main ~ update ~ this.cameras.main.x:', this.cameras.main.worldView.x)
    this.player?.update(d)
  }
  getState() {
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
      },
      objects: this.objects.map((o) => ({
        x: o.x,
        y: o.y,
      })),
    }
  }
  setState(data: any) {
    // TODO: clear before load
    this.player.x = data.player.x
    this.player.y = data.player.y
    data.objects.forEach((o: any) => {
      this.createWall(o.x, o.y)
    })
  }
  setTool(tool: string) {
    this.tool = tool
  }
}
