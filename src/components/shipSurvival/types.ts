export interface UseResult {
  // TODO: typing for inventory use result
  inventory?: any[]
  // TODO: typing for props use result
  // Something happening with the props of user (health increasing etc.)
  props?: any[]
}

export interface Usable {
  use: () => UseResult | void
}
