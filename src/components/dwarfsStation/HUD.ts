import { name2texture, TEXTURES } from './textures'

export class HUDScene extends Phaser.Scene {
  private toolBox!: Phaser.GameObjects.Container
  private backpackContent!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'HUDScene', active: true })
  }

  preload() {
    this.textures.addBase64(TEXTURES.toolbarCell, name2texture.toolbarCell)
  }

  create() {
    this.textures.on('onload', (name: string) => {
      if (name === TEXTURES.toolbarCell) {
        this.makeUI()
      }
    })
  }

  private makeUI() {
    const { displayHeight } = this.cameras.main

    // Backpack
    const cellHeight = 127
    const cellWidth = 113
    this.toolBox = this.add.container(cellWidth / 2, displayHeight - cellHeight / 2)
    const backpackSlot = this.add.image(0, 0, TEXTURES.toolbarCell)
    backpackSlot.setDisplaySize(113, cellHeight)
    backpackSlot.setScrollFactor(0)
    backpackSlot.setInteractive()
    backpackSlot.depth = 90
    this.toolBox.add(backpackSlot)

    this.makeBackpackContainer()

    this.input.on('gameobjectup', this.onBackpackClick.bind(this))
  }

  private makeBackpackContainer() {
    const { displayHeight, displayWidth } = this.cameras.main
    // TODO: close on `esc`
    const uiMaxSize = 0.8
    this.backpackContent = this.add.container(displayWidth / 2, displayHeight / 2)

    const bg = this.add.rectangle(0, 0, displayWidth * uiMaxSize, displayHeight * uiMaxSize, 0x6666ff)
    this.backpackContent.add(bg)

    const closeSize = 50
    const close = this.add.rectangle(
      bg.width / 2 - closeSize / 2,
      -(bg.height / 2 - closeSize / 2),
      closeSize,
      closeSize,
      0x555555
    )
    this.backpackContent.add(close)
    close.setInteractive()
    close.on('pointerdown', () => this.backpackContent.setVisible(false))

    this.backpackContent.setVisible(false)
  }

  private onBackpackClick() {
    console.log('=-= open backpack')
    this.backpackContent.setVisible(true)
  }
}
