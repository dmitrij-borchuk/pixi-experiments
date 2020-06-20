import * as PIXI from 'pixi.js'
import bunnyImg from '../../assets/bunny.png'
import wallImg from '../../assets/wall.png'
import { getRoom, IRoom, IPoint } from '../../utils/roomGenerator'

const isSamePoints = (p1: IPoint, p2: IPoint) => {
  return p1.x === p2.x && p1.y === p2.y
}

interface IRenderer {
  app: PIXI.Application
}
export const get = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new PIXI.Application()

  // load the texture we need
  app.loader
    .add('bunny', bunnyImg)
    .add('wall', wallImg)
    .load((loader, resources) => {
      const textureSize = 32
      const addRoom = (container: PIXI.Container, room: IRoom) => {
        for (let i = 0; i < room.width; i++) {
          if (!isSamePoints(room.enter, { x: i, y: 0 }) && !isSamePoints(room.exit, { x: i, y: 0 })) {
            const wall = new PIXI.Sprite(resources.wall?.texture)
            wall.x = i * textureSize
            wall.y = 0
            wall.width = textureSize
            wall.height = textureSize
            container.addChild(wall)
          }
          if (
            !isSamePoints(room.enter, { x: i, y: room.height - 1 }) &&
            !isSamePoints(room.exit, { x: i, y: room.height - 1 })
          ) {
            const wall = new PIXI.Sprite(resources.wall?.texture)
            wall.x = i * textureSize
            wall.y = (room.height - 1) * textureSize
            wall.width = textureSize
            wall.height = textureSize
            container.addChild(wall)
          }
        }
        for (let i = 1; i < room.height - 1; i++) {
          if (!isSamePoints(room.enter, { x: 0, y: i }) && !isSamePoints(room.exit, { x: 0, y: i })) {
            const wall = new PIXI.Sprite(resources.wall?.texture)
            wall.x = 0
            wall.y = i * textureSize
            wall.width = textureSize
            wall.height = textureSize
            container.addChild(wall)
          }
          if (
            !isSamePoints(room.enter, { x: room.width - 1, y: i }) &&
            !isSamePoints(room.exit, { x: room.width - 1, y: i })
          ) {
            const wall = new PIXI.Sprite(resources.wall?.texture)
            wall.x = (room.width - 1) * textureSize
            wall.y = i * textureSize
            wall.width = textureSize
            wall.height = textureSize
            container.addChild(wall)
          }
        }
      }
      const room = getRoom({
        minWidth: Math.floor(app.renderer.width / 2 / textureSize),
        maxWidth: Math.floor(app.renderer.width / textureSize),
        minHeight: Math.floor(app.renderer.height / 2 / textureSize),
        maxHeight: Math.floor(app.renderer.height / textureSize),
      })
      // This creates a texture from a 'bunny.png' image

      addRoom(app.stage, room)

      // Listen for frame updates
      app.ticker.add(() => {})
    })

  return {
    app,
  }
}
