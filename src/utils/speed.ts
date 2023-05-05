/**
 * Calculate X and Y speed from absolute speed and direction
 * @param speed in pixels
 * @param angle in radians
 */
export function cartesianSpeedFromAngular(speed: number, angle: number) {
  if (angle >= 0 && angle <= Math.PI) {
    return {
      x: speed * Math.sin(angle),
      y: speed * Math.cos(angle),
    }
  }

  return {
    x: -speed * Math.sin(angle),
    y: -speed * Math.cos(angle),
  }
}
