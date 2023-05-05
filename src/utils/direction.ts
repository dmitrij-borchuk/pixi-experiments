import { Coords } from './types'

/**
 * Calculate direction from one point to another
 * @param from Coords of the start point
 * @param to Coords of the point to calculate direction
 * @returns Angle in radians
 */
export function getDirection(from: Coords, to: Coords) {
  return Math.atan((to.x - from.x) / (to.y - from.y))
}
