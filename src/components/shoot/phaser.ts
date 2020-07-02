import Phaser, { Scene } from 'phaser'
import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'
import bunnyImg from '../../assets/bunny.png'
import wallImg from '../../assets/wall50.png'
import doorsTileset from '../../assets/doorsTileset.png'

// TODO: lives:
// scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

const isSamePoints = (p1: IPoint, p2: IPoint) => {
  return p1.x === p2.x && p1.y === p2.y
}

const tileSize = 120
const createWall = (container: any, x: number, y: number) => {
  container.create(x, y, 'wall').setOrigin(0, 0).setDisplaySize(tileSize, tileSize).refreshBody()
}

const addRoom = (physics: any, room: IRoom) => {
  const walls = physics.add.staticGroup()
  for (let i = 0; i < room.width; i++) {
    if (!isSamePoints(room.enter, { x: i, y: 0 }) && !isSamePoints(room.exit, { x: i, y: 0 })) {
      createWall(walls, i * tileSize, 0)
    }
    if (
      !isSamePoints(room.enter, { x: i, y: room.height - 1 }) &&
      !isSamePoints(room.exit, { x: i, y: room.height - 1 })
    ) {
      createWall(walls, i * tileSize, (room.height - 1) * tileSize)
    }
  }
  for (let i = 1; i < room.height - 1; i++) {
    if (!isSamePoints(room.enter, { x: 0, y: i }) && !isSamePoints(room.exit, { x: 0, y: i })) {
      createWall(walls, 0, i * tileSize)
    }
    if (
      !isSamePoints(room.enter, { x: room.width - 1, y: i }) &&
      !isSamePoints(room.exit, { x: room.width - 1, y: i })
    ) {
      createWall(walls, (room.width - 1) * tileSize, i * tileSize)
    }
  }

  return walls
}

const addExit = (physics: Phaser.Physics.Arcade.ArcadePhysics, x: number, y: number) => {
  return physics.add.staticSprite(x, y, 'door').setDisplaySize(tileSize, tileSize).setOrigin(0).refreshBody()
}

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

class RoomScene extends Phaser.Scene {
  enemyBullets!: Phaser.Physics.Arcade.Group
  player!: Phaser.Physics.Arcade.Sprite
  enemy!: Phaser.Physics.Arcade.Sprite
  exit!: Phaser.Physics.Arcade.Sprite
  reticle!: Phaser.Physics.Arcade.Sprite
  hp1!: Phaser.GameObjects.Image
  hp2!: Phaser.GameObjects.Image
  hp3!: Phaser.GameObjects.Image
  playerHealth!: number
  enemyHealth!: number
  enemyLastFired!: number
  canMoveNext = false

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    this.load.image('bullet', 'assets/sprites/bullets/bullet6.png')
    this.load.image('target', 'assets/demoscene/ball.png')
    this.load.spritesheet('door', doorsTileset, { frameWidth: 72, frameHeight: 96 })
    // this.load.image('background', 'assets/skies/underwater1.png')
    this.textures.addBase64('player_handgun', bunnyImg)
    this.textures.addBase64('wall', wallImg)
  }
  create() {
    const roomData = getRoom({
      minWidth: 12,
      maxWidth: 25,
      minHeight: 12,
      maxHeight: 25,
    })
    // Set world bounds
    this.physics.world.setBounds(0, 0, roomData.width * tileSize, roomData.height * tileSize)
    const walls = addRoom(this.physics, roomData)
    // this.scene.add

    // Add 2 groups for Bullet objects
    const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

    this.exit = addExit(this.physics, roomData.exit.x * tileSize, roomData.exit.y * tileSize)

    this.player = this.physics.add.sprite(
      roomData.enter.x * tileSize + tileSize / 2,
      roomData.enter.y * tileSize + tileSize / 2,
      'player_handgun'
    )
    this.enemy = this.physics.add.sprite(300, 600, 'player_handgun')
    this.reticle = this.physics.add.sprite(800, 700, 'target')
    this.hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5)
    this.hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5)
    this.hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5)

    this.player
      .setOrigin(0.5, 0.5)
      .setDisplaySize(tileSize * 0.9, tileSize * 0.9)
      .setCollideWorldBounds(true)
      .setDrag(800, 800)
    this.enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true)
    this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true)
    this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50)
    this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50)
    this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50)

    this.physics.add.overlap(this.player, this.exit, this.onExitTouched.bind(this), undefined, this)

    // Set sprite constiables
    this.playerHealth = 3
    this.enemyHealth = 3
    this.enemyLastFired = 0

    // Set camera properties
    this.cameras.main.zoom = 0.5
    this.cameras.main.startFollow(this.player)

    // Creates object for input with WASD kets
    const moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any

    this.physics.add.collider(this.player, walls)

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
      (pointer: any, time: any, lastFired: any) => {
        if (this.player.active === false) return

        // Get bullet from bullets group
        const bullet = playerBullets.get().setActive(true).setVisible(true)

        if (bullet) {
          bullet.fire(this.player, this.reticle)
          this.physics.add.collider(this.enemy, bullet, this.enemyHitCallback.bind(this))
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
  }
  update(time: any, delta: any) {
    // Rotates player to face towards reticle
    this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.reticle.x, this.reticle.y)

    // Rotates enemy to face towards player
    this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y)

    //Make reticle move with player
    this.reticle.body.velocity.x = this.player.body.velocity.x
    this.reticle.body.velocity.y = this.player.body.velocity.y

    // Constrain velocity of player
    constrainVelocity(this.player, 500)

    // Constrain position of constrainReticle
    constrainReticle(this.reticle, this.player)

    // Make enemy fire
    this.enemyFire(this.enemy, this.player, time, this)
  }

  onExitTouched() {
    if (this.canMoveNext) {
      this.scene.stop('room')
      this.scene.start('room')
      this.canMoveNext = false
    }
  }

  enemyFire(enemy: any, player: any, time: any, gameObject: any) {
    if (enemy.active === false) {
      return
    }

    if (time - this.enemyLastFired > 1000) {
      this.enemyLastFired = time

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
        // Game over state should execute here
      }

      // Destroy bullet
      bulletHit.setActive(false).setVisible(false)
    }
  }

  enemyHitCallback(enemyHit: any, bulletHit: any) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
      this.enemyHealth = this.enemyHealth - 1
      console.log('Enemy hp: ', this.enemyHealth)

      // Kill enemy if health <= 0
      if (this.enemyHealth <= 0) {
        enemyHit.setActive(false).setVisible(false)
        this.exit.setFrame(24)
        this.canMoveNext = true
      }

      // Destroy bullet
      bulletHit.setActive(false).setVisible(false)
    }
  }
}

export const app = {
  init: () => {
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

    const game = new Phaser.Game(config)

    // Pointer lock will only work after mousedown
    game.canvas.addEventListener('mousedown', function () {
      game.input.mouse.requestPointerLock()
    })

    return game
  },
}
