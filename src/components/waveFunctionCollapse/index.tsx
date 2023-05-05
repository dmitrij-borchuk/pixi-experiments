import React, { useEffect } from 'react'
import { createApp } from './app'

export const WaveFunctionCollapse = () => {
  useEffect(() => {
    const game = createApp()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
