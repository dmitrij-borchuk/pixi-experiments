import Phaser, { Scene } from 'phaser'
import { constrainVelocity } from '../components/shipSurvival/utils'

// Should be called in the `postBoot` callback of the `new Phaser.Game()` config
export function applyPointerLock(game: Phaser.Game) {
  // Pointer lock will only work after mousedown
  game.canvas.addEventListener('mousedown', function () {
    game.input.mouse.requestPointerLock()
  })
}

interface PlayerConfig {
  tileSize: number
  coords: [number, number]
  spriteName?: string
  scale?: number
  drag?: number
}
export function applyPlayer(scene: Scene, config: PlayerConfig) {
  const {
    tileSize,
    coords: [x, y],
    scale = 1,
    drag = 3000,
    spriteName = 'player',
  } = config
  const player = scene.physics.add.sprite(x * tileSize, y * tileSize, spriteName)
  player
    .setDisplaySize(tileSize * scale, tileSize * scale)
    .setCollideWorldBounds(true)
    .setDrag(drag)

  return player
}

type ColliderSubject =
  | Phaser.GameObjects.GameObject
  | Phaser.GameObjects.GameObject[]
  | Phaser.GameObjects.Group
  | Phaser.GameObjects.Group[]
export function applyCollider(scene: Scene, obj1: ColliderSubject, obj2: ColliderSubject, cb?: ArcadePhysicsCallback) {
  scene.physics.add.collider(obj1, obj2, cb)
}

export function applyMovement(scene: Scene, sprite: Phaser.Physics.Arcade.Sprite) {
  // Creates object for input with WASD kets
  const moveKeys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  }) as any

  // Enables movement of player with WASD keys
  scene.input.keyboard.on('keydown_W', () => sprite.setAccelerationY(-2000))
  scene.input.keyboard.on('keydown_S', () => sprite.setAccelerationY(2000))
  scene.input.keyboard.on('keydown_A', () => sprite.setAccelerationX(-2000))
  scene.input.keyboard.on('keydown_D', () => sprite.setAccelerationX(2000))

  // Stops player acceleration on uppress of WASD keys
  scene.input.keyboard.on('keyup_W', (event: any) => {
    if (moveKeys['down'].isUp) sprite.setAccelerationY(0)
  })
  scene.input.keyboard.on('keyup_S', (event: any) => {
    if (moveKeys['up'].isUp) sprite.setAccelerationY(0)
  })
  scene.input.keyboard.on('keyup_A', (event: any) => {
    if (moveKeys['right'].isUp) sprite.setAccelerationX(0)
  })
  scene.input.keyboard.on('keyup_D', (event: any) => {
    if (moveKeys['left'].isUp) sprite.setAccelerationX(0)
  })

  return {
    onUpdate: () => {
      // Constrain velocity of player
      constrainVelocity(sprite, 500)
    },
  }
}
