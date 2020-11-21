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
    if (size % 2 === 0) {
      size += 1
    }

    fillRoom(map, size, size, lastWall + 1, -Math.floor(size / 2))

    const key = `${lastWall + 1}|0`
    map[key] = 'airLock'
    lastWall += size - 1

    if (i === 0) {
      startPoint = [size / 2, 0]
    }
    if (i === rooms - 1) {
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
