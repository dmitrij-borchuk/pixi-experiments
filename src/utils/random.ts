export const getRandom = (to?: number, from?: number) => {
  const currentTo = (to || 1) - (from || 0)
  return Math.round(Math.random() * currentTo) + (from || 0)
}
