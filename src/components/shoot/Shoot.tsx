import React, { useRef, useEffect, useCallback, useState } from 'react'
import { renderer } from './pixi'

export const Shoot = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [renderRes, setRenderRes] = useState<{
    app: PIXI.Application
    shoot: (x: number, y: number) => void
  }>()
  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (renderRes?.shoot) {
      const x = e.clientX - e.currentTarget.offsetLeft
      const y = e.clientY - e.currentTarget.offsetTop
      console.log('=-= e', x, y)
      renderRes?.shoot(x, y)
    }
  }, [])

  useEffect(() => {
    const renderRes = renderer()
    const { app } = renderRes
    setRenderRes(renderRes)
    ref.current?.appendChild(app.view)
    return () => {
      app.destroy()
    }
  }, [ref])

  return <div ref={ref} onClick={onClick} />
}
