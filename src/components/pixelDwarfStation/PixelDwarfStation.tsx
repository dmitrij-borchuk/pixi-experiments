import React, { useCallback, useEffect, useRef, useState } from 'react'
import { generateSpaceStation } from '../../utils/stationGenerator'
import { Game } from './game'
import { LogItem } from './logItem'

export const PixelDwarfStation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [log, setLog] = useState<LogItem[]>([])
  const [game, setGame] = useState<Game>()
  const [noiseBorder, setNoiseBorder] = useState(0.5)
  // const [noise, setNoise] = useState<
  //   {
  //     x: number
  //     y: number
  //     v: number
  //   }[]
  // >([])
  const createNewGame = useCallback(() => {
    if (canvasRef.current) {
      if (game) {
        game.destroy()
      }
      const g = new Game(canvasRef.current)
      setGame(g)
      const { station } = generateSpaceStation(noiseBorder)
      g.load(station)

      g.addListener(Game.EVENT.LOG, (d) => {
        setLog((items) => [...items, d])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game])
  const onNewClick = useCallback(() => {
    createNewGame()
  }, [createNewGame])
  const generateNoise = useCallback(() => {
    // const { noise } = generateSpaceStation(noiseBorder)
    // setNoise(noise)
    // const generate = generator()
    // const scaleFactor = 10
    // const generated = []
    // for (let x = 0; x < 50; x++) {
    //   for (let y = 0; y < 50; y++) {
    //     generated.push({
    //       x,
    //       y,
    //       v: generate(x / scaleFactor, y / scaleFactor),
    //     })
    //   }
    // }
    // console.log('=-= generated', generated)
    // setNoise(generated)
  }, [])

  // const parseNoise = useCallback(
  //   (n: number) => {
  //     if (game) {
  //       const items = noise.filter(({ v }) => v > n)
  //       const state: GameState = {
  //         level: {
  //           mapHeight: 50,
  //           mapWidth: 50,
  //           tasksManager: {
  //             tasks: [],
  //           },
  //           mapObjects: items.map((i) => ({
  //             id: nanoid(),
  //             key: 'wall',
  //             x: i.x,
  //             y: i.y,
  //           })),
  //         },
  //       }
  //       game.load(state)
  //     }
  //   },
  //   [game, noise]
  // )
  const onSaveClick = useCallback(() => {
    if (game) {
      const state = game.save()

      // console.log('=-= state', state)
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
  const onNoiseChange = useCallback((e) => {
    setNoiseBorder(parseFloat(e.currentTarget.value))
  }, [])

  // useEffect(() => {
  //   parseNoise(noiseBorder)
  // }, [parseNoise, noiseBorder])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div>
        <div>
          <button onClick={() => generateNoise()}>New noise</button>
          <input type="number" step="0.1" value={noiseBorder} onChange={onNoiseChange} />
        </div>
        <button onClick={onNewClick}>New</button>
        <button onClick={onSaveClick}>Save</button>
        <button onClick={onLoadClick}>Load</button>
      </div>
      <canvas ref={canvasRef} width="800" height="600" tabIndex={0} />
      <div>
        {log.map((d) => (
          <div>{d.message}</div>
        ))}
      </div>
    </div>
  )
}
