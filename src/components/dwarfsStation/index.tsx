import React, { useEffect } from 'react'
import { app } from './app'

export const DwarfsStation = () => {
  useEffect(() => {
    const game = app.init()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
