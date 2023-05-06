import React, { useCallback, useEffect, useState } from 'react'
import { init } from './index'

export const Station = () => {
  const [game, setGame] = useState<any>()
  useEffect(() => {
    const game = init()
    setGame(game)
    setTimeout(() => {
      game.load()
    }, 600)

    return () => {
      game.game.destroy(true)
    }
  }, [])

  const selectTool = useCallback(
    (e) => {
      game.setTool(e.currentTarget.value)
    },
    [game]
  )

  return (
    <div>
      <div style={{ position: 'fixed', right: '100px' }}>
        <button onClick={() => game.save()}>Save</button>
        <button onClick={() => game.load()}>Load</button>
        <select onChange={selectTool}>
          <option value="">----</option>
          <option value="wall">Wall</option>
        </select>
      </div>
    </div>
  )
}
