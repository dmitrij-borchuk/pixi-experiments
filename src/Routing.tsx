import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Shoot } from './components/shoot/Shoot'
import { Defend } from './components/defend/Defend'
import { Station } from './components/station/Station'
import { Survival } from './components/shipSurvival/Survival'
import { DwarfsStation } from './components/dwarfsStation'
import { RotTest } from './components/rotTest'
import { X2d } from './components/x2d'
import { PixelDwarfStation } from './components/pixelDwarfStation/PixelDwarfStation'
import { GeneratorDebugger } from './components/generatorDebugger'
import { RoomSurvival } from './components/roomSurvival'
import { StarshipSurvival } from './components/starshipSurvival'
import { WaveFunctionCollapse } from './components/waveFunctionCollapse'

export const Routing = () => {
  return (
    <Switch>
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
      <Route path="/generatorDebugger">
        <GeneratorDebugger />
      </Route>
      <Route path="/RoomSurvival">
        <RoomSurvival />
      </Route>
      <Route path="/StarshipSurvival">
        <StarshipSurvival />
      </Route>
      <Route path="/waveFunctionCollapse">
        <WaveFunctionCollapse />
      </Route>
    </Switch>
  )
}
