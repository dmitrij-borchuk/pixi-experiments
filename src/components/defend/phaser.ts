import Phaser from 'phaser'
// import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'
import bunnyImg from '../../assets/bunny.png'
import wall from './assets/wall.png'
import floor from './assets/floor.png'
import doorsTileset from '../../assets/doorsTileset.png'
import life from '../../assets/life.png'
import stoneFloor from './assets/stoneFloor.jpg'
import cursor from './assets/cursor.png'
import drone1 from './assets/drone1.png'
import laserBullet from './assets/laserBullet.png'
import toolbarCell from './assets/toolbarCell.png'

// const isSamePoints = (p1: IPoint, p2: IPoint) => {
//   return p1.x === p2.x && p1.y === p2.y
// }

const tileSize = 120
// const createWall = (container: any, x: number, y: number) => {
//   container.create(x, y, 'wall').setDisplaySize(tileSize, tileSize).refreshBody()
// }

// const addRoom = (physics: any, room: IRoom) => {
//   const walls = physics.add.staticGroup()
//   for (let i = 0; i < room.width; i++) {
//     if (!isSamePoints(room.enter, { x: i, y: 0 }) && !isSamePoints(room.exit, { x: i, y: 0 })) {
//       createWall(walls, i * tileSize, 0)
//     }
//     if (
//       !isSamePoints(room.enter, { x: i, y: room.height - 1 }) &&
//       !isSamePoints(room.exit, { x: i, y: room.height - 1 })
//     ) {
//       createWall(walls, i * tileSize, (room.height - 1) * tileSize)
//     }
//   }
//   for (let i = 1; i < room.height - 1; i++) {
//     if (!isSamePoints(room.enter, { x: 0, y: i }) && !isSamePoints(room.exit, { x: 0, y: i })) {
//       createWall(walls, 0, i * tileSize)
//     }
//     if (
//       !isSamePoints(room.enter, { x: room.width - 1, y: i }) &&
//       !isSamePoints(room.exit, { x: room.width - 1, y: i })
//     ) {
//       createWall(walls, (room.width - 1) * tileSize, i * tileSize)
//     }
//   }

//   return walls
// }

// const addExit = (physics: Phaser.Physics.Arcade.ArcadePhysics, x: number, y: number) => {
//   return physics.add.staticSprite(x, y, 'door').setDisplaySize(tileSize, tileSize).refreshBody()
// }

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite: any, maxVelocity: any) {
  if (!sprite || !sprite.body) return

  let angle, currVelocitySqr, vx, vy
  vx = sprite.body.velocity.x
  vy = sprite.body.velocity.y
  currVelocitySqr = vx * vx + vy * vy

  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx)
    vx = Math.cos(angle) * maxVelocity
    vy = Math.sin(angle) * maxVelocity
    sprite.body.velocity.x = vx
    sprite.body.velocity.y = vy
  }
}

function getVelocityTo(angle: number, maxVelocity: number) {
  const vx = Math.cos(angle) * maxVelocity
  const vy = Math.sin(angle) * maxVelocity
  return [vx, vy]
}

// Ensures reticle does not move offscreen
function constrainReticle(reticle: any, player: any) {
  const distX = reticle.x - player.x // X distance between player & reticle
  const distY = reticle.y - player.y // Y distance between player & reticle

  // Ensures reticle cannot be moved offscreen (player follow)
  if (distX > 800) reticle.x = player.x + 800
  else if (distX < -800) reticle.x = player.x - 800

  if (distY > 600) reticle.y = player.y + 600
  else if (distY < -600) reticle.y = player.y - 600
}

class Bullet extends Phaser.GameObjects.Image {
  speed!: number
  born!: number
  direction!: number
  xSpeed!: number
  ySpeed!: number

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bullet')
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet')
    this.speed = 1
    this.born = 0
    this.direction = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.setSize(12, 12)
  }

  // Fires a bullet from the player to the reticle
  fire(shooter: { x: number; y: number; rotation: number }, target: { x: number; y: number }): void {
    this.setPosition(shooter.x, shooter.y) // Initial position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y))

    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction)
      this.ySpeed = this.speed * Math.cos(this.direction)
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction)
      this.ySpeed = -this.speed * Math.cos(this.direction)
    }

    this.rotation = shooter.rotation // angle bullet with shooters rotation
    this.born = 0 // Time since new bullet spawned
  }

  // Updates the position of the bullet each cycle
  update(time: any, delta: number) {
    this.x += this.xSpeed * delta
    this.y += this.ySpeed * delta
    this.born += delta
    if (this.born > 1800) {
      this.setActive(false)
      this.setVisible(false)
    }
  }
}

const makeFloor = (scene: Phaser.Scene, x: number, y: number) => {
  return scene.add.image(x * tileSize, y * tileSize, 'floor').setDisplaySize(tileSize, tileSize)
}
const makeFloorRect = (scene: Phaser.Scene, x: number, y: number, w: number, h: number) => {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      makeFloor(scene, x + i, y + j)
    }
  }
}

enum TOOLS {
  NOOP = 'NOOP',
  WALL = 'WALL',
  PISTOL = 'PISTOL',
}
const toolArray = [TOOLS.NOOP, TOOLS.PISTOL, TOOLS.WALL]
class RoomScene extends Phaser.Scene {
  private enemyBullets!: Phaser.Physics.Arcade.Group
  private player!: Phaser.Physics.Arcade.Sprite
  // enemy!: Phaser.Physics.Arcade.Sprite
  private enemies: Phaser.Physics.Arcade.Sprite[] = []
  // exit!: Phaser.Physics.Arcade.Sprite
  private reticle!: Phaser.Physics.Arcade.Sprite
  private hp1!: Phaser.GameObjects.Image
  private hp2!: Phaser.GameObjects.Image
  private hp3!: Phaser.GameObjects.Image
  private playerHealth!: number
  private scoreText!: Phaser.GameObjects.Text
  private canMoveNext = false
  private score = 0
  private level = 1
  private lastEnemyOffset = 0
  private spawner = {
    x: -10,
    y: -10,
  }
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private currentTool = TOOLS.NOOP
  private toolImage!: Phaser.GameObjects.Image

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    this.load.image('bullet', 'assets/sprites/bullets/bullet6.png')
    this.load.spritesheet('door', doorsTileset, { frameWidth: 72, frameHeight: 96 })
    this.load.image('stoneFloor', stoneFloor)
    this.textures.addBase64('player_handgun', bunnyImg)
    this.textures.addBase64('wall', wall)
    this.textures.addBase64('floor', floor)
    this.textures.addBase64('life', life)
    this.textures.addBase64('cursor', cursor)
    this.textures.addBase64('drone', drone1)
    this.textures.addBase64('toolbarCell', toolbarCell)
    this.textures.addBase64('laserBullet', laserBullet)
  }
  create() {
    const levelData = {
      w: 2000,
      h: 2000,
    }

    // Clear data
    this.enemies = []

    // Background
    this.add.tileSprite(0, 0, levelData.w, levelData.h, 'stoneFloor')

    // Set world bounds
    this.physics.world.setBounds(-(levelData.w / 2), -(levelData.h / 2), levelData.w, levelData.h)

    // Initial structure
    const { walls } = this.makeInitialStructure()
    this.walls = walls

    // Player
    this.player = this.physics.add.sprite(0, 0, 'player_handgun')
    this.physics.add.collider(this.player, walls)
    this.player
      .setDisplaySize(tileSize * 0.9, tileSize * 0.9)
      .setCollideWorldBounds(true)
      .setDrag(1600)

    // Set camera properties
    this.cameras.main.zoom = 0.5
    this.cameras.main.startFollow(this.player)

    this.createEnemy(this.spawner.x, this.spawner.y)

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
      this.player.setAccelerationY(-800)
    })
    this.input.keyboard.on('keydown_S', (event: any) => {
      this.player.setAccelerationY(800)
    })
    this.input.keyboard.on('keydown_A', (event: any) => {
      this.player.setAccelerationX(-800)
    })
    this.input.keyboard.on('keydown_D', (event: any) => {
      this.player.setAccelerationX(800)
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
            this.enemies.forEach((enemy) => {
              this.physics.add.collider(enemy, bullet, this.enemyHitCallback.bind(this))
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

    this.input.on(
      'wheel',
      (pointer: { movementX: any; movementY: any }, objects: any[], dx: number, dy: number, dz: number) => {
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
      }
    )
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

    if (time - this.lastEnemyOffset > 30000) {
      this.lastEnemyOffset = time
      this.createEnemy(this.spawner.x, this.spawner.y)
    }
  }

  private onBuildClick() {
    const { x, y } = this.reticle
    console.log('=-= this.reticle', this.reticle.x, this.reticle.y)
    const offsetX = x > 0 ? tileSize / 2 : -tileSize / 2
    const offsetY = y > 0 ? tileSize / 2 : -tileSize / 2
    const localX = x + offsetX
    const localY = y + offsetY
    this.walls
      .create(localX - (localX % tileSize), localY - (localY % tileSize), 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
  }

  private onExitTouched() {
    if (this.canMoveNext) {
      this.level += 1
      this.startFromBeginning()
    }
  }

  startFromBeginning() {
    this.scene.stop('room')
    this.canMoveNext = false
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
          this.canMoveNext = true
        }
      }

      // Destroy bullet
      bulletHit.destroy()
    }
  }

  createEnemy(x: number, y: number) {
    const enemy = this.physics.add.sprite(x * tileSize, y * tileSize, 'drone')
    enemy.setDisplaySize(tileSize, tileSize).setCollideWorldBounds(true)
    enemy.setData('lastHit', 0)
    enemy.setData('health', 3)
    this.physics.add.collider(enemy, this.walls)
    // this.physics.add.overlap(this.player, enemy, this.onEnemyOverlapPlayer.bind(this), undefined, this)
    this.physics.add.collider(this.player, enemy, this.onEnemyOverlapPlayer.bind(this), undefined, this)
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
    var container = this.add.container(x, y)
    const bar = this.add.image(0, 0, 'toolbarCell').setDisplaySize(113, 127).setScrollFactor(0)
    // const bar = this.add.image(0, 0, 'laserBullet').setDisplaySize(113, 127).setScrollFactor(0)
    bar.depth = 90
    container.add(bar)
  }

  private makeInitialStructure() {
    makeFloorRect(this, -2, -2, 5, 5)

    this.walls = this.physics.add.staticGroup()
    this.walls
      .create(-2 * tileSize, -2 * tileSize, 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
    this.walls
      .create(-2 * tileSize, 2 * tileSize, 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
    this.walls
      .create(2 * tileSize, -2 * tileSize, 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()
    this.walls
      .create(2 * tileSize, 2 * tileSize, 'wall')
      .setDisplaySize(tileSize, tileSize)
      .refreshBody()

    return { walls: this.walls }
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
