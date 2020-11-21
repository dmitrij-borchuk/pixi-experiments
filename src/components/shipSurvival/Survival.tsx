import React, { useEffect } from 'react'
import { app } from './phaser'

export const Survival = () => {
  useEffect(() => {
    const game = app.init()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
