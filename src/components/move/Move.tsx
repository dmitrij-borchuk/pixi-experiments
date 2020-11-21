import React, { useRef, useEffect, useCallback } from 'react'
import { getApp } from './pixi'
import { KeyboardHandler } from '../keyboardHandler/KeyboardHandler'

export const Move = () => {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = useCallback((e: KeyboardEvent) => {}, [])

  useEffect(() => {
    const app = getApp()
    ref.current?.appendChild(app.view)
    return () => {
      app.destroy()
    }
  }, [ref])

  return (
    <div ref={ref}>
      <KeyboardHandler onKeyDown={onKeyDown} />
    </div>
  )
}
