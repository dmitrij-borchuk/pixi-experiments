import React, { useCallback, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { Home } from './components/home/Home'
import { Test } from './components/test/Text'
import { Move } from './components/move/Move'
import { Rooms } from './components/rooms/Rooms'
import { MoveInTheRoom } from './components/moveInTheRoom/MoveInTheRoom'
import { Shoot } from './components/shoot/Shoot'
import { Defend } from './components/defend/Defend'
import { Station } from './components/station/Station'
import { Station as BuildStation } from './experiments/station/app'
import { Survival } from './components/shipSurvival/Survival'
import { DwarfsStation } from './components/dwarfsStation'
import { RotTest } from './components/rotTest'
import { X2d } from './components/x2d'
import { PixelDwarfStation } from './components/pixelDwarfStation/PixelDwarfStation'
import { GeneratorDebugger } from './components/generatorDebugger'
import { RoomSurvival } from './components/roomSurvival'

// TODO: add code generation

export default function App() {
  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <button onClick={toggleMenu} style={{ position: 'fixed' }}>
          Menu
        </button>
        <header style={{ display: showMenu ? 'block' : 'none' }}>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/test">Test</Link>
              </li>
              <li>
                <Link to="/move">Move</Link>
              </li>
              <li>
                <Link to="/rooms">Rooms</Link>
              </li>
              <li>
                <Link to="/move-in-the-room">Move in the room</Link>
              </li>
              <li>
                <Link to="/shoot">Zombie shooter</Link>
              </li>
              <li>
                <Link to="/defend">Defend your base</Link>
              </li>
              <li>
                <Link to="/station">Space station</Link>
              </li>
              <li>
                <Link to="/build">buildStation</Link>
              </li>
              <li>
                <Link to="/survival">Survival</Link>
              </li>
              <li>
                <Link to="/dwarfsStation">Dwarfs Station</Link>
              </li>
              <li>
                <Link to="/rotTest">Rot test</Link>
              </li>
              <li>
                <Link to="/x2d">X2d</Link>
              </li>
              <li>
                <Link to="/pixelDwarfStation">Pixel Dwarf Station</Link>
              </li>
              <li>
                <Link to="/generatorDebugger">Generator debugger</Link>
              </li>
              <li>
                <Link to="/RoomSurvival">Room Survival</Link>
              </li>
            </ul>
          </nav>
        </header>
        <div>
          <Switch>
            <Route path="/test">
              <Test />
            </Route>
            <Route path="/move">
              <Move />
            </Route>
            <Route path="/rooms">
              <Rooms />
            </Route>
            <Route path="/move-in-the-room">
              <MoveInTheRoom />
            </Route>
            <Route path="/shoot">
              <Shoot />
            </Route>
            <Route path="/defend">
              <Defend />
            </Route>
            <Route path="/station">
              <Station />
            </Route>
            <Route path="/build">
              <BuildStation />
            </Route>
            <Route path="/survival">
              <Survival />
            </Route>
            <Route path="/dwarfsStation">
              <DwarfsStation />
            </Route>
            <Route path="/rotTest">
              <RotTest />
            </Route>
            <Route path="/x2d">
              <X2d />
            </Route>
            <Route path="/pixelDwarfStation">
              <PixelDwarfStation />
            </Route>
            <Route path="/generatorDebugger">
              <GeneratorDebugger />
            </Route>
            <Route path="/RoomSurvival">
              <RoomSurvival />
            </Route>

            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  )
}
