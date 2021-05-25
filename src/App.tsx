import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { Home } from './components/home/Home'
import { Test } from './components/test/Text'
import { Move } from './components/move/Move'
import { Rooms } from './components/rooms/Rooms'
import { MoveInTheRoom } from './components/moveInTheRoom/MoveInTheRoom'
import { Shoot } from './components/shoot/Shoot'
import { Defend } from './components/defend/Defend'
import { Station } from './components/station/Station'
import { Survival } from './components/shipSurvival/Survival'
import { DwarfsStation } from './components/dwarfsStation'
import { RotTest } from './components/rotTest'
import { X2d } from './components/x2d'
import { PixelDwarfStation } from './components/pixelDwarfStation/PixelDwarfStation'

// TODO: add code generation

export default function App() {
  return (
    <Router>
      <header>
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

          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
