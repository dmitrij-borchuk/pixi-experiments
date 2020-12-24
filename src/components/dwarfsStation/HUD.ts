import { name2texture, TEXTURES } from './textures'
import { MainScene } from './game'
import { ObjectInstanceDescriptor } from './types'
import { objectsConfig } from './objectsConfig'

export class HUDScene extends Phaser.Scene {
  private toolBox!: Phaser.GameObjects.Container
  private backpackContent!: Phaser.GameObjects.Container
  private beltContent!: Phaser.GameObjects.Container

  private belt: ObjectInstanceDescriptor[] = []

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
    backpackSlot.on('pointerdown', this.onBackpackClick.bind(this))

    this.makeBackpackContainer()

    this.drawBelt()

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
      gameObject.x = dragX
      gameObject.y = dragY
    })
    this.input.on('dragend', this.onDrop.bind(this))
  }

  private onDrop(pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) {
    const [firstHit] = this.input.manager.hitTest(
      pointer,
      this.beltContent.getAll(),
      this.cameras.main
    ) as Phaser.GameObjects.Image[]
    const index = firstHit.getData('index')
    this.belt[index] = {
      id: gameObject.getData('id'),
      amount: gameObject.getData('amount'),
    }
    gameObject.destroy()
    this.events.emit('beltSlotDropped', {
      item: this.belt[index],
      index,
    })

    this.drawBelt()
  }

  private makeBackpackContainer(list?: ObjectInstanceDescriptor[]) {
    if (this.backpackContent) {
      this.backpackContent.destroy()
    }
    const { displayHeight, displayWidth } = this.cameras.main
    // TODO: close on `esc`
    const uiMaxSize = 0.7
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
        const x = bgLeft + i * tileSize + tileSize / 2
        const y = bgTop + closeSize + tileSize / 2
        const obj: Phaser.GameObjects.Image = this.add.image(x, y, constructorConfig.view)
        obj.setDisplaySize(size, size)
        obj.setData('amount', amount)
        obj.setData('id', id)
        obj.setInteractive()

        this.input.setDraggable(obj)

        // TODO: add amount text
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

  private drawBelt() {
    if (this.beltContent) {
      this.beltContent.destroy()
    }
    const { displayHeight, displayWidth } = this.cameras.main
    const cellHeight = 64
    const cellWidth = 57
    const cellAmount = 5
    const beltWidth = (cellAmount - 1) * cellWidth
    this.beltContent = this.add.container(displayWidth / 2, displayHeight - cellHeight / 2)
    for (let i = 0; i < cellAmount; i++) {
      const x = i * cellWidth - beltWidth / 2
      const y = 0
      const slot = this.add.image(x, y, TEXTURES.toolbarCell)
      slot.setDisplaySize(cellWidth, cellHeight)
      slot.setScrollFactor(0)
      slot.setInteractive()
      slot.depth = 90
      slot.setData('index', i)
      this.beltContent.add(slot)

      const descriptor = this.belt[i]
      const constructorConfig = objectsConfig[descriptor?.id]
      if (constructorConfig) {
        const size = cellWidth * 0.7
        const obj: Phaser.GameObjects.Image = this.add.image(x, y, constructorConfig.view)
        obj.setDisplaySize(size, size)
        obj.setData('amount', descriptor.amount)
        obj.setData('id', descriptor.id)
        this.beltContent.add(obj)
      }
      slot.on('pointerdown', () => this.onBeltSlotClick(i))
    }
  }

  private onBeltSlotClick(index: number) {
    this.events.emit('beltSlotClick', this.belt[index])
  }

  public getBelt() {
    return this.belt
  }

  public setBelt(belt: ObjectInstanceDescriptor[]) {
    this.belt = belt
    this.drawBelt()
  }
}
