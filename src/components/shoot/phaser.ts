import Phaser from 'phaser'
import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'
import bunnyImg from '../../assets/bunny.png'
import wallImg from '../../assets/wall50.png'

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
      // backgroundColor: 'fff',
      scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
          player: null,
          healthpoints: null,
          reticle: null,
          moveKeys: null,
          playerBullets: null,
          enemyBullets: null,
          time: 0,
        },
      },
    }

    const game = new Phaser.Game(config)

    // const game = new Phaser.Game(config)

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

    function preload(this: any) {
      // Load in images and sprites
      this.load.image('bullet', 'assets/sprites/bullets/bullet6.png')
      this.load.image('target', 'assets/demoscene/ball.png')
      // this.load.image('background', 'assets/skies/underwater1.png')
      this.textures.addBase64('player_handgun', bunnyImg)
      this.textures.addBase64('wall', wallImg)
    }

    let hp1: any
    let hp2: any
    let hp3: any
    let player: any
    let enemy: any
    let reticle: any
    let enemyBullets: any

    function create(this: any) {
      const roomData = getRoom({
        minWidth: 12,
        maxWidth: 25,
        minHeight: 12,
        maxHeight: 25,
      })
      // Set world bounds
      this.physics.world.setBounds(0, 0, roomData.width * tileSize, roomData.height * tileSize)
      const walls = addRoom(this.physics, roomData)

      // Add 2 groups for Bullet objects
      const playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })
      enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true })

      // Add background player, enemy, reticle, healthpoint sprites
      // const background = this.add.image(800, 600, 'background')
      player = this.physics.add.sprite(
        roomData.enter.x * tileSize + tileSize / 2,
        roomData.enter.y * tileSize + tileSize / 2,
        'player_handgun'
      )
      enemy = this.physics.add.sprite(300, 600, 'player_handgun')
      reticle = this.physics.add.sprite(800, 700, 'target')
      hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5)
      hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5)
      hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5)

      // Set image/sprite properties
      // background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200)
      player
        .setOrigin(0.5, 0.5)
        .setDisplaySize(tileSize * 0.9, tileSize * 0.9)
        .setCollideWorldBounds(true)
        .setDrag(800, 800)
      enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true)
      reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true)
      hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50)
      hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50)
      hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50)

      // Set sprite constiables
      player.health = 3
      enemy.health = 3
      enemy.lastFired = 0

      // Set camera properties
      this.cameras.main.zoom = 0.5
      this.cameras.main.startFollow(player)

      // Creates object for input with WASD kets
      const moveKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      })

      this.physics.add.collider(player, walls)

      // Enables movement of player with WASD keys
      this.input.keyboard.on('keydown_W', function (event: any) {
        player.setAccelerationY(-800)
      })
      this.input.keyboard.on('keydown_S', function (event: any) {
        player.setAccelerationY(800)
      })
      this.input.keyboard.on('keydown_A', function (event: any) {
        player.setAccelerationX(-800)
      })
      this.input.keyboard.on('keydown_D', function (event: any) {
        player.setAccelerationX(800)
      })

      // Stops player acceleration on uppress of WASD keys
      this.input.keyboard.on('keyup_W', function (event: any) {
        if (moveKeys['down'].isUp) player.setAccelerationY(0)
      })
      this.input.keyboard.on('keyup_S', function (event: any) {
        if (moveKeys['up'].isUp) player.setAccelerationY(0)
      })
      this.input.keyboard.on('keyup_A', function (event: any) {
        if (moveKeys['right'].isUp) player.setAccelerationX(0)
      })
      this.input.keyboard.on('keyup_D', function (event: any) {
        if (moveKeys['left'].isUp) player.setAccelerationX(0)
      })

      // Fires bullet from player on left click of mouse
      this.input.on(
        'pointerdown',
        function (this: any, pointer: any, time: any, lastFired: any) {
          if (player.active === false) return

          // Get bullet from bullets group
          const bullet = playerBullets.get().setActive(true).setVisible(true)

          if (bullet) {
            bullet.fire(player, reticle)
            this.physics.add.collider(enemy, bullet, enemyHitCallback)
          }
        },
        this
      )

      // Pointer lock will only work after mousedown
      game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock()
      })

      // Exit pointer lock when Q or escape (by default) is pressed.
      this.input.keyboard.on(
        'keydown_Q',
        function () {
          if (game.input.mouse.locked) game.input.mouse.releasePointerLock()
        },
        0,
        this
      )

      // Move reticle upon locked pointer move
      this.input.on(
        'pointermove',
        function (this: any, pointer: { movementX: any; movementY: any }) {
          if (this.input.mouse.locked) {
            reticle.x += pointer.movementX
            reticle.y += pointer.movementY
          }
        },
        this
      )
    }

    function enemyHitCallback(enemyHit: any, bulletHit: any) {
      // Reduce health of enemy
      if (bulletHit.active === true && enemyHit.active === true) {
        enemyHit.health = enemyHit.health - 1
        console.log('Enemy hp: ', enemyHit.health)

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0) {
          enemyHit.setActive(false).setVisible(false)
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false)
      }
    }

    function playerHitCallback(playerHit: any, bulletHit: any) {
      // Reduce health of player
      if (bulletHit.active === true && playerHit.active === true) {
        playerHit.health = playerHit.health - 1
        console.log('Player hp: ', playerHit.health)

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health == 2) {
          hp3.destroy()
        } else if (playerHit.health == 1) {
          hp2.destroy()
        } else {
          hp1.destroy()
          // Game over state should execute here
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false)
      }
    }

    function enemyFire(enemy: any, player: any, time: any, gameObject: any) {
      if (enemy.active === false) {
        return
      }

      if (time - enemy.lastFired > 1000) {
        enemy.lastFired = time

        // Get bullet from bullets group
        const bullet = enemyBullets.get().setActive(true).setVisible(true)

        if (bullet) {
          bullet.fire(enemy, player)
          // Add collider between bullet and player
          gameObject.physics.add.collider(player, bullet, playerHitCallback)
        }
      }
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
    function constrainReticle(reticle: any) {
      const distX = reticle.x - player.x // X distance between player & reticle
      const distY = reticle.y - player.y // Y distance between player & reticle

      // Ensures reticle cannot be moved offscreen (player follow)
      if (distX > 800) reticle.x = player.x + 800
      else if (distX < -800) reticle.x = player.x - 800

      if (distY > 600) reticle.y = player.y + 600
      else if (distY < -600) reticle.y = player.y - 600
    }

    function update(this: any, time: any, delta: any) {
      // Rotates player to face towards reticle
      player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y)

      // Rotates enemy to face towards player
      enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y)

      //Make reticle move with player
      reticle.body.velocity.x = player.body.velocity.x
      reticle.body.velocity.y = player.body.velocity.y

      // Constrain velocity of player
      constrainVelocity(player, 500)

      // Constrain position of constrainReticle
      constrainReticle(reticle)

      // Make enemy fire
      enemyFire(enemy, player, time, this)
    }

    return game
  },
}
