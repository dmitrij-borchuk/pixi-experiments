import Phaser, { Scene } from 'phaser'
import { applyCameraToSprite, applyMovement, getTileFomCoords } from '../../utils/gameUtils'
import { generateInitialStructure, ObjectInstanceConfig } from './generator'
import { getRandom } from '../../utils/random'
import { Player } from './Player'
import { name2texture, TEXTURES } from './textures'
import { objectsConfig } from './objectsConfig'
import { HUDScene } from './HUD'
import { ObjectInstanceDescriptor } from './types'

const tileSize = 120
const maxDistanceToInteract = tileSize * 2

// TODO: add loading
// https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/?a=13

// TODO: remove events when some UI window opened
// pointer, keyboard events

export class MainScene extends Scene {
  public player!: Player
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []
  private lyingObjects!: Phaser.GameObjects.Group
  private buildPreview?: Phaser.GameObjects.Image

  constructor() {
    super('mainScene')
  }
  preload() {
    // Load in images and sprites

    // TODO: fix loading problem
    // if you remove next line other textures will not load on start
    // looks like we need to use `this.textures.on('onload', (name: string) => {})`
    this.load.image(TEXTURES.stoneFloor, name2texture.stoneFloor)
    this.textures.addBase64(TEXTURES.player, name2texture.player)
    this.textures.addBase64(TEXTURES.frame, name2texture.frame)
    this.textures.addBase64(TEXTURES.ironPlate, name2texture.ironPlate)
  }
  create() {
    const initialData = generateInitialStructure()
    const worldSize = initialData.world

    // Set world bounds
    this.physics.world.setBounds(
      worldSize.x * tileSize,
      worldSize.y * tileSize,
      worldSize.w * tileSize,
      worldSize.h * tileSize
    )

    // Background
    this.add.tileSprite(
      (worldSize.x + worldSize.w / 2) * tileSize,
      (worldSize.y + worldSize.h / 2) * tileSize,
      worldSize.w * tileSize,
      worldSize.h * tileSize,
      TEXTURES.stoneFloor
    )

    this.makeInitialStructure(initialData.objects)

    this.addPlayer(initialData.player.position)

    applyCameraToSprite(this, this.player)

    this.addMouseEvents()

    const hud = this.scene.get('HUDScene') as HUDScene
    hud.events.on('beltSlotClick', this.onBeltSlotClick.bind(this))
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })

    if (this.buildPreview) {
      // update position of tool preview
      this.game.input.mousePointer.updateWorldPoint(this.cameras.main)
      const { worldX, worldY } = this.game.input.mousePointer
      const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
      this.buildPreview.setPosition(x * tileSize, y * tileSize)
    }
  }

  private onBeltSlotClick(descriptor?: ObjectInstanceDescriptor) {
    // TODO: check if buildable
    if (this.buildPreview) {
      this.buildPreview.destroy()
      this.buildPreview = undefined
    }

    const constructorConfig = descriptor && objectsConfig[descriptor.id]

    if (constructorConfig) {
      this.buildPreview = this.add.image(0, 0, constructorConfig.view)
      this.buildPreview.setDisplaySize(tileSize, tileSize)
      this.buildPreview.setTint(0x55ff55, 0x55ff55, 0x55ff55, 0x55ff55)
      this.buildPreview.setAlpha(0.5)
    }
  }

  private addPlayer(position: [number, number]) {
    const [x, y] = position
    const scale = 0.5
    const playerGroup = this.physics.add.group({ classType: Player, runChildUpdate: true })
    // TODO: probably `TEXTURES.player` should be moved to the `Player` class
    const player = playerGroup.get(x * tileSize, y * tileSize, TEXTURES.player) as Player
    player
      .setDisplaySize(tileSize * scale, tileSize * scale)
      .setCollideWorldBounds(true)
      .setDrag(3000)
    this.player = player
    // TODO: add collision with initial structure
    // applyCollider(this, this.player, this.walls)

    const { onUpdate } = applyMovement(this, this.player)
    this.onUpdateListeners.push(onUpdate)
  }

  private makeInitialStructure(objects: any) {
    this.lyingObjects = new Phaser.GameObjects.Group(this)

    objects.forEach((config: ObjectInstanceConfig) => {
      const {
        position: [x, y],
        id,
        state,
        amount,
      } = config

      const constructorConfig = objectsConfig[id]

      if (constructorConfig) {
        let size = tileSize
        if (state === 'kit') {
          size = tileSize / 2
        }
        const obj: Phaser.GameObjects.Image = this.lyingObjects.create(
          x * tileSize,
          y * tileSize,
          constructorConfig.view
        )
        obj.setDisplaySize(size, size)
        obj.setAngle(getRandom(360))
        obj.setData('amount', amount)
        obj.setData('id', id)
        obj.setInteractive()
      }
    })
  }

  private addMouseEvents() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.useLyingObject(pointer)
    })
  }

  private useLyingObject(pointer: Phaser.Input.Pointer) {
    const distance = Phaser.Math.Distance.BetweenPoints(this.player.body, { x: pointer.worldX, y: pointer.worldY })
    if (distance <= maxDistanceToInteract) {
      const [firstHit] = this.input.manager.hitTest(
        pointer,
        this.lyingObjects.getChildren(),
        this.cameras.main
      ) as Phaser.GameObjects.Image[]

      if (firstHit) {
        const obj = {
          id: firstHit.getData('id'),
          amount: firstHit.getData('amount'),
        }
        this.player.addToContainer(obj)
        // TODO: it could be animated with flying to player and scaling to 0
        firstHit.destroy()
      }
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [MainScene, HUDScene],
  render: {
    pixelArt: true,
  },
}

export const app = {
  init: () => {
    const game = new Phaser.Game({
      ...config,
      callbacks: {
        ...config.callbacks,
        postBoot: () => {
          // applyPointerLock(game)
        },
      },
    })

    return game
  },
}
