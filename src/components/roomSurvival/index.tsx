import React, { useCallback, useEffect, useState } from 'react'
import { Game } from './Game'
import { GameState } from './GameState'
import black from './assets/black.png'
import wallGrey from './assets/wallGrey.png'
import player from './assets/player.png'
import crate from './assets/crate.png'
import floor from './assets/floor.png'
import generator from './assets/generator.png'

const assetMap: Record<string, string> = {
  black,
  wallGrey,
  player,
  crate,
  floor,
  generator,
}

const config = {
  tileSize: 40,
}

export const RoomSurvival = () => {
  const [state, setState] = useState<GameState>()
  const [tick, setTick] = useState(0)
  console.log('=-= 🚀 ~ RoomSurvival ~ tick:', tick)
  const [game, setGame] = useState<Game>()
  const onStateChanged = useCallback((state: GameState) => {
    console.log('=-=', state)
    // setState(state)
    setTick((tick) => tick + 1)
  }, [])
  useEffect(() => {
    const game = new Game()
    setGame(game)
    setState(game.state)
    game.on(Game.EVENTS.stateChanged, onStateChanged)

    return () => {
      game.off(Game.EVENTS.stateChanged, onStateChanged)
      game.destroy()
    }
  }, [onStateChanged])
  const onClick = useCallback(
    (e) => {
      const x = Math.floor((e.clientX - e.currentTarget.offsetLeft) / config.tileSize)
      const y = Math.floor((e.clientY - e.currentTarget.offsetTop) / config.tileSize)
      game?.onClick(x, y)
    },
    [game]
  )

  if (!state) {
    return <div>loading</div>
  }

  // const floorTiles = getFloorTiles(state)
  // const wallTiles = getWallTiles(state)

  const {
    map: {
      room: { layers },
    },
  } = state

  return (
    <div style={{ position: 'relative', margin: '5px' }} onClick={onClick}>
      {/* {floorTiles}

      {wallTiles} */}

      {layers.map((layer) => getLayerItems(layer))}
    </div>
  )
}

function getDefaultStyles(x: number, y: number): React.CSSProperties {
  return {
    width: `${config.tileSize}px`,
    height: `${config.tileSize}px`,
    position: 'absolute',
    top: `${y * config.tileSize}px`,
    left: `${x * config.tileSize}px`,
  }
}
// function getFloorTiles(state: GameState) {
//   const {
//     map: {
//       roomSize,
//       room: { floorSprite },
//     },
//   } = state
//   const floorTiles = []

//   for (let x = 0; x < roomSize; x++) {
//     for (let y = 0; y < roomSize; y++) {
//       const style: React.CSSProperties = {
//         width: `${config.tileSize}px`,
//         height: `${config.tileSize}px`,
//         position: 'absolute',
//         top: `${y * config.tileSize}px`,
//         left: `${x * config.tileSize}px`,
//       }
//       const element = <img key={`wall${x}:${y}`} src={assetMap[floorSprite]} alt="" style={style} />
//       floorTiles.push(element)
//     }
//   }

//   return floorTiles
// }
// function getWallTiles(state: GameState) {
//   const {
//     map: {
//       roomSize,
//       room: { wallSprite },
//     },
//   } = state
//   const tiles = []

//   for (let x = 0; x < roomSize; x++) {
//     for (let y = 0; y < roomSize; y++) {
//       if (x === 0 || x === roomSize - 1 || y === 0 || y === roomSize - 1) {
//         if (x === Math.floor(roomSize / 2) || y === Math.floor(roomSize / 2)) {
//           continue
//         }
//         const style: React.CSSProperties = {
//           width: `${config.tileSize}px`,
//           height: `${config.tileSize}px`,
//           position: 'absolute',
//           top: `${y * config.tileSize}px`,
//           left: `${x * config.tileSize}px`,
//         }
//         const element = <img key={`${x}:${y}`} src={assetMap[wallSprite]} alt="" style={style} />
//         tiles.push(element)
//       }
//     }
//   }

//   return tiles
// }
function getLayerItems(layer: GameState['map']['room']['layers'][number]) {
  const { items, name } = layer
  return items.map((item) => {
    const styles = getDefaultStyles(item.x, item.y)

    return <img key={`${name}:${item.x}:${item.y}`} src={assetMap[item.sprite]} alt="" style={styles} />
  })
}
