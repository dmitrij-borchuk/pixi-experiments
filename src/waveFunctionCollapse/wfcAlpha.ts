import { Rules } from './wfcAlphaTypes'

// TODO: add weight
export class WfcAlpha {
  rules: Rules
  w: number
  h: number
  tiles: string[]
  grid: string[][][] = []
  notCollapsed: [number, number][] = []
  constructor(rules: Rules, w: number, h: number) {
    console.log('=-= WfcAlpha constructor', rules)
    this.rules = rules
    this.w = w
    this.h = h

    this.tiles = Object.keys(rules)

    for (let i = 0; i < this.w; i++) {
      for (let j = 0; j < this.h; j++) {
        this.grid[i] = this.grid[i] || []
        this.grid[i][j] = [...this.tiles]
        this.notCollapsed.push([i, j])
      }
    }
  }

  step() {
    const randIndex = Math.floor(Math.random() * this.notCollapsed.length)
    // console.log('=-= s randIndex', randIndex)
    // console.log('=-= s this.notCollapsed', this.notCollapsed.length)
    const [x, y] = this.notCollapsed[randIndex]
    this.notCollapsed.splice(randIndex, 1)
    // const [x, y] = this.getRandomCoords(this.w, this.h)
    const currentValues = this.grid[x][y]
    const index = Math.floor(Math.random() * currentValues.length)
    // this.grid[x][y] = [currentValues[index]]
    this.collapse(x, y, [currentValues[index]])
  }

  calculate() {
    while (this.notCollapsed.length) {
      this.step()
    }
  }

  getRandomCoords(x: number, y: number): [number, number] {
    return [Math.floor(Math.random() * x), Math.floor(Math.random() * y)]
  }

  collapse(x: number, y: number, newValue: string[]) {
    const currentValue = this.grid[x][y]

    if (currentValue.filter((x) => !newValue.includes(x)).length === 0) {
      return
    }
    this.grid[x][y] = newValue

    // const possibleTiles = newValue.reduce<RuleValue>(
    //   (acc, cur) => {
    //     const rule = this.rules[cur]
    //     return {
    //       top: intersection(acc.top, rule.top),
    //       bottom: intersection(acc.bottom, rule.bottom),
    //       left: intersection(acc.left, rule.left),
    //       right: intersection(acc.right, rule.right),
    //     }
    //   },
    //   {
    //     top: [],
    //     bottom: [],
    //     left: [],
    //     right: [],
    //   }
    // )
    if (this.grid[x][y - 1]) {
      const value = newValue.map((v) => this.rules[v].top).flat()
      this.collapse(x, y - 1, intersection(this.grid[x][y - 1], value))
    }
    if (this.grid[x][y + 1]) {
      const value = newValue.map((v) => this.rules[v].bottom).flat()
      this.collapse(x, y + 1, intersection(this.grid[x][y + 1], value))
    }
    if (this.grid[x - 1]) {
      const value = newValue.map((v) => this.rules[v].left).flat()
      this.collapse(x - 1, y, intersection(this.grid[x - 1][y], value))
    }
    if (this.grid[x + 1]) {
      const value = newValue.map((v) => this.rules[v].right).flat()
      this.collapse(x + 1, y, intersection(this.grid[x + 1][y], value))
    }
  }

  potentialCollapse(x: number, y: number, newValue: string[]) {}

  getGrid() {
    return this.grid
  }
}

function intersection(arr1: string[], arr2: string[]): string[] {
  return arr1.filter((x) => arr2.includes(x))
}
