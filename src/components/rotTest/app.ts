import { MainScene } from './scenes/game'
import { Display, Map } from 'rot-js'
import { divideRoom, generateStation } from './generator'

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
  scene: [MainScene],
  render: {
    pixelArt: true,
  },
}

export const app = {
  init: () => {
    // const game = new Phaser.Game({
    //   ...config,
    //   callbacks: {
    //     ...config.callbacks,
    //     postBoot: () => {
    //       // applyPointerLock(game)
    //     },
    //   },
    // })

    // return game
    const display = new Display({
      width: 200,
      height: 100,
      fontSize: 8,
    })
    const container = display.getContainer()
    if (container) {
      document.body.appendChild(container)
    }

    // var digger = new Map.Cellular()
    // var digger = new Map.Digger(200, 100, {})
    const width = 200
    const height = 100
    // const wMin = width * 0.1
    // const wMax = width * 0.3
    // const hMin = height * 0.1
    // const hMax = height * 0.3
    // var digger = new Map.Uniform(width, height, {
    //   roomWidth: [4, 5],
    //   roomHeight: [4, 5],
    //   // roomWidth: [wMin, wMax],
    //   // roomHeight: [hMin, hMax],
    //   roomDugPercentage: 0.5,
    // })
    // const drawDoor = function (x: number, y: number) {
    //   display.draw(x, y, '', '', 'red')
    // }
    // const map: Record<string, string> = {}
    // digger.create((x, y, value) => {
    //   if (value) {
    //     return
    //   } /* do not store walls */

    //   var key = x + ',' + y
    //   map[key] = '.'
    // })
    // digger.create(display.DEBUG)
    // console.log('=-= map', map)

    // var rooms = digger.getRooms()
    // console.log('=-= rooms', rooms)
    // for (var i = 0; i < rooms.length; i++) {
    //   var room = rooms[i]

    //   room.getDoors(drawDoor)
    // }

    // for (var key in map) {
    //   var parts = key.split(',')
    //   var x = parseInt(parts[0])
    //   var y = parseInt(parts[1])
    //   display.draw(x, y, map[key], null, null)
    // }
    const [rooms, corridors] = generateStation(width, height, {
      corridorWidth: 3,
      minSize: 15,
    })
    // var roomDrawer = new Map.Arena(width, height)
    // roomDrawer.create(display.DEBUG)
    // const rooms = [room1, room2]
    console.log('=-= rooms', rooms)
    rooms.forEach((room) => {
      var roomDrawer = new Map.Arena(room.width, room.height)
      roomDrawer.create((x, y, wall) => {
        display.draw(room.x + x, room.y + y, wall ? '#' : '.', null, null)
      })
    })

    return {
      destroy: (d: boolean) => {
        if (container) {
          document.body.removeChild(container)
        }
      },
    }
  },
}
