export type Rules = Record<string, RuleValue>
export type RuleValue = {
  top: string[]
  bottom: string[]
  left: string[]
  right: string[]
}
