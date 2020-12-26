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

export function applyCameraToSprite(scene: Scene, sprite: Phaser.Physics.Arcade.Sprite) {
  scene.cameras.main.zoom = 0.5
  scene.cameras.main.startFollow(sprite)
}

export function getTileFomCoords(tileW: number, tileH: number, x: number, y: number) {
  return [Math.floor((x + tileW / 2) / tileW), Math.floor((y + tileH / 2) / tileH)]
}

export function saveGame<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function loadGame<T extends any>(key: string) {
  const data = localStorage.getItem(key)
  return !data ? null : (JSON.parse(data) as T)
}

export function getFirstHit<T>(
  scene: Scene,
  pointer: Phaser.Input.Pointer,
  gameObjects: T[],
  camera?: Phaser.Cameras.Scene2D.Camera
): T | undefined {
  const currentCamera = camera || scene.cameras.main
  const [firstHit] = scene.input.manager.hitTest(pointer, gameObjects, currentCamera) as T[]

  return firstHit
}

interface Asset {
  type: 'image' | 'base64'
  name: string
  data: string
}
export function preloadAssets(scene: Scene, assets: Asset[]) {
  const base64AssetsToLoad: string[] = []
  let base64Amount = 0
  let imageAmount = 0
  let base64Progress = 0
  let imagesProgress = 0
  assets.forEach((asset) => {
    if (asset.type === 'image') {
      imageAmount++
      return scene.load.image(asset.name, asset.data)
    }

    if (asset.type === 'base64') {
      base64AssetsToLoad.push(asset.name)
      scene.textures.addBase64(asset.name, asset.data)
    }
  })
  base64Amount = base64AssetsToLoad.length

  var progressBar = scene.add.graphics()
  progressBar.depth = 100
  var progressBox = scene.add.graphics()
  progressBox.fillStyle(0x222222, 0.8)
  progressBox.fillRect(240, 270, 320, 50)
  progressBox.depth = 100

  const onComplete = () => {
    progressBar.destroy()
    progressBox.destroy()
  }

  function setProgress() {
    const all = imageAmount + base64Amount
    const imagePart = imageAmount / all
    const base64Part = base64Amount / all
    const value = base64Part * base64Progress + imagePart * imagesProgress
    progressBar.clear()
    progressBar.fillStyle(0xffffff, 1)
    progressBar.fillRect(250, 280, 300 * value, 30)

    if (value === 1) {
      onComplete()
    }
  }

  scene.load.on('progress', function (value: number) {
    imagesProgress = value
    setProgress()
  })

  scene.textures.on('onload', (name: string) => {
    const index = base64AssetsToLoad.indexOf(name)
    if (index >= 0) {
      base64AssetsToLoad.splice(index, 1)
    }
    base64Progress = (base64Amount - base64AssetsToLoad.length) / base64Amount
    setProgress()
  })
}

export function applyDynamicTileBackground(scene: Scene, textureName: string) {
  const bg = scene.add.tileSprite(0, 0, 0, 0, textureName)
  const texture = scene.textures.get(textureName)
  const image = texture.getSourceImage()
  const textureWidth = image.width
  const textureHeight = image.height

  return function () {
    const { width, height, centerX, centerY } = scene.cameras.main.worldView
    const x = centerX - (centerX % textureWidth)
    const y = centerY - (centerY % textureHeight)
    bg.setPosition(x, y)
    bg.setSize(width + textureWidth * 3, height + textureHeight * 3)
  }
}
