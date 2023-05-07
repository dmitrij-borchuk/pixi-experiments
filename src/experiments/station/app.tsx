import React, { useCallback, useEffect, useState } from 'react'
import { init } from './index'

export const Station = () => {
  const [app, setApp] = useState<ReturnType<typeof init>>()
  const [ui, setUi] = useState<UI>({
    hp: 1,
    oxygen: 1,
  })
  const [gameOver, setGameOver] = useState(false)
  const onDeath = useCallback(() => {
    setGameOver(true)
  }, [])
  const onUIChange = useCallback((data) => {
    setUi(data)
  }, [])

  useEffect(() => {
    const app = init()
    setApp(app)
    setTimeout(() => {
      app.load()
    }, 600)
    app.game.events.on('death', onDeath)
    app.game.events.on('ui-change', onUIChange)

    return () => {
      app.game.events.off('death', onDeath)
      app.game.events.off('ui-change', onUIChange)
      app.game.destroy(true)
    }
  }, [onDeath, onUIChange])

  const selectTool = useCallback(
    (e) => {
      app?.setTool(e.currentTarget.value)
    },
    [app]
  )

  return (
    <div>
      <div style={{ position: 'fixed', right: '100px' }}>
        <button onClick={() => app?.save()}>Save</button>
        <button onClick={() => app?.load()}>Load</button>
        <select onChange={selectTool}>
          <option value="">----</option>
          <option value="clear">Clear</option>
          <option value="Wall">Wall</option>
          <option value="Door">Door</option>
          <option value="Gas">Oxygen</option>
        </select>
      </div>

      <div style={{ position: 'fixed', bottom: '0', background: '#fff' }}>
        <div>HP: {ui.hp}</div>
        <div>Oxygen: {ui.oxygen}</div>
      </div>

      {gameOver && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', background: '#fff' }}>
          Game over. Load last save?
          <button
            onClick={() => {
              app?.load()
              setGameOver(false)
            }}
          >
            Yes
          </button>
        </div>
      )}
    </div>
  )
}

type UI = {
  hp: number
  oxygen: number
}
