import { Scene } from 'phaser'
import { BaseScene, Layer, GameEvent } from '../types'

export function initScenarioTools(scene: BaseScene) {
  function queryObject(layer: Layer, type: string) {
    const entities = Array.from(scene.map.layers[layer].values())

    return entities.find((item) => item.type === type)
  }
  function wait(fn: () => any, event: GameEvent) {
    return new Promise((resolve, rej) => {
      function step() {
        const result = fn()
        if ((Array.isArray(result) && result.length > 0) || !!result) {
          resolve(result)
          return true
        }

        return false
      }

      function onChange() {
        if (step()) {
          scene.events.off(event, onChange)
        }
      }

      if (!step()) {
        scene.events.on(event, onChange)
      }
    })
  }
  function showDialog(msg: string) {
    // TODO: onDismiss
    // console.log(`*** Message from the game ***`)
    // console.log(msg)
    // console.log(`*****************************`)
    alert(msg)
  }
  function showMessage(msg: string) {
    console.log(`*** Message from the game ***`)
    console.log(msg)
    console.log(`*****************************`)
  }

  return {
    queryObject,
    wait,
    showDialog,
    showMessage,
  }
}

export function launchScene(scene: Scene) {
  return new Promise<void>((res, rej) => {
    scene.scene.start(scene.scene.key)
    // scene.scene.start

    scene.events.once('create', res)

    setTimeout(rej, 20000)
  })
}
