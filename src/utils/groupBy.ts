export function groupBy<T>(prop: keyof T, array: T[]) {
  return array.reduce<Record<string | number, T[]>>((acc, item) => {
    const key = item[prop]

    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error(`"object.prop" should be a type of "string" or "number". "${typeof key}" was provided`)
    }
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)

    return acc
  }, {})
}
