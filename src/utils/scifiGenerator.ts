import { getRandom } from './random'

function fillRoom(map: Record<string, string>, w: number, h: number, offsetX = 0, offsetY = 0) {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      if (i > 0 && i < w - 1 && j > 0 && j < h - 1) {
        continue
      }

      const key = `${i + offsetX}|${j + offsetY}`
      map[key] = 'wall'
    }
  }
}

export function generateShip() {
  const rooms = getRandom(6, 3)
  const map: Record<string, string> = {}
  let lastWall = -1
  let startPoint = [0, 0]

  for (let i = 0; i < rooms; i++) {
    let size = getRandom(5, 10)
    // Room should be odd size
    if (size % 2 === 0) {
      size += 1
    }
    const roomXOffset = lastWall + 1
    const roomYOffset = -Math.floor(size / 2)

    fillRoom(map, size, size, roomXOffset, roomYOffset)

    const key = `${lastWall + 1}|0`
    map[key] = 'airLock'
    lastWall += size - 1

    if (i === 0) {
      // First room
      startPoint = [size / 2, 0]
      const gunX = getRandom(size - 2, 1) + roomXOffset
      const gunY = getRandom(size - 2, 1) + roomYOffset
      const gunKey = `${gunX}|${gunY}`
      map[gunKey] = 'laserGun'
    }
    if (i === rooms - 1) {
      // Last room
      const xKey = lastWall + 1 - Math.floor(size / 2)
      map[`${xKey}|${-Math.floor(size / 2)}`] = 'airLock'
      map[`${xKey}|${Math.floor(size / 2)}`] = 'airLock'
    }
  }

  return {
    map,
    startPoint,
  }
}
