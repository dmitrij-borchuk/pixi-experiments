import { TILE_SIZE } from './config'

export function getTileFromCoords(x: number, y: number) {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
  }
}
