import React, { useEffect } from 'react'
import { app } from './app'

export const RotTest = () => {
  useEffect(() => {
    const game = app.init()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
