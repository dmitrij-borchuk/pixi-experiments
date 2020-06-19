import React, { useEffect, useCallback } from 'react'

interface IProps {
  onKeyDown?: (e: KeyboardEvent) => void
}
export const KeyboardHandler: React.FC<IProps> = ({ onKeyDown }) => {
  useEffect(() => {
    if (onKeyDown) {
      document.addEventListener('keydown', onKeyDown)
    }

    return () => {
      if (onKeyDown) {
        document.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [onKeyDown])

  return null
}
