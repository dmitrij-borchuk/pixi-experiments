import { Scene } from 'phaser'
import player from '../../assets/sprites/player10.png'
import wall from '../../assets/sprites/wall.png'
import door from '../../assets/sprites/door.png'
import doorOpen from '../../assets/sprites/doorOpen.png'

export class LoadingScene extends Scene {
  constructor() {
    super('loading-scene')
  }
  create(): void {
    // Need to wait base64 image to be loaded
    setTimeout(() => {
      // console.log('Loading scene was created')
      this.scene.start('main')
    }, 300)
  }
  preload(): void {
    this.textures.addBase64('player', player)
    this.textures.addBase64('wall', wall)
    this.textures.addBase64('door', door)
    this.textures.addBase64('doorOpen', doorOpen)
  }
}
