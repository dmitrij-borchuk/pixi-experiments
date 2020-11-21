import Phaser from 'phaser'
import wall from './assets/wall.png'
import floor from './assets/floor.png'
import toolbarCell from './assets/toolbarCell.png'

enum TOOLS {
  SELECTOR = 'SELECTOR',
  WALL = 'WALL',
  FLOOR = 'FLOOR',
}
const tool2sprite = {
  [TOOLS.FLOOR]: 'floor',
  [TOOLS.WALL]: 'wall',
  [TOOLS.SELECTOR]: '',
}
const toolArray = [TOOLS.SELECTOR, TOOLS.FLOOR, TOOLS.WALL]
const tileSize = 64

class RoomScene extends Phaser.Scene {
  private buildings!: Phaser.Physics.Arcade.StaticGroup
  private currentTool = TOOLS.FLOOR
  private toolImage!: Phaser.GameObjects.Image

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    // this.load.image('bullet', 'assets/sprites/bullets/bullet6.png')
    // this.load.spritesheet('door', doorsTileset, { frameWidth: 72, frameHeight: 96 })
    // this.load.image('stoneFloor', stoneFloor)
    // this.textures.addBase64('player_handgun', bunnyImg)
    this.textures.addBase64('wall', wall)
    this.textures.addBase64('floor', floor)
    // this.textures.addBase64('life', life)
    // this.textures.addBase64('cursor', cursor)
    // this.textures.addBase64('drone', drone1)
    this.textures.addBase64('toolbarCell', toolbarCell)
    // this.textures.addBase64('laserBullet', laserBullet)
  }
  create() {
    const levelData = {
      w: 2000,
      h: 2000,
    }

    this.buildings = this.physics.add.staticGroup()

    // Set world bounds
    this.physics.world.setBounds(-(levelData.w / 2), -(levelData.h / 2), levelData.w, levelData.h)

    // Set camera properties
    this.cameras.main.zoom = 0.5
    // this.cameras.main.startFollow(this.player)

    // UI
    this.createItemsBar()

    // Creates object for input with WASD kets
    const moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any

    // Enables movement of player with WASD keys
    // this.input.keyboard.on('keydown_W', (event: any) => {
    //   this.player.setAccelerationY(-800)
    // })
    // this.input.keyboard.on('keydown_S', (event: any) => {
    //   this.player.setAccelerationY(800)
    // })
    // this.input.keyboard.on('keydown_A', (event: any) => {
    //   this.player.setAccelerationX(-800)
    // })
    // this.input.keyboard.on('keydown_D', (event: any) => {
    //   this.player.setAccelerationX(800)
    // })

    // Stops player acceleration on uppress of WASD keys
    // this.input.keyboard.on('keyup_W', (event: any) => {
    //   if (moveKeys['down'].isUp) this.player.setAccelerationY(0)
    // })
    // this.input.keyboard.on('keyup_S', (event: any) => {
    //   if (moveKeys['up'].isUp) this.player.setAccelerationY(0)
    // })
    // this.input.keyboard.on('keyup_A', (event: any) => {
    //   if (moveKeys['right'].isUp) this.player.setAccelerationX(0)
    // })
    // this.input.keyboard.on('keyup_D', (event: any) => {
    //   if (moveKeys['left'].isUp) this.player.setAccelerationX(0)
    // })

    // Fires bullet from player on left click of mouse
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, time: any, lastFired: any) => {
        console.log('=-= pointer', pointer)
        // if (this.player.active === false) return
        // if (this.currentTool === TOOLS.PISTOL) {
        //   // Get bullet from bullets group
        //   const bullet = playerBullets.get().setActive(true).setVisible(true)
        //   if (bullet) {
        //     bullet.fire(this.player, this.reticle)
        //     this.enemies.forEach((enemy) => {
        //       this.physics.add.collider(enemy, bullet, this.enemyHitCallback.bind(this))
        //     })
        //   }
        // }
        if (this.currentTool !== TOOLS.SELECTOR) {
          this.onBuildClick(this.currentTool, pointer)
        }
      },
      this
    )

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, objects: any[], dx: number, dy: number, dz: number) => {
      console.log('=-= arguments', dy > 0 ? 'down' : 'up')
      const index = toolArray.findIndex((tool) => tool === this.currentTool)
      const newIndex = dy > 0 ? index + 1 : index - 1
      if (newIndex < 0) {
        this.currentTool = toolArray[toolArray.length - 1]
      } else if (newIndex >= toolArray.length) {
        this.currentTool = toolArray[0]
      } else {
        this.currentTool = toolArray[newIndex]
      }
    })
  }
  update(time: any, delta: any) {}

  private onBuildClick(tool: TOOLS, pointer: Phaser.Input.Pointer) {
    const x = pointer.worldX
    const y = pointer.worldY
    const offsetX = x > 0 ? tileSize / 2 : -tileSize / 2
    const offsetY = y > 0 ? tileSize / 2 : -tileSize / 2
    const localX = x + offsetX
    const localY = y + offsetY
    this.buildings
      .create(localX - (localX % tileSize), localY - (localY % tileSize), tool2sprite[tool])
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
  }

  createItemsBar() {
    const { width, height } = this.game.config
    const x = +width / 2
    const y = +height * 1.5 - 127 / 2
    var container = this.add.container(x, y)
    const bar = this.add.image(0, 0, 'toolbarCell').setDisplaySize(113, 127).setScrollFactor(0)
    // const bar = this.add.image(0, 0, 'laserBullet').setDisplaySize(113, 127).setScrollFactor(0)
    bar.depth = 90
    container.add(bar)
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
  backgroundColor: '0x000000',
  scene: RoomScene,
}

export const app = {
  init: () => {
    const game = new Phaser.Game({
      ...config,
      // callbacks: {
      //   ...config.callbacks,
      //   postBoot: () => {
      //     // Pointer lock will only work after mousedown
      //     game.canvas.addEventListener('mousedown', function () {
      //       game.input.mouse.requestPointerLock()
      //     })
      //   },
      // },
    })

    return game
  },
}
