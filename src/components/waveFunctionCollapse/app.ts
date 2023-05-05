import * as PIXI from 'pixi.js'
import { initWfcAlpha } from '../../waveFunctionCollapse'
import { WfcAlpha } from '../../waveFunctionCollapse/wfcAlpha'
import { makeDeepTiles } from '../../waveFunctionCollapse/wfcAlphaTools'
// import { init2 } from '../../waveFunctionCollapse'

export function createApp() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xccccff,
    resolution: window.devicePixelRatio,
  })

  document.body.appendChild(app.view)
  // const container = new PIXI.Container()

  // app.stage.addChild(container)

  // // Create a new texture
  // const texture = PIXI.Texture.from('https://pixijs.io/examples/examples/assets/bunny.png')

  // // Create a 5x5 grid of bunnies
  // for (let i = 0; i < 25; i++) {
  //   const bunny = new PIXI.Sprite(texture)
  //   bunny.anchor.set(0.5)
  //   bunny.x = (i % 5) * 40
  //   bunny.y = Math.floor(i / 5) * 40
  //   container.addChild(bunny)
  // }

  // // Move container to the center
  // container.x = app.screen.width / 2
  // container.y = app.screen.height / 2

  // // Center bunny sprite in local container coordinates
  // container.pivot.x = container.width / 2
  // container.pivot.y = container.height / 2

  // Listen for animate update
  app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta
  })

  const result = initWfc()
  console.log('=-= result', result)

  const graphics = new PIXI.Graphics()

  const tile2color: Record<string, number> = {
    // l: 0x00ff00,
    // 'l-1': 0x00ff00,
    // 'l-2': 0x00ff00,
    // 'l-3': 0x00ff00,
    // c: 0xffff00,
    // w: 0x0000ff,
    // 'w-1': 0x0000ff,
    // 'w-2': 0x0000ff,
    // 'w-3': 0x0000ff,
    corridor: 0x00ff00,
    corner: 0x0000ff,
    wall: 0xcccccc,
  }
  const tileSize = 50
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].length; j++) {
      const tile = result[i][j][0]
      graphics.beginFill(tile2color[tile] || 0xffffff)
      graphics.drawRect(i * tileSize, j * tileSize, tileSize - 5, tileSize - 5)
      graphics.endFill()
    }
  }

  app.stage.addChild(graphics)

  return app
}

function initWfc() {
  const wfc = new WfcAlpha(
    {
      corridor: {
        top: ['corridor', 'corner'],
        right: ['wall'],
        left: ['wall'],
        bottom: ['corridor', 'corner'],
      },
      corner: {
        top: ['wall'],
        right: ['wall'],
        left: ['corridor'],
        bottom: ['corridor'],
      },
      wall: {
        top: ['corridor', 'corner', 'wall'],
        right: ['corridor', 'corner', 'wall'],
        left: ['corridor', 'corner', 'wall'],
        bottom: ['corridor', 'corner', 'wall'],
      },
      // ...makeDeepTiles(
      //   'l',
      //   {
      //     top: ['l', 'c'],
      //     right: ['l', 'c'],
      //     left: ['l', 'c'],
      //     bottom: ['l', 'c'],
      //   },
      //   4
      // ),
      // l: {
      //   top: ['l', 'c'],
      //   right: ['l', 'c'],
      //   left: ['l', 'c'],
      //   bottom: ['l', 'c'],
      // },
      // c: {
      //   top: ['l', 'c', 'w'],
      //   right: ['l', 'c', 'w'],
      //   left: ['l', 'c', 'w'],
      //   bottom: ['l', 'c', 'w'],
      // },
      // ...makeDeepTiles(
      //   'w',
      //   {
      //     top: ['c', 'w'],
      //     right: ['c', 'w'],
      //     left: ['c', 'w'],
      //     bottom: ['c', 'w'],
      //   },
      //   3
      // ),
    },
    10,
    10
    // {
    //   onStep: () =>
    // }
  )

  wfc.calculate()

  return wfc.getGrid()
}
