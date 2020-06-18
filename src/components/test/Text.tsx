import React, { useRef, useEffect } from 'react'
import { getApp } from './test.pixi'

export const Test = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const app = getApp()
    ref.current?.appendChild(app.view)
    return () => {
      app.destroy()
    }
  }, [ref])

  return <div ref={ref}>Test</div>
}
