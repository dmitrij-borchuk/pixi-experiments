import Phaser, { Scene } from 'phaser'
import stoneFloor from './assets/stoneFloor.jpg'
import player from './assets/player.png'
import { applyMovement, applyPlayer, applyPointerLock } from '../../utils/gameUtils'

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
    const worldSize = {
      x: 0,
      y: 0,
      h: 100,
      w: 100,
    }

    // Set world bounds
    this.physics.world.setBounds(
      worldSize.x * tileSize,
      worldSize.y * tileSize,
      worldSize.w * tileSize,
      worldSize.h * tileSize
    )

    // Background
    this.add.tileSprite(0, 0, worldSize.w * tileSize, worldSize.h * tileSize, TEXTURES.stoneFloor)

    this.addPlayer()
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })
  }

  private addPlayer() {
    this.player = applyPlayer(this, {
      coords: [0, 0],
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
