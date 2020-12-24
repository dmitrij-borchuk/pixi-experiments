import frameConfig from './frame.json'
import ironPlateConfig from './ironPlate.json'
import crateConfig from './crate.json'
import { ObjectConfig } from './types'

export const objectsConfig: Record<string, ObjectConfig> = {
  frame: frameConfig,
  ironPlate: ironPlateConfig,
  crate: crateConfig,
}
