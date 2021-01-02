import frameConfig from './frame.json'
import ironPlateConfig from './ironPlate.json'
import crateConfig from './crate.json'
import solarPanelConfig from './solarPanel.json'
import glassConfig from './glass.json'
import { ConstructionObjectConfig, StuffObjectConfig } from './types'

export const objectsConfig: Record<string, ConstructionObjectConfig | StuffObjectConfig> = {
  frame: frameConfig as ConstructionObjectConfig,
  ironPlate: ironPlateConfig as StuffObjectConfig,
  crate: crateConfig as ConstructionObjectConfig,
  solarPanel: solarPanelConfig as ConstructionObjectConfig,
  glass: glassConfig as ConstructionObjectConfig,
}
