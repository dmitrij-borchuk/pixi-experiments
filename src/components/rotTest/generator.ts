import { RNG } from 'rot-js'

interface Options {
  corridorWidth: number
  minPartVolume: number
  minSize: number
}
interface Corridor {}
export interface Room {
  x: number
  y: number
  width: number
  height: number
}

let i = 0
export function generateStation(width: number, height: number, options: Partial<Options> = {}): [Room[], Corridor[]] {
  const { corridorWidth = 1, minSize = 5 } = options
  const isHorizontal = RNG.getUniform() > 0.5
  const [rooms, corridors] = divideRoomRecursively(
    {
      height,
      width,
      x: 0,
      y: 0,
    },
    minSize,
    corridorWidth,
    isHorizontal
  )

  let newRooms: Room[] = []
  rooms.forEach((room) => {
    const splitHorizontal = room.height > room.width
    newRooms = newRooms.concat(divideRoomWithWallRecursively(room, 5, splitHorizontal))
  })

  return [newRooms, corridors]
}

export function divideRoomRecursively(
  room: Room,
  minSize: number,
  corridorWidth: number,
  isHorizontal = true
): [Room[], Corridor[]] {
  i++
  if (i > 1000) {
    throw new Error(`Max recursion steps: ${i}`)
  }
  const isWTooSmall = room.width - 2 * minSize < corridorWidth
  const isHTooSmall = room.height - 2 * minSize < corridorWidth

  if (isWTooSmall || isHTooSmall) {
    return [[room], []]
  }

  const [room1, room2, corridor] = divideRoom(room, minSize, corridorWidth, isHorizontal)

  const room1Result = divideRoomRecursively(room1, minSize, corridorWidth, !isHorizontal)
  const room2Result = divideRoomRecursively(room2, minSize, corridorWidth, !isHorizontal)

  return [
    [...room1Result[0], ...room2Result[0]],
    [...room1Result[1], ...room2Result[1], corridor],
  ]
}

export function divideRoomWithWallRecursively(room: Room, minSize: number, isHorizontal = true): Room[] {
  const isWTooSmall = room.width - 2 * minSize <= 1
  const isHTooSmall = room.height - 2 * minSize <= 1

  if (isWTooSmall && isHTooSmall) {
    return [room]
  }

  const [room1, room2] = divideRoomWithWall(room, minSize, isHorizontal)
  // if (room1.width === 4) {
  //   console.log('=-= room1', room1)
  // }

  const room1Result = divideRoomWithWallRecursively(room1, minSize, room1.height > room1.width)
  const room2Result = divideRoomWithWallRecursively(room2, minSize, room2.height > room2.width)

  return [...room1Result, ...room2Result]
}

function getFromToFromRoom(room: Room, minSize: number, separatorWidth: number, isHorizontal = true) {
  if (isHorizontal) {
    return [room.y + minSize, room.y + room.height - minSize - separatorWidth]
  }

  return [room.x + minSize, room.x + room.width - minSize - separatorWidth]
}

export function divideRoom(
  room: Room,
  minSize: number,
  corridorWidth: number,
  isHorizontal = true
): [Room, Room, Corridor] {
  const [from, to] = getFromToFromRoom(room, minSize, corridorWidth, isHorizontal)

  if (from > to) {
    throw new Error('Room is too small')
  }

  let point = Math.round(RNG.getNormal((to - from) / 2, (to - from) / 2))

  if (point >= to || point <= from) {
    point = RNG.getUniformInt(from, to)
  }

  if (isHorizontal) {
    return [
      {
        ...room,
        height: point - room.y,
      },
      {
        ...room,
        y: point + corridorWidth,
        height: room.height - (point - room.y) - corridorWidth,
      },
      {},
    ]
  }

  return [
    {
      ...room,
      width: point - room.x,
    },
    {
      ...room,
      x: point + corridorWidth,
      width: room.width - (point - room.x) - corridorWidth,
    },
    {},
  ]
}

export function divideRoomWithWall(room: Room, minSize: number, isHorizontal = true): [Room, Room] {
  const [from, to] = getFromToFromRoom(room, minSize, 1, isHorizontal)

  if (from > to) {
    throw new Error('Room is too small')
  }

  let point = Math.round(RNG.getNormal((to - from) / 2, (to - from) / 2))

  if (point >= to || point <= from) {
    point = RNG.getUniformInt(from, to)
  }

  if (isHorizontal) {
    return [
      {
        ...room,
        height: point - room.y + 1,
      },
      {
        ...room,
        y: point,
        height: room.height - (point - room.y),
      },
    ]
  }

  return [
    {
      ...room,
      width: point - room.x + 1,
    },
    {
      ...room,
      x: point,
      width: room.width - (point - room.x),
    },
  ]
}
