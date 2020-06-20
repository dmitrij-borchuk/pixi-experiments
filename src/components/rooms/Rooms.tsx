import React, { useRef, useEffect } from 'react'
import { get } from './pixi'

export const Rooms = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { app } = get()
    ref.current?.appendChild(app.view)
    return () => {
      app.destroy()
    }
  }, [ref])

  return <div ref={ref}></div>
}
