import { Rules, RuleValue } from './wfcAlphaTypes'

export function makeDeepTiles(tile: string, rule: RuleValue, depth: number): Rules {
  const newRules: Rules = {}
  let prevTile = tile
  for (let i = 0; i < depth - 1; i++) {
    newRules[`${tile}-${i + 1}`] = {
      top: [prevTile],
      right: [prevTile],
      left: [prevTile],
      bottom: [prevTile],
    }
    prevTile = `${tile}-${i + 1}`
  }
  const predicate = changeItem(tile, `${tile}-1`)

  return {
    [tile]: {
      bottom: rule.bottom.map(predicate),
      left: rule.left.map(predicate),
      right: rule.right.map(predicate),
      top: rule.top.map(predicate),
    },
    ...newRules,
  }
}

function changeItem(oldItem: string, newItem: string) {
  return (item: string) => {
    if (item === oldItem) {
      return newItem
    }

    return item
  }
}
