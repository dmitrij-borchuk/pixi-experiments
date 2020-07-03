import Phaser, { Scene } from 'phaser'
import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'
import bunnyImg from '../../assets/bunny.png'
import wallImg from '../../assets/wall50.png'
import doorsTileset from '../../assets/doorsTileset.png'
import life from '../../assets/life.png'
import { getRandom } from '../../utils/random'

const isSamePoints = (p1: IPoint, p2: IPoint) => {
  return p1.x === p2.x && p1.y === p2.y
}

const tileSize = 120
const createWall = (container: any, x: number, y: number) => {
  container.create(x, y, 'wall').setDisplaySize(tileSize, tileSize).refreshBody()
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
  return physics.add.staticSprite(x, y, 'door').setDisplaySize(tileSize, tileSize).refreshBody()
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

const createEnemy = (physics: Phaser.Physics.Arcade.ArcadePhysics, room: IRoom) => {
  const enemy = physics.add.sprite(
    getRandom(room.width - 2, 1) * tileSize,
    getRandom(room.height - 2, 1) * tileSize,
    'player_handgun'
  )
  enemy.setDisplaySize(tileSize, tileSize).setCollideWorldBounds(true)
  enemy.setData('lastFired', 0)
  enemy.setData('health', 3)
  return enemy
}

class RoomScene extends Phaser.Scene {
  enemyBullets!: Phaser.Physics.Arcade.Group
  player!: Phaser.Physics.Arcade.Sprite
  // enemy!: Phaser.Physics.Arcade.Sprite
  enemies!: Phaser.Physics.Arcade.Sprite[]
  exit!: Phaser.Physics.Arcade.Sprite
  reticle!: Phaser.Physics.Arcade.Sprite
  hp1!: Phaser.GameObjects.Image
  hp2!: Phaser.GameObjects.Image
  hp3!: Phaser.GameObjects.Image
  playerHealth!: number
  scoreText!: Phaser.GameObjects.Text
  canMoveNext = false
  score = 0
  level = 1

  constructor() {
    super('room')
  }
  preload() {
    // Load in images and sprites
    this.load.image('bullet', 'assets/sprites/bullets/bullet6.png')
    // this.load.image('life', life)
    this.load.spritesheet('door', doorsTileset, { frameWidth: 72, frameHeight: 96 })
    // this.load.image('background', 'assets/skies/underwater1.png')
    this.textures.addBase64('player_handgun', bunnyImg)
    this.textures.addBase64('wall', wallImg)
    this.textures.addBase64('life', life)
  }
  create() {
    const roomData = getRoom({
      minWidth: 12,
      maxWidth: 25,
      minHeight: 12,
      maxHeight: 25,
    })
    // Set world bounds
    this.physics.world.setBounds(
      -(tileSize / 2),
      -(tileSize / 2),
      roomData.width * tileSize,
      roomData.height * tileSize
    )
    const walls = addRoom(this.physics, roomData)
    // this.scene.add

    // Add 2 groups for Bullet objects
    const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })
    this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

    this.exit = addExit(this.physics, roomData.exit.x * tileSize, roomData.exit.y * tileSize)

    this.player = this.physics.add.sprite(roomData.enter.x * tileSize, roomData.enter.y * tileSize, 'player_handgun')

    // TODO: no enemy overlap
    this.enemies = []
    for (let i = 0; i < this.level; i++) {
      this.enemies.push(createEnemy(this.physics, roomData))
    }
    console.log('=-= this.enemies', this.enemies)
    this.reticle = this.physics.add.sprite(800, 700, 'life')
    this.hp1 = this.add.image(-350, -250, 'life').setScrollFactor(0, 0)
    this.hp2 = this.add.image(-280, -250, 'life').setScrollFactor(0, 0)
    this.hp3 = this.add.image(-210, -250, 'life').setScrollFactor(0, 0)

    this.scoreText = this.add.text(16, -250, 'score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0, 0)

    this.player
      .setDisplaySize(tileSize * 0.9, tileSize * 0.9)
      .setCollideWorldBounds(true)
      .setDrag(800, 800)
    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true)
    this.hp1.setDisplaySize(50, 50)
    this.hp2.setDisplaySize(50, 50)
    this.hp3.setDisplaySize(50, 50)

    this.physics.add.overlap(this.player, this.exit, this.onExitTouched.bind(this), undefined, this)

    // Set sprite constiables
    this.playerHealth = 3

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
          this.enemies.forEach((enemy) => {
            this.physics.add.collider(enemy, bullet, this.enemyHitCallback.bind(this))
          })
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
    this.enemies.forEach((enemy) => {
      enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
      const [vx, vy] = getVelocityTo(enemy.rotation, 100)
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
  }

  onExitTouched() {
    if (this.canMoveNext) {
      this.level += 1
      this.startFromBeginning()
    }
  }

  startFromBeginning() {
    this.scene.stop('room')
    this.scene.start('room')
    this.canMoveNext = false
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
          this.exit.setFrame(24)
          this.canMoveNext = true
        }
      }

      // Destroy bullet
      bulletHit.destroy()
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

    // game.add.text(32, 32, "this text is on the background\nuse arrows to scroll", { font: "32px Arial", fill: "#f26c4f", align: "left" });

    return game
  },
}
