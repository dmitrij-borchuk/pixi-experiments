import { getRandom } from './random'

type GameMap = Record<string, string>

function fillRect(x: number, y: number, w: number, h: number) {
  const map: GameMap = {}

  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      if (i > 0 && i < w - 1 && j > 0 && j < h - 1) {
        continue
      }

      const key = `${i + x}|${j + y}`
      map[key] = 'wall'
    }
  }

  return map
}

function fillRoom(map: GameMap, w: number, h: number, offsetX = 0, offsetY = 0) {
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

function getRoomRandomCoords(size: number, x: number, y: number) {
  return [getRandom(size - 2, 1) + x, getRandom(size - 2, 1) + y]
}

interface Ranges {
  x: number
  y: number
  w: number
  h: number
}
function addSpawner(map: GameMap, ranges: Ranges) {
  const { x, y, w, h } = ranges
  const randX = getRandom(x + w - 1, x)
  const randY = getRandom(y + h - 1, y)
  const key = `${randX}|${randY}`

  map[key] = 'spawner.drone'
}

export function generateShip() {
  const rooms = getRandom(6, 3)
  const map: GameMap = {}
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

    if (i !== 0) {
      // All rooms except first
      addSpawner(map, {
        x: roomXOffset + 1,
        y: roomYOffset + 1,
        w: size - 2,
        h: size - 2,
      })
    }

    if (i === 0) {
      // First room
      startPoint = [size / 2, 0]
      const [gunX, gunY] = getRoomRandomCoords(size, roomXOffset, roomYOffset)
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

interface Rectangle {
  left: number
  right: number
  top: number
  bottom: number
}
function intersectRect(r1: Rectangle, r2: Rectangle) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)
}

function getAllToAllRelationship(modules: Module[]) {
  const relationship: [Module, Module][] = []
  modules.forEach((moduleOuter) => {
    modules.forEach((moduleInner) => {
      if (moduleOuter !== moduleInner) {
        relationship.push([moduleOuter, moduleInner])
      }
    })
  })
  return relationship
}
function moveRect(direction: number, rect: Rectangle): Rectangle {
  const coords = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.right, rect.bottom],
    [rect.left, rect.bottom],
  ]
  const obj = {
    x: rect.left,
    y: rect.top,
    w: rect.right - rect.left,
    h: rect.bottom - rect.top,
  }

  const r = 1
  const f = direction * (Math.PI / 180)
  const offsetX = r * Math.cos(f)
  const offsetY = r * Math.sin(f)

  return {
    left: Math.round(obj.x + offsetX),
    top: Math.round(obj.y + offsetY),
    right: Math.round(obj.x + offsetX + obj.w),
    bottom: Math.round(obj.y + offsetY + obj.h),
  }

  // const newCoords = coords.map(([x, y]) => {
  //   // const tempX =
  //   // const r = Math.sqrt(x**2 + y**2)
  //   // const f = Math.atan2(y, x)
  //   const r = 1
  //   const f = direction * (Math.PI / 180)
  //   const tmpX = r * Math.cos(f)
  //   const tmpY = r * Math.sin(f)

  //   // if (Math.abs(tmpY) <= 0.5 && direction !== 0 && direction !== 180) {
  //   //   console.log('=-= direction', direction)
  //   //   console.log('=-= tmpY', tmpY)
  //   // }

  //   // Y axis in the cartesian system pointing to the top, but we use Y axis that pointing down
  //   return [x + tmpX, y - tmpY]
  // })

  // return {
  //   left: Math.round(newCoords[0][0]),
  //   top: Math.round(newCoords[0][1]),
  //   right: Math.round(newCoords[1][0]),
  //   bottom: Math.round(newCoords[2][0]),
  // }
}

interface Module extends Rectangle {
  direction: number
}
const directions = [0, 45, 90, 135, 180, 225, 270, 315]
export function generateStation() {
  const amount = getRandom(10, 4)
  // const amount = getRandom(2, 2)
  let modules: Module[] = []
  const modulesTmp: Module[] = []
  let map: GameMap = {}

  // for (let i = 0; i < amount; i++) {
  //   const size = getRandom(10, 5)
  //   const directionsIndex = getRandom(directions.length - 1)
  //   const module = {
  //     left: -Math.floor(size / 2),
  //     right: Math.floor(size / 2),
  //     top: -Math.floor(size / 2),
  //     bottom: Math.floor(size / 2),
  //     direction: directions[directionsIndex],
  //   }
  //   modules.push(module)
  //   modulesTmp.push({ ...module })
  // }
  modules = [
    {
      left: -4,
      right: 4,
      top: -4,
      bottom: 4,
      direction: 45,
    },
    {
      left: -4,
      right: 4,
      top: -4,
      bottom: 4,
      direction: 135,
    },
    {
      left: -4,
      right: 4,
      top: -4,
      bottom: 4,
      direction: 180,
    },
    {
      left: -4,
      right: 4,
      top: -4,
      bottom: 4,
      direction: 0,
    },
    {
      left: -3,
      right: 3,
      top: -3,
      bottom: 3,
      direction: 135,
    },
    {
      left: -2,
      right: 2,
      top: -2,
      bottom: 2,
      direction: 180,
    },
    {
      left: -3,
      right: 3,
      top: -3,
      bottom: 3,
      direction: 90,
    },
  ]

  const relationship = getAllToAllRelationship(modules)
  console.log('=-= getAllToAllRelationship', relationship)
  let foundOverlap = true
  const maxCircle = 110
  let currentCircle = 0
  while (foundOverlap && maxCircle > currentCircle) {
    currentCircle += 1
    if (maxCircle <= currentCircle) {
      console.error(`maxCircle reached: ${maxCircle}`)
    }
    let overlapped = false

    relationship.forEach(([moduleFrom, moduleTo]) => {
      if (intersectRect(moduleFrom, moduleTo)) {
        overlapped = true
        const newRect = moveRect(moduleFrom.direction, moduleFrom)
        const props = ['left', 'top', 'right', 'bottom'] as const
        const moreThan1 = props.some((prop) => Math.abs(newRect[prop] - moduleFrom[prop]) > 1)
        // const moreThan1 = props.some((prop) => {
        //   console.log('=-= abs', Math.abs(newRect[prop] - moduleFrom[prop]))
        //   return Math.abs(newRect[prop] - moduleFrom[prop]) > 1
        // })
        if (moreThan1) {
          console.log('=-= !!!!!!!!!!!!!!', newRect, moduleFrom)
        }
        Object.assign(moduleFrom, newRect)
      }
    })

    foundOverlap = overlapped
  }

  console.log('=-= modulesTmp', modulesTmp)
  console.log('=-= modules', modules)

  modules.forEach((module) => {
    Object.assign(map, fillRect(module.left, module.top, module.right - module.left, module.bottom - module.top))
  })

  return {
    map,
    startPoint: [0, 0],
  }
}
