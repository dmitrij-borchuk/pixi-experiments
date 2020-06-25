import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { Home } from './components/home/Home'
import { Test } from './components/test/Text'
import { Move } from './components/move/Move'
import { Rooms } from './components/rooms/Rooms'
import { MoveInTheRoom } from './components/moveInTheRoom/MoveInTheRoom'
import { Shoot } from './components/shoot/Shoot'

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
              <Link to="/shoot">Shoot</Link>
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
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
