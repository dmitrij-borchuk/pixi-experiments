import { getRandom } from './random'

export interface IPoint {
  x: number
  y: number
}

export interface IRoom {
  width: number
  height: number
  enter: IPoint
  exit: IPoint
}

const getPointOnSide = (width: number, height: number): IPoint => {
  const side = getRandom(4)
  if (side === 1 || side === 3) {
    return {
      x: getRandom(width - 2, 1),
      y: side === 1 ? 0 : height - 1,
    }
  }
  return {
    x: side === 2 ? width - 1 : 0,
    y: getRandom(height - 2, 1),
  }
}

interface IOptions {
  minWidth: number
  maxWidth: number
  maxHeight: number
  minHeight: number
}
export const getRoom = (options: IOptions): IRoom => {
  const { maxWidth, minWidth, maxHeight, minHeight } = options
  const width = getRandom(maxWidth, minWidth)
  const height = getRandom(maxHeight, minHeight)
  const enter = getPointOnSide(width, height)
  let exit = getPointOnSide(width, height)
  while (exit.x === enter.x && exit.y === enter.y) {
    exit = getPointOnSide(width, height)
  }
  return {
    width,
    height,
    enter,
    exit,
  }
}
