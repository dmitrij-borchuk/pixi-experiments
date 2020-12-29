import frameConfig from './frame.json'
import ironPlateConfig from './ironPlate.json'
import crateConfig from './crate.json'
import { ConstructionObjectConfig, StuffObjectConfig } from './types'

export const objectsConfig: Record<string, ConstructionObjectConfig | StuffObjectConfig> = {
  frame: frameConfig as ConstructionObjectConfig,
  ironPlate: ironPlateConfig as StuffObjectConfig,
  crate: crateConfig as ConstructionObjectConfig,
}
