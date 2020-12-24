import Phaser, { Scene } from 'phaser'
import {
  applyCameraToSprite,
  applyCollider,
  applyMovement,
  getTileFomCoords,
  loadGame,
  saveGame,
} from '../../utils/gameUtils'
import { generateInitialStructure } from './generator'
import { getRandom } from '../../utils/random'
import { Player } from './Player'
import { name2texture, TEXTURES } from './textures'
import { objectsConfig } from './objectsConfig'
import { HUDScene } from './HUD'
import { GameState, LyingObject, ObjectConfig, ObjectInstanceDescriptor, PlayerState } from './types'

const tileSize = 120
const maxDistanceToInteract = tileSize * 2

const keySeparator = '|'
function getMapKey(x: number, y: number) {
  return `${x}${keySeparator}${y}`
}
function parseMapKey(key: string) {
  return key.split(keySeparator)
}

// TODO: add loading
// https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/?a=13

// TODO: remove events when some UI window opened
// pointer, keyboard events

export class MainScene extends Scene {
  public player!: Player
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []
  private lyingObjects!: Phaser.GameObjects.Group
  private constructedObjects!: Phaser.Physics.Arcade.StaticGroup
  private buildPreview?: Phaser.GameObjects.Image
  private currentTool?: ObjectInstanceDescriptor
  private map: GameState['map'] = {}
  private world!: GameState['world']

  constructor() {
    super('mainScene')
  }
  preload() {
    // Load in images and sprites

    // TODO: fix loading problem
    // if you remove next line other textures will not load on start
    // looks like we need to use `this.textures.on('onload', (name: string) => {})`
    this.load.image(TEXTURES.stoneFloor, name2texture.stoneFloor)
    this.textures.addBase64(TEXTURES.player, name2texture.player)
    this.textures.addBase64(TEXTURES.frame, name2texture.frame)
    this.textures.addBase64(TEXTURES.ironPlate, name2texture.ironPlate)
    this.textures.addBase64(TEXTURES.crate, name2texture.crate)
  }
  create() {
    const initialData = this.loadState()
    this.world = initialData.world
    this.map = initialData.map
    const worldSize = initialData.world
    this.lyingObjects = new Phaser.GameObjects.Group(this)
    this.constructedObjects = this.physics.add.staticGroup()

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

    this.addPlayer(initialData.player)

    applyCameraToSprite(this, this.player)

    this.makeInitialStructure(initialData.map)

    this.addMouseEvents()

    const hud = this.scene.get('HUDScene') as HUDScene
    hud.events.on('beltSlotClick', this.onBeltSlotClick.bind(this))
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })

    if (this.buildPreview) {
      // TODO: check if place is available
      this.game.input.mousePointer.updateWorldPoint(this.cameras.main)
      const { worldX, worldY } = this.game.input.mousePointer
      const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
      this.buildPreview.setPosition(x * tileSize, y * tileSize)
    }
  }

  private onBeltSlotClick(descriptor?: ObjectInstanceDescriptor) {
    // TODO: check if buildable
    if (this.buildPreview) {
      this.buildPreview.destroy()
      this.buildPreview = undefined
    }

    this.currentTool = undefined
    if (descriptor) {
      this.currentTool = descriptor
    }

    const constructorConfig = descriptor && objectsConfig[descriptor.id]

    if (constructorConfig) {
      this.buildPreview = this.add.image(0, 0, constructorConfig.view)
      this.buildPreview.setDisplaySize(tileSize, tileSize)
      this.buildPreview.setTint(0x55ff55, 0x55ff55, 0x55ff55, 0x55ff55)
      this.buildPreview.setAlpha(0.5)
    }
  }

  private addPlayer(player: PlayerState) {
    // TODO: fill backpack and belt
    const { position, backpack, belt } = player
    const [x, y] = position
    const scale = 0.5
    const playerGroup = this.physics.add.group({ classType: Player, runChildUpdate: true })
    // TODO: probably `TEXTURES.player` should be moved to the `Player` class
    const playerInstance = playerGroup.get(x * tileSize, y * tileSize, TEXTURES.player) as Player
    playerInstance
      .setDisplaySize(tileSize * scale, tileSize * scale)
      .setCollideWorldBounds(true)
      .setDrag(3000)
    this.player = playerInstance

    backpack.forEach((item) => playerInstance.addToContainer(item))
    const hud = this.scene.get('HUDScene') as HUDScene
    hud.setBelt(belt)

    const { onUpdate } = applyMovement(this, this.player)
    this.onUpdateListeners.push(onUpdate)
  }

  private makeInitialStructure(map: GameState['map']) {
    const keys = Object.keys(map)
    keys.forEach((key) => {
      const config = map[key]
      const constructorConfig = objectsConfig[config.id]
      if (constructorConfig) {
        if (config.kind === 'lying') {
          const {
            position: [x, y],
          } = config

          this.placeObject(constructorConfig, config, x, y)
        } else {
          const {
            position: [x, y],
          } = config
          this.placeConstruction(constructorConfig, x, y)
        }
      }
    })
  }

  private addMouseEvents() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // TODO: check if left mouse click
      if (this.currentTool) {
        // TODO: Check distance
        const constructorConfig = objectsConfig[this.currentTool.id]

        if (constructorConfig) {
          const { worldX, worldY } = pointer
          const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
          this.buildObject(constructorConfig, x, y)
        }
      } else {
        this.useLyingObject(pointer)
      }
    })
  }

  private buildObject(constructorConfig: ObjectConfig, x: number, y: number) {
    if (!this.map[getMapKey(x, y)]) {
      this.map[getMapKey(x, y)] = {
        kind: 'constructed',
        angle: 0,
        health: constructorConfig.maxHealth || 0,
        id: constructorConfig.id,
        position: [x, y],
        step: 0,
      }

      this.placeConstruction(constructorConfig, x, y)

      this.saveState()
    }
  }

  private placeConstruction(constructorConfig: ObjectConfig, x: number, y: number) {
    const obj: Phaser.Physics.Arcade.Image = this.constructedObjects.create(
      x * tileSize,
      y * tileSize,
      constructorConfig.view
    )
    obj.setDisplaySize(tileSize, tileSize)
    obj.setData('id', constructorConfig.id)
    obj.setData('step', 0)
    obj.refreshBody()
    applyCollider(this, this.player, obj)
  }

  private placeObject(constructorConfig: ObjectConfig, config: LyingObject, x: number, y: number) {
    const { amount, id } = config
    const size = tileSize / 2
    const obj: Phaser.GameObjects.Image = this.lyingObjects.create(x * tileSize, y * tileSize, constructorConfig.view)
    obj.setDisplaySize(size, size)
    obj.setAngle(getRandom(360))
    obj.setData('amount', amount)
    obj.setData('id', id)
    obj.setInteractive()
  }

  private useLyingObject(pointer: Phaser.Input.Pointer) {
    const distance = Phaser.Math.Distance.BetweenPoints(this.player.body, { x: pointer.worldX, y: pointer.worldY })
    if (distance <= maxDistanceToInteract) {
      const [firstHit] = this.input.manager.hitTest(
        pointer,
        this.lyingObjects.getChildren(),
        this.cameras.main
      ) as Phaser.GameObjects.Image[]

      if (firstHit) {
        const obj = {
          id: firstHit.getData('id'),
          amount: firstHit.getData('amount'),
        }
        this.player.addToContainer(obj)
        // TODO: it could be animated with flying to player and scaling to 0
        // TODO: remove from the `map`
        firstHit.destroy()
      }
    }
  }

  private saveState() {
    const hud = this.scene.get('HUDScene') as HUDScene
    const [x, y] = getTileFomCoords(tileSize, tileSize, this.player.body.x, this.player.body.y)
    saveGame<GameState>('ds1', {
      map: this.map,
      player: {
        position: [x, y],
        backpack: this.player.getContent(),
        belt: hud.getBelt(),
      },
      world: this.world,
    })
  }

  private loadState() {
    const loadedGame = loadGame<GameState>('ds1')

    if (!loadedGame) {
      return generateInitialStructure()
    }

    return loadedGame
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
  scene: [MainScene, HUDScene],
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
          // applyPointerLock(game)
        },
      },
    })

    return game
  },
}
