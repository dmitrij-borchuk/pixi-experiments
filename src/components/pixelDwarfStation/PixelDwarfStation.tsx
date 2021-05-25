import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Game } from './game'
import { LogItem } from './logItem'

export const PixelDwarfStation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [log, setLog] = useState<LogItem[]>([])
  const [game, setGame] = useState<Game>()
  const createNewGame = useCallback(() => {
    if (canvasRef.current) {
      if (game) {
        game.destroy()
      }
      const g = new Game(canvasRef.current)
      setGame(g)
      g.addListener(Game.EVENT.LOG, (d) => {
        setLog((items) => [...items, d])
      })
    }
  }, [game])
  const onNewClick = useCallback(() => {
    createNewGame()
  }, [createNewGame])
  const onSaveClick = useCallback(() => {
    if (game) {
      const state = game.save()

      console.log('=-= state', state)
      localStorage.setItem('pdf.save', JSON.stringify(state))
    }
  }, [game])
  const onLoadClick = useCallback(() => {
    if (game) {
      const state = localStorage.getItem('pdf.save')
      if (state) {
        game.load(JSON.parse(state))
      }
    }
  }, [game])

  useEffect(() => {
    if (canvasRef.current) {
      createNewGame()
      return () => {
        if (game) {
          game.destroy()
          setGame(undefined)
        }
      }
    }
  }, [])

  return (
    <div>
      <div>
        <button onClick={onNewClick}>New</button>
        <button onClick={onSaveClick}>Save</button>
        <button onClick={onLoadClick}>Load</button>
      </div>
      <canvas ref={canvasRef} width="800" height="600" />
      <div>
        {log.map((d) => (
          <div>{d.message}</div>
        ))}
      </div>
    </div>
  )
}
