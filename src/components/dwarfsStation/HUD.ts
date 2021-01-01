import { name2texture, TEXTURES } from './textures'
import { MainScene } from './game'
import { ObjectInstanceDescriptor } from './types'
import { objectsConfig } from './objectsConfig'
import { SCENES } from './constants'

type ContainerPosition = 'left' | 'right'
const Z_INDEX = {
  UI: 90,
  CONTAINER: 100,
}
export class HUDScene extends Phaser.Scene {
  private toolBox!: Phaser.GameObjects.Container
  private container!: Phaser.GameObjects.Container
  private beltContent!: Phaser.GameObjects.Container

  private belt: ObjectInstanceDescriptor[] = []

  constructor() {
    super({ key: SCENES.HUD, active: false })
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
    backpackSlot.depth = Z_INDEX.UI
    this.toolBox.add(backpackSlot)
    backpackSlot.on('pointerdown', this.openBackpack.bind(this))

    this.createContainer()
    this.drawBackpackContainer()

    this.drawBelt()

    this.attachEvents()
  }

  private attachEvents() {
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
      gameObject.x = dragX
      gameObject.y = dragY
    })
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: any, dragX: number, dragY: number) => {
      gameObject.setData('dragStart', [gameObject.x, gameObject.y])
    })
    this.input.on('dragend', this.onDrop.bind(this))
    this.input.keyboard.on('keyup_ESC', this.closeContainer.bind(this))
  }

  private onDrop(pointer: Phaser.Input.Pointer, gameObject: any) {
    // TODO: redraw containers
    const [firstHit] = this.input.manager.hitTest(
      pointer,
      this.beltContent.getAll(),
      this.cameras.main
    ) as Phaser.GameObjects.Image[]
    if (!firstHit) {
      const [x, y] = gameObject.getData('dragStart')
      gameObject.setData('dragStart', null)
      gameObject.x = x
      gameObject.y = y

      return
    }
    const index = firstHit.getData('index')
    this.belt[index] = {
      type: gameObject.getData('id'),
      amount: gameObject.getData('amount'),
    }
    gameObject.destroy()
    this.events.emit('beltSlotDropped', {
      item: this.belt[index],
      index,
    })

    this.drawBelt()
  }

  private drawBackpackContainer(list?: ObjectInstanceDescriptor[]) {
    if (this.container) {
      this.container.removeAll(true)
    }

    this.drawContainer('left', list)
  }

  private openBackpack() {
    const mainScene = this.scene.get(SCENES.MAIN) as MainScene
    const content = mainScene.player.getContent()
    this.drawBackpackContainer(content)

    this.container.setVisible(true)

    this.events.emit('containerOpened')
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
      slot.depth = Z_INDEX.UI
      slot.setData('index', i)
      this.beltContent.add(slot)

      const descriptor = this.belt[i]
      const constructorConfig = objectsConfig[descriptor?.type]
      if (constructorConfig) {
        const size = cellWidth * 0.7
        const obj: Phaser.GameObjects.Image = this.add.image(x, y, constructorConfig.view)
        obj.setDisplaySize(size, size)
        obj.setData('amount', descriptor.amount)
        obj.setData('id', descriptor.type)
        this.beltContent.add(obj)
      }
      slot.on('pointerdown', () => this.onBeltSlotClick(i))
    }
  }

  private onBeltSlotClick(index: number) {
    this.events.emit('beltSlotClick', this.belt[index])
  }

  private createContainer() {
    const { displayHeight, displayWidth } = this.cameras.main
    const uiMaxSize = 0.7
    const x = (displayWidth * (1 - uiMaxSize)) / 2
    const y = (displayHeight * (1 - uiMaxSize)) / 2
    this.container = this.add.container(x, y)
    this.closeContainer()
    this.container.depth = Z_INDEX.CONTAINER
  }

  private drawContainer(position: ContainerPosition = 'left', list?: ObjectInstanceDescriptor[]) {
    const { displayHeight, displayWidth } = this.cameras.main
    const uiMaxSize = 0.7
    const containerWidth = displayWidth * uiMaxSize
    const containerHeight = displayHeight * uiMaxSize
    const x = position === 'left' ? 0 : containerWidth / 2

    const bg = this.add.rectangle(x, 0, containerWidth / 2, containerHeight, 0x6666ff)
    bg.setOrigin(0, 0)
    this.container.add(bg)
    const bgLeft = x
    const bgTop = 0

    const closeSize = 50
    const close = this.add.rectangle(bg.width - closeSize, bgTop, closeSize, closeSize, 0x555555)
    close.setOrigin(0, 0)
    close.setInteractive()
    close.on('pointerdown', this.closeContainer.bind(this))
    this.container.add(close)

    const tileSize = 60
    list?.forEach((item, i) => {
      const { type, amount } = item

      const constructorConfig = objectsConfig[type]

      if (constructorConfig) {
        let size = tileSize * 0.9
        const itemsInLine = Math.floor(bg.width / tileSize)
        const line = Math.floor(i / itemsInLine)
        const row = i - itemsInLine * line
        const x = bgLeft + row * tileSize + tileSize / 2
        const topOffset = bgTop + closeSize + tileSize / 2
        const y = topOffset + line * tileSize
        const obj: Phaser.GameObjects.Image = this.add.image(0, 0, constructorConfig.view)
        obj.setDisplaySize(size, size)

        const amountText = this.add.text(0, 0, amount.toString())
        amountText.setOrigin(1, 0)

        const itemContainer = this.add.container(x, y, [obj, amountText])
        itemContainer.setSize(size, size)
        itemContainer.setInteractive()
        itemContainer.setData('amount', amount)
        itemContainer.setData('id', type)
        this.input.setDraggable(itemContainer)
        this.container.add(itemContainer)
      }
    })
  }

  private closeContainer() {
    this.container.setVisible(false)
    this.events.emit('containerClosed')
  }

  public getBelt() {
    return this.belt
  }

  public setBelt(belt: ObjectInstanceDescriptor[]) {
    this.belt = belt
    this.drawBelt()
  }

  public showContainer(list: ObjectInstanceDescriptor[] = []) {
    if (this.container) {
      this.container.removeAll(true)
    }
    const mainScene = this.scene.get('mainScene') as MainScene
    const content = mainScene.player.getContent()
    this.drawContainer('left', content)
    this.drawContainer('right', list)
    this.container.setVisible(true)

    this.events.emit('containerOpened')
  }
}
