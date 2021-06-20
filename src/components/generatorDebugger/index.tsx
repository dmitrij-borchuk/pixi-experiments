import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Drawer } from './drawer'
import { GeneratorManager } from './generatorManager'

export const GeneratorDebugger = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawer, setDrawer] = useState<Drawer>()
  const [generatorManager, setGeneratorManager] = useState<GeneratorManager>()
  const onNewHull = useCallback(() => {
    if (generatorManager) {
      const hull = generatorManager.generateHull()
      drawer?.setState(hull, true)
    }
  }, [drawer, generatorManager])
  const addRooms = useCallback(() => {
    if (generatorManager) {
      try {
        const {
          meta: { innerBlocks },
          ...result
        } = generatorManager.addRooms()
        drawer?.setState({ ...result, objects: [...result.objects, ...innerBlocks] })
      } catch (error) {
        console.error(error)
      }
    }
  }, [drawer, generatorManager])

  useEffect(() => {
    if (canvasRef.current) {
      setDrawer(new Drawer(canvasRef.current))
      setGeneratorManager(new GeneratorManager())
    }
  }, [])

  return (
    <div>
      <div>
        <button onClick={onNewHull}>New hull</button>
        <button onClick={addRooms}>Add rooms</button>
      </div>
      <canvas ref={canvasRef} width="800" height="600" tabIndex={0} />
    </div>
  )
}
