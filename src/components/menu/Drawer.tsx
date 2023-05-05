import React, { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './styles.css'

export const Drawer = ({ children }: { children: React.ReactNode }) => {
  const [opened, setOpened] = useState(false)
  const closeDrawer = useCallback(() => setOpened(false), [])
  useLocationChanged(closeDrawer)

  return (
    <div className="drawer">
      <HamburgerMenu onClick={() => setOpened((v) => !v)} />

      <div className={`panel ${opened ? 'opened' : ''}`}>
        <HamburgerMenu onClick={() => setOpened(false)} />
        {children}
      </div>
    </div>
  )
}

const HamburgerMenu = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="hamburgerMenu pointer" {...props}>
      <div className="line" />
      <div className="line" />
      <div className="line" />
    </div>
  )
}

function useLocationChanged(callback: () => void) {
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  React.useEffect(() => {
    if (location !== prevLocation) {
      callback()
      setPrevLocation(location)
    }
  }, [callback, location, prevLocation])
}
