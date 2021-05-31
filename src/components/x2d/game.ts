import { Scene } from 'phaser'
import {
  applyCameraToSprite,
  // applyCollider,
  applyDynamicTileBackground,
  // applyMovement,
  // getFirstHit,
  // getTileFomCoords,
  // loadGame,
  preloadAssets,
  // saveGame,
} from '../../utils/gameUtils'
// import { generateInitialStructure } from './generator'
// import { getRandom } from '../../utils/random'
// import { Player } from './Player'
// import { name2texture, TEXTURES } from './textures'
// import { objectsConfig } from './objectsConfig'
// import { HUDScene } from './HUD'
import { Ship } from './ship'
import space from './assets/space.gif'
// import { Bullet } from './bullet'
// import {
//   GameState,
//   StuffObject,
//   ObjectConfig,
//   ObjectInstanceDescriptor,
//   PlayerState,
//   ConstructedObject,
//   ConstructionObjectConfig,
//   StuffObjectConfig,
//   BaseScene,
// } from './types'
// import { SCENES } from './constants'

// const tileSize = 120
// const maxDistanceToInteract = tileSize * 2

// const keySeparator = '|'
// function getMapKey(x: number, y: number) {
//   return `${x}${keySeparator}${y}`
// }
// function parseMapKey(key: string) {
//   return key.split(keySeparator).map((str) => parseInt(str, 10))
// }

// function isInteractive(constructorConfig: ObjectConfig) {
//   return constructorConfig.isContainer
// }

// export function addBuildPreview(scene: MainScene) {
//   let buildPreview: Phaser.GameObjects.Container | null = null
//   let img: Phaser.GameObjects.Image | null = null
//   let text: Phaser.GameObjects.Text | null = null
//   let currentConfig: ConstructionObjectConfig | undefined
//   let currentVariant: string

//   scene.events.on('update', function (time: number, delta: number) {
//     if (buildPreview && img) {
//       scene.game.input.mousePointer.updateWorldPoint(scene.cameras.main)
//       const { worldX, worldY } = scene.game.input.mousePointer
//       const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)
//       buildPreview.setPosition(x * tileSize, y * tileSize)
//       if (!scene.map.layers.walls.has(getMapKey(x, y)) && scene.isReachableDistance(worldX, worldY)) {
//         img.setTint(0x55ff55, 0x55ff55, 0x55ff55, 0x55ff55)
//       } else {
//         img.setTint(0xff5555, 0xff5555, 0xff5555, 0xff5555)
//       }
//     }
//   })

//   function onWheel(pointer: { movementX: any; movementY: any }, objects: any[], dx: number, dy: number, dz: number) {
//     if (currentConfig?.variants) {
//       const keys = Object.keys(currentConfig.variants)
//       const index = keys.indexOf(currentVariant)

//       if (index === -1) {
//         return
//       }

//       const newIndex = dy > 0 ? index + 1 : index - 1
//       if (newIndex < 0) {
//         currentVariant = keys[keys.length - 1]
//       } else if (newIndex >= keys.length) {
//         currentVariant = keys[0]
//       } else {
//         currentVariant = keys[newIndex]
//       }

//       text?.setText(currentVariant)
//     }
//   }

//   return {
//     updatePreview: (constructorConfig?: ConstructionObjectConfig | StuffObjectConfig) => {
//       buildPreview?.destroy()
//       buildPreview = null
//       img?.destroy()
//       img = null
//       text?.destroy()
//       text = null
//       currentConfig = constructorConfig?.isBuildable ? constructorConfig : undefined
//       scene.input.off('wheel', onWheel)

//       if (!constructorConfig || !constructorConfig.isBuildable) {
//         return
//       }
//       scene.input.on('wheel', onWheel)

//       buildPreview = scene.add.container(0, 0)
//       buildPreview.setSize(tileSize, tileSize)

//       img = scene.add.image(0, 0, constructorConfig.view)
//       img.setDisplaySize(tileSize, tileSize)
//       img.setAlpha(0.5)
//       buildPreview.add(img)

//       if (constructorConfig.variants) {
//         const [key] = Object.keys(constructorConfig.variants)
//         if (key) {
//           const offset = tileSize / 2
//           // TODO: add number
//           text = scene.add.text(-offset, -offset, key)
//           text.setOrigin(0, 1)
//           text.setFontSize(60)
//           text.setShadow(0, 0, '#000', 20, false, true)
//           buildPreview.add(text)

//           currentVariant = key
//         }
//       }
//     },
//     getVariant: () => currentVariant,
//   }
// }

// TODO: disable context menu
export class MainScene extends Scene {
  // public player!: Player
  private onUpdateListeners: ((time: number, delta: number) => void)[] = []
  // private lyingObjects!: Phaser.GameObjects.Group
  // private constructedObjects!: Phaser.Physics.Arcade.StaticGroup
  // private currentTool?: ObjectInstanceDescriptor
  // private world!: GameState['world']
  private ship!: Ship
  // public map: GameState['map'] = {
  //   layers: {
  //     floor: new Map(),
  //     walls: new Map(),
  //     pipes: new Map(),
  //     cables: new Map(),
  //     stuff: new Map(),
  //   },
  // }
  // private gameObjectMap: Map<string, Phaser.Physics.Arcade.Image> = new Map()
  // private buildPreview!: ReturnType<typeof addBuildPreview>

  constructor() {
    super({ key: 'main', active: false })
  }
  preload() {
    preloadAssets(this, [
      {
        type: 'image',
        name: 'space',
        data: space,
      },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.player,
      //       data: name2texture.player,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.frame,
      //       data: name2texture.frame,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.ironPlate,
      //       data: name2texture.ironPlate,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.crate,
      //       data: name2texture.crate,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.ironFloor,
      //       data: name2texture.ironFloor,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.ironWall,
      //       data: name2texture.ironWall,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.solarPanel,
      //       data: name2texture.solarPanel,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.solarPanelWithoutGlass,
      //       data: name2texture.solarPanelWithoutGlass,
      //     },
      //     {
      //       type: 'base64',
      //       name: TEXTURES.glass,
      //       data: name2texture.glass,
      //     },
    ])
  }
  create() {
    // const textObj = this.add.text(200, 200, 'Test text', {
    //   fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    // })
    //   this.lyingObjects = new Phaser.GameObjects.Group(this)
    //   this.constructedObjects = this.physics.add.staticGroup()

    // Background
    this.onUpdateListeners.push(applyDynamicTileBackground(this, 'space'))

    this.ship = new Ship(this)
    this.ship.create()
    applyCameraToSprite(this, this.ship.polygon, 1)
    //   this.buildPreview = addBuildPreview(this)

    //   this.scene.launch(SCENES.HUD)
  }
  update(time: number, delta: number) {
    this.ship.update(time, delta)
    this.onUpdateListeners.forEach((cb) => {
      cb(time, delta)
    })
  }

  // public applyWorld(world: GameState) {
  //   // const initialData = this.loadState()
  //   const initialData = world
  //   this.world = initialData.world
  //   this.map = initialData.map
  //   const worldSize = initialData.world

  //   // Set world bounworldds
  //   this.physics..setBounds(
  //     worldSize.x * tileSize,
  //     worldSize.y * tileSize,
  //     worldSize.w * tileSize,
  //     worldSize.h * tileSize
  //   )

  //   this.addPlayer(initialData.player)
  // applyCameraToSprite(this, this.player)

  //   this.makeInitialStructure(initialData.map)

  //   this.addEvents()
  // }

  // private onBeltSlotClick(descriptor?: ObjectInstanceDescriptor) {
  //   this.currentTool = undefined
  //   if (descriptor) {
  //     this.currentTool = descriptor
  //   }

  //   const constructorConfig = descriptor && objectsConfig[descriptor.type]

  //   this.buildPreview.updatePreview(constructorConfig)
  // }

  // private addPlayer(player: PlayerState) {
  //   const { position, backpack, belt } = player
  //   const [x, y] = position
  //   const scale = 0.5
  //   const playerGroup = this.physics.add.group({ classType: Player, runChildUpdate: true })
  //   // TODO: probably `TEXTURES.player` should be moved to the `Player` class
  //   const playerInstance = playerGroup.get(x * tileSize, y * tileSize, TEXTURES.player) as Player
  //   playerInstance
  //     .setDisplaySize(tileSize * scale, tileSize * scale)
  //     .setCollideWorldBounds(true)
  //     .setDrag(3000)
  //     .setDepth(10)
  //   this.player = playerInstance

  //   backpack.forEach((item) => playerInstance.addToContainer(item))
  //   const hud = this.scene.get('HUDScene') as HUDScene
  //   hud.setBelt(belt)

  //   const { onUpdate } = applyMovement(this, this.player)
  //   this.onUpdateListeners.push(onUpdate)
  // }

  // private makeInitialStructure(map: GameState['map']) {
  //   map.layers.walls.forEach((config, key) => {
  //     const constructorConfig = objectsConfig[config.type]
  //     if (constructorConfig) {
  //       const [x, y] = parseMapKey(key)
  //       if (config.kind === 'stuff') {
  //         this.placeObject(constructorConfig, config, x, y)
  //       } else if (constructorConfig.isBuildable) {
  //         this.placeConstruction(constructorConfig, config, x, y)
  //       }
  //     }
  //   })
  // }

  // private addEvents() {
  //   const onPointerDownBinded = this.onPointerDown.bind(this)
  //   this.input.on('pointerdown', onPointerDownBinded)

  //   // HUD events
  //   const hud = this.scene.get('HUDScene') as HUDScene
  //   hud.events.on('beltSlotClick', this.onBeltSlotClick.bind(this))
  //   hud.events.on('containerOpened', () => {
  //     this.input.off('pointerdown', onPointerDownBinded)
  //   })
  //   hud.events.on('containerClosed', () => {
  //     this.input.on('pointerdown', onPointerDownBinded)
  //   })

  //   this.input.keyboard.on('keyup_E', this.onUsePressed.bind(this))
  // }

  // private onPointerDown(pointer: Phaser.Input.Pointer) {
  //   // `pointer.button` = 0 when it is a left mouse click
  //   if (this.currentTool && pointer.button === 0 && this.isReachableDistance(pointer.worldX, pointer.worldY)) {
  //     const toolConfig = objectsConfig[this.currentTool.type]

  //     if (!toolConfig) {
  //       return
  //     }

  //     const { worldX, worldY } = pointer
  //     const [x, y] = getTileFomCoords(tileSize, tileSize, worldX, worldY)

  //     if (toolConfig.isBuildable) {
  //       return this.buildObject(toolConfig, x, y)
  //     }

  //     const item = this.map.layers.walls.get(getMapKey(x, y))
  //     if (item) {
  //       const itemConstructorConfig = objectsConfig[item.type]
  //       if (item.kind !== 'construction' || !itemConstructorConfig.isBuildable) {
  //         return
  //       }
  //       const { variant, step } = item
  //       const { variants } = itemConstructorConfig

  //       if (!variants) {
  //         return
  //       }

  //       const nextStep = variants[variant].buildProps.steps[step + 1]

  //       if (!nextStep) {
  //         return
  //       }

  //       const neededIngredient = nextStep.toMake?.ingredients.find((ing) => ing.name === toolConfig.id)
  //       const hasIngredient = item.ingredients.find((ing) => ing.name === toolConfig.id)

  //       if (!neededIngredient) {
  //         return
  //       }

  //       const needAmount = neededIngredient.amount - (hasIngredient?.amount || 0)
  //       if (this.currentTool.amount >= needAmount) {
  //         item.step = step + 1

  //         // TODO: fix `as Phaser.Physics.Arcade.Image`
  //         const hit = this.gameObjectMap.get(getMapKey(x, y))

  //         // Update data
  //         hit?.setData('step', item.step)
  //         hit?.setData('built', true)
  //         hit?.setTexture(nextStep.view)
  //         hit?.setDisplaySize(tileSize, tileSize)

  //         this.saveState()

  //         if (!variants[variant].buildProps.steps[item.step + 1]) {
  //           this.events.emit('objectBuilt.walls', item)
  //         }

  //         return
  //       }

  //       // TODO: need more resources
  //     }
  //   }
  // }

  // private onUsePressed(event: KeyboardEvent) {
  //   if (!this.isReachableDistance(this.input.activePointer.worldX, this.input.activePointer.worldY)) {
  //     return
  //   }

  //   this.useLyingObject(this.input.activePointer)
  //   const hit = getFirstHit(this, this.input.activePointer, this.constructedObjects.getChildren())

  //   if (hit) {
  //     const id = hit.getData('id')
  //     const config: ConstructedObject = hit.getData('config')
  //     const constructorConfig = objectsConfig[id]

  //     if (!constructorConfig) {
  //       return
  //     }

  //     if (constructorConfig.isContainer) {
  //       const hud = this.scene.get('HUDScene') as HUDScene
  //       hud.showContainer(config.data.content)
  //     }
  //   }
  // }

  // private buildObject(constructorConfig: ConstructionObjectConfig, x: number, y: number) {
  //   const key = getMapKey(x, y)
  //   if (!this.map.layers.walls.has(key)) {
  //     const data: ConstructedObject = {
  //       kind: 'construction',
  //       angle: 0,
  //       health: constructorConfig.maxHealth || 0,
  //       type: constructorConfig.id,
  //       step: 0,
  //       variant: this.buildPreview.getVariant(),
  //       ingredients: [],
  //     }
  //     this.map.layers.walls.set(key, data)
  //     this.events.emit('placedObject.walls', data)
  //     this.placeConstruction(constructorConfig, data, x, y)
  //     this.saveState()
  //   }
  // }

  // private placeConstruction(
  //   constructorConfig: ConstructionObjectConfig,
  //   config: ConstructedObject,
  //   x: number,
  //   y: number
  // ) {
  //   const { variant, step } = config
  //   const { isSolid, steps } = constructorConfig.variants[variant].buildProps
  //   const obj: Phaser.Physics.Arcade.Image = this.constructedObjects.create(
  //     x * tileSize,
  //     y * tileSize,
  //     steps[step].view
  //   )
  //   obj.setDisplaySize(tileSize, tileSize)
  //   obj.setData('id', constructorConfig.id)
  //   obj.setData('step', step)
  //   obj.setData('config', config)
  //   obj.refreshBody()
  //   // if (isInteractive(constructorConfig)) {
  //   // }
  //   obj.setInteractive()
  //   if (isSolid) {
  //     applyCollider(this, this.player, obj)
  //   }

  //   const key = getMapKey(x, y)
  //   this.gameObjectMap.set(key, obj)
  // }

  // private placeObject(constructorConfig: ObjectConfig, config: StuffObject, x: number, y: number) {
  //   const { amount, type } = config
  //   const size = tileSize / 2
  //   const obj: Phaser.GameObjects.Image = this.lyingObjects.create(x * tileSize, y * tileSize, constructorConfig.view)
  //   obj.setDisplaySize(size, size)
  //   obj.setAngle(getRandom(360))
  //   obj.setData('amount', amount)
  //   obj.setData('id', type)
  //   obj.setInteractive()
  // }

  // public isReachableDistance(x: number, y: number) {
  //   const distance = Phaser.Math.Distance.BetweenPoints(this.player.body, { x, y })
  //   return distance <= maxDistanceToInteract
  // }

  // private useLyingObject(pointer: Phaser.Input.Pointer) {
  //   if (this.isReachableDistance(pointer.worldX, pointer.worldY)) {
  //     const [firstHit] = this.input.manager.hitTest(
  //       pointer,
  //       this.lyingObjects.getChildren(),
  //       this.cameras.main
  //     ) as Phaser.GameObjects.Image[]

  //     if (firstHit) {
  //       const obj = {
  //         type: firstHit.getData('id'),
  //         amount: firstHit.getData('amount'),
  //       }
  //       this.player.addToContainer(obj)
  //       // TODO: it could be animated with flying to player and scaling to 0
  //       firstHit.destroy()
  //       const [x, y] = getTileFomCoords(tileSize, tileSize, firstHit.x, firstHit.y)
  //       this.map.layers.walls.delete(getMapKey(x, y))
  //     }
  //   }
  // }

  // private saveState() {
  //   const hud = this.scene.get('HUDScene') as HUDScene
  //   const [x, y] = getTileFomCoords(tileSize, tileSize, this.player.body.x, this.player.body.y)
  //   saveGame<GameState>('ds1', {
  //     map: this.map,
  //     player: {
  //       position: [x, y],
  //       backpack: this.player.getContent(),
  //       belt: hud.getBelt(),
  //     },
  //     world: this.world,
  //   })
  // }

  // private loadState() {
  //   const loadedGame = loadGame<GameState>('ds1')

  //   if (!loadedGame) {
  //     return generateInitialStructure()
  //   }

  //   return loadedGame
  // }
}
