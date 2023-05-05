import React from 'react'
import { Link } from 'react-router-dom'
import { Drawer } from './Drawer'

export const Menu = () => {
  return (
    <>
      <Drawer>
        <nav>
          <ul>
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
            <li>
              <Link to="/generatorDebugger">Generator debugger</Link>
            </li>
            <li>
              <Link to="/RoomSurvival">Room Survival</Link>
            </li>
            <li>
              <Link to="/StarshipSurvival">Starship Survival</Link>
            </li>
            <li>
              <Link to="/waveFunctionCollapse">Wave function collapse</Link>
            </li>
          </ul>
        </nav>
      </Drawer>
    </>
  )
}
