import { MainScene } from './game'
import { HUDScene } from './HUD'
import { MenuScene } from './menu'

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
  scene: [MenuScene, MainScene, HUDScene],
  render: {
    pixelArt: true,
  },
  backgroundColor: 0x04002f,
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
