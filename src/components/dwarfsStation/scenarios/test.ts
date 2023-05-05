import { BaseScene, GameState } from '../types'
import { initScenarioTools, launchScene } from './tools'
import { generateInitialStructure } from '../generator'

// TODO: track player position and stats
// TODO: track inventory
// TODO: track air condition in the coords
// TODO: track pipe content (probably player would build this pipe by his own)

function generateWorld(): GameState {
  return generateInitialStructure()
}

export async function run(scene: BaseScene) {
  const { showDialog, showMessage, queryObject, wait } = initScenarioTools(scene)

  await launchScene(scene)
  const world = generateWorld()
  scene.applyWorld(world)

  await showDialog('Introduction')

  showMessage('Build solar panel')

  const solarPanelQuery = () => queryObject('walls', 'solarPanel')
  await wait(solarPanelQuery, 'objectBuilt.walls')
  // Solar panel is build
  await showDialog('Great job')
  showMessage('Build Autolathe')
  const autolatheQuery = () => queryObject('walls', 'autolathe')
  await wait(autolatheQuery, 'objectBuilt.walls')

  await showDialog('You won')
}

const defaultState = {
  init: false,
  intro: false,
}
export class Scenario {
  private state = defaultState
  public async run(scene: BaseScene, state: typeof defaultState) {
    const { showDialog, showMessage, queryObject, wait } = initScenarioTools(scene)

    await launchScene(scene)
    const world = generateWorld()
    scene.applyWorld(world)

    await showDialog('Introduction')

    showMessage('Build solar panel')

    const solarPanelQuery = () => queryObject('walls', 'solarPanel')
    await wait(solarPanelQuery, 'objectBuilt.walls')
    // Solar panel is build
    await showDialog('Great job')
    showMessage('Build Autolathe')
    const autolatheQuery = () => queryObject('walls', 'autolathe')
    await wait(autolatheQuery, 'objectBuilt.walls')

    await showDialog('You won')
  }
  public getState() {
    return this.state
  }
}

export default new Scenario()
