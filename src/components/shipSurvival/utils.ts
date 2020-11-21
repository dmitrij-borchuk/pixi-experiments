// Ensures sprite speed doesn't exceed maxVelocity while update is called
export function constrainVelocity(sprite: any, maxVelocity: any) {
  if (!sprite || !sprite.body) return

  let angle, currVelocitySqr, vx, vy
  vx = sprite.body.velocity.x
  vy = sprite.body.velocity.y
  currVelocitySqr = vx * vx + vy * vy

  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx)
    vx = Math.cos(angle) * maxVelocity
    vy = Math.sin(angle) * maxVelocity
    sprite.body.velocity.x = vx
    sprite.body.velocity.y = vy
  }
}

export function getVelocityTo(angle: number, maxVelocity: number) {
  const vx = Math.cos(angle) * maxVelocity
  const vy = Math.sin(angle) * maxVelocity
  return [vx, vy]
}

// Ensures reticle does not move offscreen
export function constrainReticle(reticle: any, player: any) {
  const distX = reticle.x - player.x // X distance between player & reticle
  const distY = reticle.y - player.y // Y distance between player & reticle

  // Ensures reticle cannot be moved offscreen (player follow)
  if (distX > 800) reticle.x = player.x + 800
  else if (distX < -800) reticle.x = player.x - 800

  if (distY > 600) reticle.y = player.y + 600
  else if (distY < -600) reticle.y = player.y - 600
}

export function getWorldSize(map: Record<string, string>) {
  const keys = Object.keys(map)
  const indexes = keys.map((key) => key.split('|')).map(([xStr, yStr]) => [parseInt(xStr, 10), parseInt(yStr, 10)])
  const xIndexes = indexes.map(([x]) => x)
  const yIndexes = indexes.map(([x, y]) => y)
  const xMin = Math.min(...xIndexes)
  const yMin = Math.min(...yIndexes)
  const w = Math.max(...xIndexes) - xMin
  const h = Math.max(...yIndexes) - yMin

  return {
    x: xMin - 20,
    y: yMin - 20,
    w: w + 40,
    h: h + 40,
  }
}
