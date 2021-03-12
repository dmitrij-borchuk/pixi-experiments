import React, { useEffect } from 'react'
import { app } from './app'

export const X2d = () => {
  useEffect(() => {
    const game = app.init()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
