import { SimpleMenuScene } from '../shared/SimpleMenu/SimpleMenu'
import { GameScene } from './Game'

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
  scene: [GameScene, SimpleMenuScene],
  render: {
    pixelArt: true,
  },
}

export const app = () => {
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
}
