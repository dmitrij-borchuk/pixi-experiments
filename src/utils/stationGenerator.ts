import { nanoid } from 'nanoid'
import { GameState } from '../components/pixelDwarfStation/game'
import { GameObjectKey } from '../components/pixelDwarfStation/mapItems'
import { groupBy } from './groupBy'
import { generator } from './noise'

type Coords = {
  x: number
  y: number
}
export type BlockGeneratorObject = Coords & {
  type: string
  id: string
}
export interface BlockGeneratorResult {
  height: number
  width: number
  objects: BlockGeneratorObject[]
}
export function generateHull(): BlockGeneratorResult {
  // TODO: fill inner gaps
  const noise = getNoise(10)
  const islands = generateIslands(noise, 2, 10)

  islands.sort((a, b) => a.length - b.length)

  const bigger = islands[islands.length - 1]
  if (!bigger) {
    throw new Error("Can't generate station, please try again later")
  }
  const scaleFactor = 20
  const size = 50
  const hull = getHull(bigger, scaleFactor)
  const points = Object.keys(hull)
    .map((key) => key.split(':'))
    .map(([x, y]) => ({
      x: parseFloat(x),
      y: parseFloat(y),
    }))
  const centralizedPoints = moveToCenter(points, size)
  const walls = centralizedPoints.map(({ x, y }) => ({
    x: x,
    y: y,
    type: 'wall',
    id: nanoid(),
  }))

  const station = {
    height: size,
    width: size,
    objects: walls,
  }

  return station
}
export function generateRooms(hull: BlockGeneratorResult) {
  // const stationSize = getBlockSize(hull)

  const innerBlocks = getInnerBlocks(hull)
  // console.log('=-= stationSize', stationSize)
  // console.log('=-= innerBlocks', innerBlocks)

  return {
    ...hull,
    meta: {
      innerBlocks,
    },
  }
}
function getBlockSize(block: BlockGeneratorResult) {
  const bounding = getBlockBounding(block)
  if (!bounding) {
    return {
      x: 0,
      y: 0,
    }
  }
  if (block.objects.length === 1) {
    return {
      x: 1,
      y: 1,
    }
  }

  return {
    x: bounding.xMax - bounding.xMin,
    y: bounding.yMax - bounding.yMin,
  }
}
function getBlockBounding(block: BlockGeneratorResult) {
  if (block.objects.length === 0) {
    return null
  }
  const { x, y } = block.objects[0]
  const borders = block.objects.reduce<{ xMin: number; yMin: number; xMax: number; yMax: number }>(
    (acc, item) => {
      return {
        xMin: Math.min(item.x, acc.xMin),
        yMin: Math.min(item.y, acc.yMin),
        xMax: Math.max(item.x, acc.xMax),
        yMax: Math.max(item.y, acc.yMax),
      }
    },
    { xMin: x, yMin: y, xMax: x, yMax: y }
  )

  return borders
}
function getInnerBlocks(block: BlockGeneratorResult) {
  const objectsByY = groupBy('y', block.objects)
  const bounding = getBlockBounding(block)

  if (!bounding) {
    return []
  }

  const array: BlockGeneratorObject[] = []

  for (let x = bounding.xMin; x < bounding.xMax; x++) {
    for (let y = bounding.yMin; y < bounding.yMax; y++) {
      if (isInner({ x, y }, objectsByY[y])) {
        array.push({ x, y, type: 'yellow', id: nanoid() })
      }
    }
  }

  return array
}
// It works only for closed hull and without holes
function isInner(object: Coords, coordsArray: Coords[]) {
  if (coordsArray.length <= 1) {
    throw new Error('At least two coords should be provided')
  }

  const xArray = coordsArray.map((c) => c.x)

  if (xArray.includes(object.x)) {
    return false
  }

  const minX = Math.min(...xArray)
  const maxX = Math.max(...xArray)

  return object.x > minX && object.x < maxX
}
export function generateSpaceStation(threshold: number) {
  const result = generateHull()
  const walls = result.objects.map(({ x, y }) => ({
    x: x,
    y: y,
    key: 'wall' as GameObjectKey,
    id: nanoid(),
  }))

  const station: GameState = {
    level: {
      mapHeight: result.height,
      mapWidth: result.width,
      tasksManager: {
        tasks: [],
      },
      mapObjects: walls,
    },
  }

  return {
    station,
  }
}

function getNoise(size: number) {
  const generate = generator()
  const scaleFactor = 10
  const generated = []
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      generated.push({
        x,
        y,
        v: generate(x / scaleFactor, y / scaleFactor),
      })
    }
  }

  return generated
}

function generateIslands(noise: Point[], minV: number, maxV: number) {
  const steps = 1 / 0.1 - 1
  const startStep = 0.9
  let allIslands: {
    x: number
    y: number
  }[][] = []
  for (let i = 0; i < steps; i++) {
    const {
      islands: { islands },
    } = getIslands(noise, startStep - 0.1 * i)
    const smallIslands = islands.filter((island) => island.length >= minV && island.length <= maxV)

    // if (smallIslands.length === 0) {
    //   return allIslands
    // }
    allIslands = allIslands.concat(smallIslands)
  }
  return allIslands
}

function getIslands(points: Point[], threshold: number) {
  const grid: string[][] = []

  points.forEach((point) => {
    const { x, y, v } = point
    const value = v > threshold ? '1' : '0'
    grid[x] = grid[x] || []
    grid[x][y] = value
  })

  return {
    islands: islands(grid),
    grid,
  }
}

type Point = {
  x: number
  y: number
  v: number
}

const islands = (grid: string[][]) => {
  const isIsland = (i: number, j: number) =>
    i >= 0 && i < grid.length && j >= 0 && j < grid[i].length && grid[i][j] === '1'

  const bfs = (i: number, j: number) => {
    const queue = [[i, j]]
    const island: { x: number; y: number }[] = []

    while (queue.length) {
      const item = queue.shift()
      if (!item) continue

      const [i, j] = item
      if (grid[i][j] === '0') continue

      grid[i][j] = '0'
      island.push({
        x: j,
        y: i,
      })

      if (isIsland(i + 1, j)) {
        queue.push([i + 1, j])
      }
      if (isIsland(i, j + 1)) {
        queue.push([i, j + 1])
      }
      if (isIsland(i - 1, j)) {
        queue.push([i - 1, j])
      }
      if (isIsland(i, j - 1)) {
        queue.push([i, j - 1])
      }
    }

    return island
  }

  let counter = 0
  const islands: { x: number; y: number }[][] = []

  for (let i = 0; i < grid.length; i += 1) {
    for (let j = 0; j < grid[i].length; j += 1) {
      if (grid[i][j] === '1') {
        counter += 1
        const island = bfs(i, j)
        if (island) {
          islands.push(island)
        }
      }
    }
  }

  return {
    counter,
    islands,
  }
}

function getHull(points: Coords[], scaleFactor: number) {
  return points.reduce<Record<string, boolean>>((acc, point) => {
    return {
      ...acc,
      ...getHullForPoint(points, point, scaleFactor),
    }
  }, {})
}

function getHullForPoint(points: Coords[], { x, y }: Coords, scaleFactor: number) {
  const coordsToPoints = points.reduce<Record<string, Coords>>((acc, coords) => {
    return {
      ...acc,
      [`${coords.x}:${coords.y}`]: coords,
    }
  }, {})

  let walls: Record<string, boolean> = {}

  const cornerX = x * scaleFactor
  const cornerY = y * scaleFactor

  // Right
  if (!coordsToPoints[`${x + 1}:${y}`]) {
    for (let i = 0; i < scaleFactor; i++) {
      walls = {
        ...walls,
        [`${cornerX + scaleFactor - 1}:${cornerY + i}`]: true,
      }
    }
  }

  // Left
  if (!coordsToPoints[`${x - 1}:${y}`]) {
    for (let i = 0; i < scaleFactor; i++) {
      walls = {
        ...walls,
        [`${cornerX}:${cornerY + i}`]: true,
      }
    }
  }

  // Top
  if (!coordsToPoints[`${x}:${y - 1}`]) {
    for (let i = 0; i < scaleFactor; i++) {
      walls = {
        ...walls,
        [`${cornerX + i}:${cornerY}`]: true,
      }
    }
  }

  // Bottom
  if (!coordsToPoints[`${x}:${y + 1}`]) {
    for (let i = 0; i < scaleFactor; i++) {
      walls = {
        ...walls,
        [`${cornerX + i}:${cornerY + scaleFactor - 1}`]: true,
      }
    }
  }

  // Bottom right
  if (!coordsToPoints[`${x + 1}:${y + 1}`]) {
    walls = {
      ...walls,
      [`${cornerX + scaleFactor - 1}:${cornerY + scaleFactor - 1}`]: true,
    }
  }

  // Bottom left
  if (!coordsToPoints[`${x - 1}:${y + 1}`]) {
    walls = {
      ...walls,
      [`${cornerX}:${cornerY + scaleFactor - 1}`]: true,
    }
  }

  // Top left
  if (!coordsToPoints[`${x - 1}:${y - 1}`]) {
    walls = {
      ...walls,
      [`${cornerX}:${cornerY}`]: true,
    }
  }

  // Top right
  if (!coordsToPoints[`${x + 1}:${y - 1}`]) {
    walls = {
      ...walls,
      [`${cornerX + scaleFactor - 1}:${cornerY}`]: true,
    }
  }

  return walls
}

function moveToCenter(points: Coords[], size: number) {
  const [sumX, sumY] = points.reduce(
    ([x, y], point) => {
      return [x + point.x, y + point.y]
    },
    [0, 0]
  )
  const center = {
    x: sumX / points.length,
    y: sumY / points.length,
  }

  const offsetX = Math.floor(size / 2 - center.x)
  const offsetY = Math.floor(size / 2 - center.y)

  return points.map((p) => ({ x: p.x + offsetX, y: p.y + offsetY }))
}
