import Phaser, { Scene } from 'phaser'
// import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'
import wall from './assets/wall1.png'
import life from '../../assets/life.png'
import stoneFloor from './assets/stoneFloor.jpg'
import cursor from './assets/cursor2.png'
import drone1 from './assets/drone1.png'
import laserBullet from './assets/laserBullet.png'
import bullet from './assets/bullet.png'
import toolbarCell from './assets/toolbarCell.png'
import airLock from './assets/airLock.png'
import airLockOpen from './assets/airLockOpen.png'
import player from './assets/player.png'
import laserGun from './assets/laserGun.png'
// import ship from './ship.json'
import { constrainReticle, constrainVelocity, getVelocityTo, getWorldSize, isUsable } from './utils'
import { Bullet } from './Bullet'
import { generateStation } from '../../utils/scifiGenerator'
import { Gun } from './Gun'
import { Spawner } from './Spawner'

// const ship = generateShip()
const ship = generateStation()

const tileSize = 120

enum TOOLS {
  NOOP = 'NOOP',
  WALL = 'WALL',
  PISTOL = 'PISTOL',
}
const toolArray = [TOOLS.PISTOL, TOOLS.NOOP]
export class RoomScene extends Scene {
  private enemyBullets!: Phaser.Physics.Arcade.Group
  // TODO: probably this shouldn't be `Phaser.Physics.Arcade.Group`
  private objects!: Phaser.Physics.Arcade.Group
  private toolBox!: Phaser.GameObjects.Container
  public player!: Phaser.Physics.Arcade.Sprite
  private enemies: Phaser.Physics.Arcade.Sprite[] = []
  private reticle!: Phaser.Physics.Arcade.Sprite
  private hp1!: Phaser.GameObjects.Image
  private hp2!: Phaser.GameObjects.Image
  private hp3!: Phaser.GameObjects.Image
  private playerHealth!: number
  private scoreText!: Phaser.GameObjects.Text
  private score = 0
  private lastEnemyOffset = 0
  private spawner = {
    x: -10,
    y: -10,
  }
  private spawners: Spawner[] = []
  public walls!: Phaser.Physics.Arcade.StaticGroup
  private currentTool = toolArray[1]

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    // TODO: fix loading problem
    // if you remove next line other textures will not load on start
    this.load.image('stoneFloor', stoneFloor)
    this.textures.addBase64('player_handgun', player)
    this.textures.addBase64('wall', wall)
    this.textures.addBase64('airLock', airLock)
    this.textures.addBase64('airLockOpen', airLockOpen)
    this.textures.addBase64('life', life)
    this.textures.addBase64('cursor', cursor)
    this.textures.addBase64('drone', drone1)
    this.textures.addBase64('toolbarCell', toolbarCell)
    this.textures.addBase64('laserBullet', laserBullet)
    this.textures.addBase64('bullet', bullet)
    this.textures.addBase64('laserGun', laserGun)
  }
  create() {
    const worldSize = getWorldSize(ship.map)
    console.log('=-= ship.map', ship.map)

    // Clear data
    this.enemies = []

    // Set world bounds
    this.physics.world.setBounds(
      worldSize.x * tileSize,
      worldSize.y * tileSize,
      worldSize.w * tileSize,
      worldSize.h * tileSize
    )

    // Initial structure
    this.objects = this.physics.add.group({ classType: Gun })
    const { walls } = this.makeInitialStructure()
    this.walls = walls

    this.addPlayer()

    // Set camera properties
    this.cameras.main.zoom = 0.5
    this.cameras.main.startFollow(this.player)

    // this.createEnemy(this.spawner.x, this.spawner.y)

    // UI
    this.createItemsBar()

    // Cursor
    this.reticle = this.physics.add.sprite(this.player.body.position.x, this.player.body.position.y, 'cursor')
    this.reticle.depth = 100

    // ===================================================
    // const roomData = getRoom({
    //   minWidth: 12,
    //   maxWidth: 25,
    //   minHeight: 12,
    //   maxHeight: 25,
    // })

    // const walls = addRoom(this.physics, roomData)

    // Add 2 groups for Bullet objects
    const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

    // this.exit = addExit(this.physics, roomData.exit.x * tileSize, roomData.exit.y * tileSize)

    this.hp1 = this.add.image(-350, -250, 'life').setScrollFactor(0, 0)
    this.hp1.depth = 90
    this.hp2 = this.add.image(-280, -250, 'life').setScrollFactor(0, 0)
    this.hp2.depth = 90
    this.hp3 = this.add.image(-210, -250, 'life').setScrollFactor(0, 0)
    this.hp3.depth = 90

    this.scoreText = this.add.text(16, -250, 'score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0, 0)

    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true)
    this.hp1.setDisplaySize(50, 50)
    this.hp2.setDisplaySize(50, 50)
    this.hp3.setDisplaySize(50, 50)

    // this.physics.add.overlap(this.player, this.exit, this.onExitTouched.bind(this), undefined, this)

    // Set sprite constiables
    this.playerHealth = 3

    // Creates object for input with WASD kets
    const moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any

    // this.physics.add.collider(this.player, walls)

    // Enables movement of player with WASD keys
    this.input.keyboard.on('keydown_W', (event: any) => {
      this.player.setAccelerationY(-2000)
    })
    this.input.keyboard.on('keydown_S', (event: any) => {
      this.player.setAccelerationY(2000)
    })
    this.input.keyboard.on('keydown_A', (event: any) => {
      this.player.setAccelerationX(-2000)
    })
    this.input.keyboard.on('keydown_D', (event: any) => {
      this.player.setAccelerationX(2000)
    })

    // Stops player acceleration on uppress of WASD keys
    this.input.keyboard.on('keyup_W', (event: any) => {
      if (moveKeys['down'].isUp) this.player.setAccelerationY(0)
    })
    this.input.keyboard.on('keyup_S', (event: any) => {
      if (moveKeys['up'].isUp) this.player.setAccelerationY(0)
    })
    this.input.keyboard.on('keyup_A', (event: any) => {
      if (moveKeys['right'].isUp) this.player.setAccelerationX(0)
    })
    this.input.keyboard.on('keyup_D', (event: any) => {
      if (moveKeys['left'].isUp) this.player.setAccelerationX(0)
    })

    this.input.keyboard.on('keydown_E', (event: any) => {
      this.onUsePressed()
    })

    // Fires bullet from player on left click of mouse
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, time: any, lastFired: any) => {
        if (this.player.active === false) return

        if (this.currentTool === TOOLS.PISTOL) {
          // Get bullet from bullets group
          const bullet = playerBullets.get().setActive(true).setVisible(true)

          if (bullet) {
            bullet.fire(this.player, this.reticle)
            // TODO: sometimes bullets go through the enemy
            this.enemies.forEach((enemy) => {
              this.physics.add.collider(enemy, bullet, this.enemyHitCallback.bind(this))
            })
            this.walls.children.getArray().forEach((item) => {
              this.physics.add.collider(item, bullet, this.enemyHitCallback.bind(this))
            })
          }
        }

        if (this.currentTool === TOOLS.WALL) {
          this.onBuildClick()
        }
      },
      this
    )

    // Move reticle upon locked pointer move
    this.input.on(
      'pointermove',
      function (this: any, pointer: { movementX: any; movementY: any }) {
        if (this.input.mouse.locked) {
          this.reticle.x += pointer.movementX
          this.reticle.y += pointer.movementY
        }
      },
      this
    )

    // this.input.on(
    //   'wheel',
    //   (pointer: { movementX: any; movementY: any }, objects: any[], dx: number, dy: number, dz: number) => {
    //     const index = toolArray.findIndex((tool) => tool === this.currentTool)
    //     const newIndex = dy > 0 ? index + 1 : index - 1
    //     if (newIndex < 0) {
    //       this.currentTool = toolArray[toolArray.length - 1]
    //     } else if (newIndex >= toolArray.length) {
    //       this.currentTool = toolArray[0]
    //     } else {
    //       this.currentTool = toolArray[newIndex]
    //     }
    //   }
    // )
  }
  update(time: any, delta: any) {
    // Rotates player to face towards reticle
    this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.reticle.x, this.reticle.y)

    // Rotates enemy to face towards player
    this.enemies.forEach((enemy) => {
      enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
      const [vx, vy] = getVelocityTo(enemy.rotation, 200)
      enemy.setAcceleration(vx, vy)

      // Make enemy fire
      this.enemyFire(enemy, this.player, time, this)
    })

    //Make reticle move with player
    this.reticle.body.velocity.x = this.player.body.velocity.x
    this.reticle.body.velocity.y = this.player.body.velocity.y

    // Constrain velocity of player
    constrainVelocity(this.player, 500)

    // Constrain position of constrainReticle
    constrainReticle(this.reticle, this.player)

    // if (time - this.lastEnemyOffset > 30000) {
    //   this.lastEnemyOffset = time
    //   // this.createEnemy(this.spawner.x, this.spawner.y)
    // }

    this.spawners.forEach((spawner) => spawner.update(time, delta))
  }

  private getLocalCoordsUnderCursor() {
    const { x, y } = this.reticle
    const offsetX = x > 0 ? tileSize / 2 : -tileSize / 2
    const offsetY = y > 0 ? tileSize / 2 : -tileSize / 2
    const localX = x + offsetX
    const localY = y + offsetY

    return [localX, localY]
  }

  private getLocalCoordsOfToleCornerUnderCursor() {
    const [localX, localY] = this.getLocalCoordsUnderCursor()

    return [localX - (localX % tileSize), localY - (localY % tileSize)]
  }

  private getTileCoordsUnderCursor() {
    const [x, y] = this.getLocalCoordsOfToleCornerUnderCursor()

    return [x / tileSize, y / tileSize]
  }

  private getObjectUnderCursor(): [any | undefined, string | undefined] {
    const [x, y] = this.getTileCoordsUnderCursor()
    // TODO: resolve any
    const tile = this.objectMap[`${x}|${y}`]
    const key = `${x}|${y}`

    return [tile, ship.map[key]]
  }

  private onBuildClick() {
    const [localX, localY] = this.getLocalCoordsUnderCursor()
    this.walls
      .create(localX - (localX % tileSize), localY - (localY % tileSize), 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
  }

  private onUsePressed() {
    const [obj, type] = this.getObjectUnderCursor()
    // console.log('=-= obj, type', obj, type)

    if (type === 'airLock') {
      if (obj.body.enable) {
        obj.setTexture('airLockOpen')
        obj.disableBody()
      } else {
        obj.setTexture('airLock')
        obj.enableBody()
      }
    }

    if (isUsable(obj)) {
      const result = obj.use()
      const { inventory } = result || {}
      if (inventory) {
        inventory.forEach((item) => {
          if (item === 'laserGun') {
            this.currentTool = TOOLS.PISTOL
            const gun = this.add.image(0, 0, 'laserGun').setDisplaySize(113, 127).setScrollFactor(0)
            // const bar = this.add.image(0, 0, 'laserBullet').setDisplaySize(113, 127).setScrollFactor(0)
            // gun.depth = 91
            this.toolBox.add(gun)
          }
        })
      }
    }
  }

  startFromBeginning() {
    this.scene.stop('room')
    this.scene.start('room')
  }

  enemyFire(enemy: Phaser.Physics.Arcade.Sprite, player: Phaser.Physics.Arcade.Sprite, time: number, gameObject: any) {
    if (enemy.active === false) {
      return
    }

    const lastFired = enemy.data.get('lastFired')
    if (time - lastFired > 1000) {
      enemy.setData('lastFired', time)

      // Get bullet from bullets group
      const bullet = this.enemyBullets.get().setActive(true).setVisible(true)

      if (bullet) {
        bullet.fire(enemy, player)
        // Add collider between bullet and player
        gameObject.physics.add.collider(player, bullet, this.playerHitCallback.bind(this))
      }
    }
  }
  playerHitCallback(playerHit: any, bulletHit: any) {
    // Reduce health of player
    if (bulletHit.active === true && playerHit.active === true) {
      this.playerHealth = this.playerHealth - 1
      console.log('Player hp: ', this.playerHealth)

      // Kill hp sprites and kill player if health <= 0
      if (this.playerHealth === 2) {
        this.hp3.destroy()
      } else if (this.playerHealth === 1) {
        this.hp2.destroy()
      } else {
        this.hp1.destroy()
        console.log('Game over')
        this.startFromBeginning()
      }

      // Destroy bullet
      bulletHit.setActive(false).setVisible(false)
    }
  }

  enemyHitCallback(enemyHit: Phaser.GameObjects.GameObject, bulletHit: Phaser.GameObjects.GameObject) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
      const newHealth = enemyHit.getData('health') - 1
      enemyHit.setData('health', newHealth)

      // Kill enemy if health <= 0
      if (newHealth <= 0) {
        const index = this.enemies.findIndex((enemy) => enemy === enemyHit)
        this.enemies.splice(index, 1)
        this.score += 1
        this.scoreText.setText(`score: ${this.score}`)
        enemyHit.destroy()
        if (this.enemies.length === 0) {
          // this.exit.setFrame(24)
          // this.canMoveNext = true
        }
      }

      // Destroy bullet
      bulletHit.destroy()
    }
  }

  public createEnemy(x: number, y: number) {
    const enemy = this.physics.add.sprite(x * tileSize, y * tileSize, 'drone')
    enemy.setDisplaySize(tileSize, tileSize).setCollideWorldBounds(true)
    enemy.setData('lastHit', 0)
    enemy.setData('health', 3)
    this.physics.add.collider(enemy, this.walls)
    // this.physics.add.overlap(this.player, enemy, this.onEnemyOverlapPlayer.bind(this), undefined, this)
    if (this.player) {
      this.physics.add.collider(this.player, enemy, this.onEnemyOverlapPlayer.bind(this), undefined, this)
    }
    this.enemies.push(enemy)
    return enemy
  }

  onEnemyOverlapPlayer(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const time = this.game.getTime()

    const lastFired = enemy.data.get('lastHit')
    if (time - lastFired > 1000) {
      enemy.setData('lastHit', time)
      this.playerHealth = this.playerHealth - 1
      if (this.playerHealth === 2) {
        this.hp3.destroy()
      } else if (this.playerHealth === 1) {
        this.hp2.destroy()
      } else {
        this.hp1.destroy()

        this.startFromBeginning()
      }
    }

    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body
    const playerBody = enemy.body as Phaser.Physics.Arcade.Body

    const angle = Phaser.Math.Angle.Between(enemyBody.x, enemyBody.y, playerBody.x, playerBody.y)
    const [vx, vy] = getVelocityTo(360 - angle, 200)

    enemyBody.velocity.x = vx
    enemyBody.velocity.y = vy
  }

  createItemsBar() {
    const { width, height } = this.game.config
    const x = +width / 2
    const y = +height * 1.5 - 127 / 2
    this.toolBox = this.add.container(x, y)
    const bar = this.add.image(0, 0, 'toolbarCell').setDisplaySize(113, 127).setScrollFactor(0)
    // const bar = this.add.image(0, 0, 'laserBullet').setDisplaySize(113, 127).setScrollFactor(0)
    bar.depth = 90
    this.toolBox.add(bar)
  }

  private objectMap: Record<string, any> = {}
  private makeInitialStructure() {
    // makeFloorRect(this, -2, -2, 5, 5)

    this.walls = this.physics.add.staticGroup()
    // const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

    const keys = Object.keys(ship.map)
    keys.forEach((key) => {
      // TODO: move splitter to constants
      const indexes = key.split('|')
      const lineIndex = parseInt(indexes[1], 10)
      const columnIndex = parseInt(indexes[0], 10)
      const item = ship.map[key]
      const x = columnIndex * tileSize
      const y = lineIndex * tileSize

      if (item === 'wall') {
        const obj = this.walls
          .create(columnIndex * tileSize, lineIndex * tileSize, 'wall')
          .setDisplaySize(tileSize, tileSize)
          .refreshBody()
        this.objectMap[`${columnIndex}|${lineIndex}`] = obj
      }

      if (item === 'airLock') {
        const obj = this.walls
          .create(columnIndex * tileSize, lineIndex * tileSize, 'airLock')
          .setDisplaySize(tileSize, tileSize)
          .refreshBody()

        this.objectMap[`${columnIndex}|${lineIndex}`] = obj
      }

      if (item === 'laserGun') {
        const obj = this.objects.create(x, y)

        this.objectMap[`${columnIndex}|${lineIndex}`] = obj
      }

      if (item === 'spawner.drone') {
        this.spawners.push(new Spawner(this, columnIndex, lineIndex))
        // this.createEnemy(columnIndex, lineIndex)
      }
    })

    return { walls: this.walls }
  }

  private addPlayer() {
    const [x, y] = ship.startPoint
    this.player = this.physics.add.sprite(x * tileSize, y * tileSize, 'player_handgun')
    this.physics.add.collider(this.player, this.walls)
    this.enemies.forEach((enemy) =>
      this.physics.add.collider(this.player, enemy, this.onEnemyOverlapPlayer.bind(this), undefined, this)
    )
    this.player
      .setDisplaySize(tileSize * 0.5, tileSize * 0.5)
      .setCollideWorldBounds(true)
      .setDrag(3000)
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
          // Pointer lock will only work after mousedown
          game.canvas.addEventListener('mousedown', function () {
            game.input.mouse.requestPointerLock()
          })
        },
      },
    })

    return game
  },
}
