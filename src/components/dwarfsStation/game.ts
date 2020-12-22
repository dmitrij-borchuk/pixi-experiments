import Phaser, { Scene } from 'phaser'
import stoneFloor from './assets/stoneFloor.jpg'
import player from './assets/player.png'
import { applyCameraToSprite, applyMovement, applyPlayer, applyPointerLock } from '../../utils/gameUtils'
import { generateInitialStructure } from './generator'

const tileSize = 120

enum TEXTURES {
  stoneFloor = 'stoneFloor',
  player = 'player',
}

// TODO: add loading
export class RoomScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    // TODO: fix loading problem
    // if you remove next line other textures will not load on start
    this.load.image(TEXTURES.stoneFloor, stoneFloor)
    this.textures.addBase64(TEXTURES.player, player)
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

    this.addPlayer(initialData.player.position)

    applyCameraToSprite(this, this.player)
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })
  }

  private addPlayer(position: [number, number]) {
    this.player = applyPlayer(this, {
      coords: position,
      tileSize,
      scale: 0.5,
    })
    // TODO: add collision with initial structure
    // applyCollider(this, this.player, this.walls)

    const { onUpdate } = applyMovement(this, this.player)
    this.onUpdateListeners.push(onUpdate)
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
          applyPointerLock(game)
        },
      },
    })

    return game
  },
}
