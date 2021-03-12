export class HUDScene extends Phaser.Scene {
  private task!: Phaser.GameObjects.Container
  private hullHeight = 34
  // private hullWidth = 225

  constructor() {
    super({ key: 'hud', active: false })
  }

  create() {
    this.makeUI()
  }

  private makeUI() {
    // Hull
    const graphics = this.add.graphics()
    this.makeHull(graphics, 20, 10, 1)

    // Task
    this.task = this.add.container(0, 0)
    this.makeTasks(this.task, 'Gather 150 (76) ores from asteroids')
  }

  private makeHull(graphics: Phaser.GameObjects.Graphics, cells: number, cellWidth: number, hpPercents: number) {
    const { displayHeight } = this.cameras.main
    graphics.clear()

    const cellXSpace = 1
    const cellXOffset = 3
    const cellYOffset = 3
    const cellXSpaces = cellXSpace * (cells - 1)

    // Border
    const borderTop = displayHeight - this.hullHeight
    const borderWidth = 2
    const hullOffset = 1
    const halfBorder = borderWidth / 2
    const hullX = halfBorder + hullOffset
    const hullY = borderTop - hullOffset - halfBorder
    const hullWidth = cellWidth * cells + cellXSpaces + cellXOffset * 2 + borderWidth
    graphics.lineStyle(borderWidth, 0xffffff, 1.0)
    graphics.strokeRect(hullX, hullY, hullWidth, this.hullHeight)

    // Cells
    const cellsToRender = Math.ceil(cells * hpPercents)
    const cellHeight = this.hullHeight - 2 * cellYOffset - borderWidth
    const cellsStartX = hullX + halfBorder + cellXOffset
    const cellsStartY = hullY + halfBorder + cellYOffset
    for (let i = 0; i < cellsToRender; i++) {
      this.makeHullCell(graphics, i * (cellWidth + cellXSpace) + cellsStartX, cellsStartY, cellWidth, cellHeight)
    }
  }

  private makeHullCell(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number) {
    graphics.lineStyle(0, 0xffffff, 1.0)
    graphics.fillStyle(0x267f00, 1.0)
    graphics.fillRect(x, y, width, height)
  }

  private makeTasks(container: Phaser.GameObjects.Container, text: string) {
    container.removeAll()
    const borderWidth = 2
    const halfBorder = borderWidth / 2
    const offset = 1
    const taskInnerOffset = 2

    // Text
    const textOffset = borderWidth + offset + taskInnerOffset
    const textObj = this.add.text(textOffset, textOffset, text, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    })
    container.add(textObj)

    // Border
    const graphics = this.add.graphics()
    container.add(graphics)
    const taskX = offset + halfBorder
    const taskY = offset + halfBorder
    const taskWidth = textObj.width + taskInnerOffset * 2 + borderWidth
    const taskHeight = textObj.height + taskInnerOffset * 2 + borderWidth
    graphics.lineStyle(borderWidth, 0xffffff, 1.0)
    graphics.strokeRect(taskX, taskY, taskWidth, taskHeight)
  }
}
