import { Scene } from 'phaser'

export function launchScene(scene: Scene) {
  return new Promise<void>((res, rej) => {
    scene.scene.start(scene.scene.key)

    scene.events.once('create', res)

    setTimeout(rej, 20000)
  })
}
