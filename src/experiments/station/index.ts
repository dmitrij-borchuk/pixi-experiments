import { Game, Types } from 'phaser'
import { LoadingScene, Main } from './scenes'

export function init() {
  const gameConfig: Types.Core.GameConfig = {
    title: 'Phaser game tutorial',
    type: Phaser.WEBGL,
    parent: 'game',
    backgroundColor: '#351f1b',
    scale: {
      mode: Phaser.Scale.ScaleModes.NONE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    render: {
      antialiasGL: false,
      pixelArt: true,
    },
    callbacks: {
      postBoot: () => {
        sizeChanged()
      },
    },
    canvasStyle: `display: block; width: 100%; height: 100%;`,
    autoFocus: true,
    audio: {
      disableWebAudio: false,
    },
    scene: [LoadingScene, Main],
  }
  const game = new Game(gameConfig)

  const sizeChanged = () => {
    if (game.isBooted) {
      setTimeout(() => {
        game.scale.resize(window.innerWidth, window.innerHeight)
        game.canvas.setAttribute(
          'style',
          `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`
        )
      }, 100)
    }
  }
  window.onresize = () => sizeChanged()

  return {
    game,
    setTool: (tool: string) => {
      const scene = game.scene.getScene('main') as Main
      scene.setTool(tool)
    },
    save: () => {
      const mainScene = game.scene.getScene('main') as Main
      const state = mainScene.getState()

      localStorage.setItem('build_save', JSON.stringify(state))
    },
    load: () => {
      const state = localStorage.getItem('build_save')
      if (state) {
        const mainScene = game.scene.getScene('main') as Main
        mainScene.setState(JSON.parse(state))
      }
    },
  }
}
