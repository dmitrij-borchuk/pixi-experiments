import Phaser, { Scene } from 'phaser'
import {
  applyCameraToSprite,
  applyCollider,
  applyDynamicTileBackground,
  applyMovement,
  getFirstHit,
  getTileFomCoords,
  loadGame,
  preloadAssets,
  saveGame,
} from '../../utils/gameUtils'
import { generateInitialStructure } from './generator'
import { getRandom } from '../../utils/random'
import { Player } from './Player'
import { name2texture, TEXTURES } from './textures'
import { objectsConfig } from './objectsConfig'
import { HUDScene } from './HUD'
import { GameState, StuffObject, ObjectConfig, ObjectInstanceDescriptor, PlayerState, ConstructedObject } from './types'
import { SCENES } from './constants'

const tileSize = 120
const maxDistanceToInteract = tileSize * 2

const keySeparator = '|'
function getMapKey(x: number, y: number) {
  return `${x}${keySeparator}${y}`
}
function parseMapKey(key: string) {
  return key.split(keySeparator).map((str) => parseInt(str, 10))
}

function isInteractive(constructorConfig: ObjectConfig) {
  return constructorConfig.isContainer
}

export function addBuildPreview(scene: MainScene) {
  let buildPreview: Phaser.GameObjects.Container | null = null
  let img: Phaser.GameObjects.Image | null = null

  scene.events.on('update', function (time: number, delta: number) {
    console.log('=-= onUpdate')
    if (buildPreview && img) {
      scene.game.input.mousePointer.updateWorldPoint(scene.cameras.main)
      const { worldX, worldY } = scene.game.input.mousePointer
      const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
      buildPreview.setPosition(x * tileSize, y * tileSize)
      if (!scene.map[getMapKey(x, y)] && scene.isReachableDistance(worldX, worldY)) {
        img.setTint(0x55ff55, 0x55ff55, 0x55ff55, 0x55ff55)
      } else {
        img.setTint(0xff5555, 0xff5555, 0xff5555, 0xff5555)
      }
    }
  })
  return {
    updatePreview: (constructorConfig?: ObjectConfig) => {
      if (buildPreview) {
        buildPreview.destroy()
      }
      buildPreview = null
      img = null

      if (!constructorConfig) {
        return
      }

      buildPreview = scene.add.container(0, 0)
      buildPreview.setSize(tileSize, tileSize)

      img = scene.add.image(0, 0, constructorConfig.view)
      img.setDisplaySize(tileSize, tileSize)
      img.setAlpha(0.5)
      buildPreview.add(img)
    },
  }
}

// TODO: disable context menu
export class MainScene extends Scene {
  public player!: Player
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []
  private lyingObjects!: Phaser.GameObjects.Group
  private constructedObjects!: Phaser.Physics.Arcade.StaticGroup
  private currentTool?: ObjectInstanceDescriptor
  private world!: GameState['world']
  public map: GameState['map'] = {}
  private buildPreview!: ReturnType<typeof addBuildPreview>

  constructor() {
    super(SCENES.MAIN)
  }
  preload() {
    preloadAssets(this, [
      {
        type: 'image',
        name: TEXTURES.stoneFloor,
        data: name2texture.stoneFloor,
      },
      {
        type: 'base64',
        name: TEXTURES.player,
        data: name2texture.player,
      },
      {
        type: 'base64',
        name: TEXTURES.frame,
        data: name2texture.frame,
      },
      {
        type: 'base64',
        name: TEXTURES.ironPlate,
        data: name2texture.ironPlate,
      },
      {
        type: 'base64',
        name: TEXTURES.crate,
        data: name2texture.crate,
      },
    ])
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
    this.onUpdateListeners.push(applyDynamicTileBackground(this, TEXTURES.stoneFloor))

    this.addPlayer(initialData.player)

    applyCameraToSprite(this, this.player)

    this.makeInitialStructure(initialData.map)

    this.addEvents()

    this.buildPreview = addBuildPreview(this)
  }
  update(time: number, delta: number) {
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })
  }

  private onBeltSlotClick(descriptor?: ObjectInstanceDescriptor) {
    this.currentTool = undefined
    if (descriptor) {
      this.currentTool = descriptor
    }

    const constructorConfig = descriptor && objectsConfig[descriptor.id]

    this.buildPreview.updatePreview(constructorConfig)
  }

  private addPlayer(player: PlayerState) {
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
        const [x, y] = parseMapKey(key)
        if (config.kind === 'stuff') {
          this.placeObject(constructorConfig, config, x, y)
        } else {
          this.placeConstruction(constructorConfig, config, x, y)
        }
      }
    })
  }

  private addEvents() {
    const onPointerDownBinded = this.onPointerDown.bind(this)
    this.input.on('pointerdown', onPointerDownBinded)

    // HUD events
    const hud = this.scene.get('HUDScene') as HUDScene
    hud.events.on('beltSlotClick', this.onBeltSlotClick.bind(this))
    hud.events.on('containerOpened', () => {
      this.input.off('pointerdown', onPointerDownBinded)
    })
    hud.events.on('containerClosed', () => {
      this.input.on('pointerdown', onPointerDownBinded)
    })

    this.input.keyboard.on('keyup_E', this.onUsePressed.bind(this))
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    // `pointer.button` = 0 when it is a left mouse click
    if (this.currentTool && pointer.button === 0 && this.isReachableDistance(pointer.worldX, pointer.worldY)) {
      const constructorConfig = objectsConfig[this.currentTool.id]

      if (constructorConfig && constructorConfig.isBuildable) {
        const { worldX, worldY } = pointer
        const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
        this.buildObject(constructorConfig, x, y)
      }
    }
  }

  private onUsePressed(event: KeyboardEvent) {
    if (!this.isReachableDistance(this.input.activePointer.worldX, this.input.activePointer.worldY)) {
      return
    }

    this.useLyingObject(this.input.activePointer)
    const hit = getFirstHit(this, this.input.activePointer, this.constructedObjects.getChildren())

    if (hit) {
      const id = hit.getData('id')
      const config: ConstructedObject = hit.getData('config')
      const constructorConfig = objectsConfig[id]

      if (!constructorConfig) {
        return
      }

      if (constructorConfig.isContainer) {
        const hud = this.scene.get('HUDScene') as HUDScene
        hud.showContainer(config.data.content)
      }
    }
  }

  private buildObject(constructorConfig: ObjectConfig, x: number, y: number) {
    if (!this.map[getMapKey(x, y)]) {
      const data: ConstructedObject = {
        kind: 'construction',
        angle: 0,
        health: constructorConfig.maxHealth || 0,
        id: constructorConfig.id,
        step: 0,
      }
      this.map[getMapKey(x, y)] = data
      this.placeConstruction(constructorConfig, data, x, y)
      this.saveState()
    }
  }

  private placeConstruction(constructorConfig: ObjectConfig, config: ConstructedObject, x: number, y: number) {
    const obj: Phaser.Physics.Arcade.Image = this.constructedObjects.create(
      x * tileSize,
      y * tileSize,
      constructorConfig.view
    )
    obj.setDisplaySize(tileSize, tileSize)
    obj.setData('id', constructorConfig.id)
    obj.setData('step', 0)
    obj.setData('config', config)
    obj.refreshBody()
    if (isInteractive(constructorConfig)) {
      obj.setInteractive()
    }
    applyCollider(this, this.player, obj)
  }

  private placeObject(constructorConfig: ObjectConfig, config: StuffObject, x: number, y: number) {
    const { amount, id } = config
    const size = tileSize / 2
    const obj: Phaser.GameObjects.Image = this.lyingObjects.create(x * tileSize, y * tileSize, constructorConfig.view)
    obj.setDisplaySize(size, size)
    obj.setAngle(getRandom(360))
    obj.setData('amount', amount)
    obj.setData('id', id)
    obj.setInteractive()
  }

  public isReachableDistance(x: number, y: number) {
    const distance = Phaser.Math.Distance.BetweenPoints(this.player.body, { x, y })
    return distance <= maxDistanceToInteract
  }

  private useLyingObject(pointer: Phaser.Input.Pointer) {
    if (this.isReachableDistance(pointer.worldX, pointer.worldY)) {
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
        firstHit.destroy()
        const [x, y] = getTileFomCoords(tileSize, tileSize, firstHit.x, firstHit.y)
        delete this.map[getMapKey(x, y)]
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
      // debug: true,
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
