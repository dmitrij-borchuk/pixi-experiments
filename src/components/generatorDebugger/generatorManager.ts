import { BlockGeneratorResult, generateRooms, generateHull } from '../../utils/stationGenerator'

export class GeneratorManager {
  private hull?: BlockGeneratorResult
  public generateHull() {
    this.hull = generateHull()

    return this.hull
  }
  public addSectors() {
    if (!this.hull) {
      throw new Error('Generate hull first')
    }

    return generateRooms(this.hull, { sizeFrom: 20, sizeTo: 50 })
  }
  public addRooms() {
    if (!this.hull) {
      throw new Error('Generate hull first')
    }

    return generateRooms(this.hull, { sizeFrom: 5, sizeTo: 20 })
  }
}
