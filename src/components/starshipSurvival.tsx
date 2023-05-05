import React, { useEffect } from 'react'
import { app } from '../starshipSurvival/app'

export const StarshipSurvival = () => {
  useEffect(() => {
    const game = app()
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div />
}
