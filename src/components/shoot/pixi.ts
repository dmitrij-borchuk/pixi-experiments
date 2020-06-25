import * as PIXI from 'pixi.js'
import bunnyImg from '../../assets/bunny.png'
import { IPoint } from '../../utils/roomGenerator'

const drawLine = (container: PIXI.Container, startPoint: IPoint, endPoint: IPoint) => {
  // Create a new Graphics object and add it to the scene
  let myGraph = new PIXI.Graphics()
  container.addChild(myGraph)

  // Move it to the beginning of the line
  myGraph.position.set(startPoint.x, startPoint.y)

  // Draw the line (endPoint should be relative to myGraph's position)
  myGraph.lineStyle(2, 0xff0000).moveTo(0, 0).lineTo(endPoint.x, endPoint.y)
}

export const renderer = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new PIXI.Application()

  // // The application will create a canvas element for you that you
  // // can then insert into the DOM
  // document.body.appendChild(app.view);

  // load the texture we need
  app.loader.add('bunny', bunnyImg).load((loader, resources) => {
    // This creates a texture from a 'bunny.png' image
    const bunny = new PIXI.Sprite(resources.bunny?.texture)

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2
    bunny.y = app.renderer.height / 2

    // Rotate around the center
    bunny.anchor.x = 0.5
    bunny.anchor.y = 0.5

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny)

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      bunny.rotation += 0.01
    })
  })

  return {
    app,
    shoot: (x: number, y: number) => {
      drawLine(app.stage, { x: app.renderer.width / 2, y: app.renderer.height / 2 }, { x, y })
    },
  }
}
