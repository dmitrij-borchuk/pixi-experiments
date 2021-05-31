import { Scene } from 'phaser'

// const tileSize = 120
// const maxDistanceToInteract = tileSize * 2

// const keySeparator = '|'
// function getMapKey(x: number, y: number) {
//   return `${x}${keySeparator}${y}`
// }
// function parseMapKey(key: string) {
//   return key.split(keySeparator).map((str) => parseInt(str, 10))
// }

export class MainScene extends Scene {
  constructor() {
    super({ key: 'main', active: false })
  }
  preload() {}
  create() {}
  update(time: number, delta: number) {}
}
