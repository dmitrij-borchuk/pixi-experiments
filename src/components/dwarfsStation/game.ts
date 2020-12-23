import Phaser, { Scene } from 'phaser'
import stoneFloor from './assets/stoneFloor.jpg'
import player from './assets/player.png'
import frame from './assets/frame.png'
import ironPlate from './assets/ironPlate.png'
import { applyCameraToSprite, applyMovement } from '../../utils/gameUtils'
import { generateInitialStructure, ObjectInstanceConfig } from './generator'
import frameConfig from './frame.json'
import ironPlateConfig from './ironPlate.json'
import { ObjectConfig } from './types'
import { getRandom } from '../../utils/random'
import { Player } from './Player'

const tileSize = 120
const maxDistanceToInteract = tileSize * 2

enum TEXTURES {
  stoneFloor = 'stoneFloor',
  player = 'player',
  frame = 'frame',
  ironPlate = 'ironPlate',
}

const objectConfigs: Record<string, ObjectConfig> = {
  frame: frameConfig,
  ironPlate: ironPlateConfig,
}

// TODO: add loading
// https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/?a=13
export class RoomScene extends Scene {
  private player!: Player
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []
  private lyingObjects!: Phaser.GameObjects.Group

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    // TODO: fix loading problem
    // if you remove next line other textures will not load on start
    this.load.image(TEXTURES.stoneFloor, stoneFloor)
    this.textures.addBase64(TEXTURES.player, player)
    this.textures.addBase64(TEXTURES.frame, frame)
    this.textures.addBase64(TEXTURES.ironPlate, ironPlate)
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
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })
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

    this.add.image(0, 0, 'toolbarCell')

    objects.forEach((config: ObjectInstanceConfig) => {
      const {
        position: [x, y],
        id,
        state,
        amount,
      } = config

      const constructorConfig = objectConfigs[id]

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
        this.player.addToContainer({
          id: firstHit.getData('id'),
          amount: firstHit.getData('amount'),
        })
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
  scene: RoomScene,
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
