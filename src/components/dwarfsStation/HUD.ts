import { name2texture, TEXTURES } from './textures'
import { MainScene } from './game'
import { ObjectInstanceDescriptor } from './types'
import { objectsConfig } from './objectsConfig'

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

  private makeBackpackContainer(list?: ObjectInstanceDescriptor[]) {
    if (this.backpackContent) {
      this.backpackContent.destroy()
    }
    const { displayHeight, displayWidth } = this.cameras.main
    // TODO: close on `esc`
    const uiMaxSize = 0.8
    this.backpackContent = this.add.container(displayWidth / 2, displayHeight / 2)
    this.backpackContent.setVisible(false)

    const bg = this.add.rectangle(0, 0, displayWidth * uiMaxSize, displayHeight * uiMaxSize, 0x6666ff)
    this.backpackContent.add(bg)
    const bgLeft = -(bg.width / 2)
    const bgTop = -(bg.height / 2)

    const closeSize = 50
    const close = this.add.rectangle(
      bg.width / 2 - closeSize / 2,
      bgTop + closeSize / 2,
      closeSize,
      closeSize,
      0x555555
    )
    this.backpackContent.add(close)
    close.setInteractive()
    close.on('pointerdown', () => this.backpackContent.setVisible(false))

    const tileSize = 60
    list?.forEach((item, i) => {
      const { id, amount } = item

      const constructorConfig = objectsConfig[id]

      if (constructorConfig) {
        let size = tileSize * 0.9
        // TODO: make line wrap
        const obj: Phaser.GameObjects.Image = this.add.image(
          bgLeft + i * tileSize + tileSize / 2,
          bgTop + closeSize + tileSize / 2,
          constructorConfig.view
        )
        obj.setDisplaySize(size, size)
        obj.setData('amount', amount)
        obj.setData('id', id)
        // obj.setInteractive()

        this.backpackContent.add(obj)
      }
    })
  }

  private onBackpackClick() {
    // TODO: use constant
    const mainScene = this.scene.get('mainScene') as MainScene
    const content = mainScene.player.getContent()
    this.makeBackpackContainer(content)

    this.backpackContent.setVisible(true)
  }
}
