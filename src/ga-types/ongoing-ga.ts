export interface IOngoingGa {
  name: string
  subGa: IOngoingGa[]
}

export class BaseOngoingGa implements IOngoingGa {
  name: string
  subGa: IOngoingGa[] = []

  private constructor(name: string) {
    this.name = name
  }

  static create(name: string): Result<BaseOngoingGa> {
    if (typeof name !== 'string' || name.trim() === '') {
      return [null, new Error('Invalid Ga name: must be a non-empty string')]
    }
    return [new BaseOngoingGa(name.trim()), null]
  }

  // ساخت از object plain
  static fromPlain(data: IOngoingGa): Result<BaseOngoingGa> {
    if (!data || typeof data !== 'object') {
      return [null, new Error('Invalid data: must be an object')]
    }

    const [ga, err] = BaseOngoingGa.create(data.name)
    if (err) return [null, err]

    if (Array.isArray(data.subGa)) {
      for (const subData of data.subGa) {
        const [subGa, subErr] = BaseOngoingGa.fromPlain(subData)
        if (subErr) {
          return [null, new Error(`Failed to create subGa: ${subErr.message}`)]
        }
        ga!.subGa.push(subGa!)
      }
    }

    return [ga, null]
  }

  addSubGa(ga: IOngoingGa, index?: number): Result<boolean> {
    if (!ga || typeof ga !== 'object') {
      return [null, new Error('Invalid Ga object')]
    }

    const exists = this.subGa.find((a) => a.name === ga.name)
    if (exists) {
      return [null, new Error(`Duplicate Ga name: '${ga.name}' already exists`)]
    }

    const invalidIndex =
      typeof index !== 'number' ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > this.subGa.length

    if (invalidIndex || index === undefined) {
      this.subGa.push(ga)
    } else {
      this.subGa.splice(index, 0, ga)
    }

    return [true, null]
  }

  removeSubGa(name: string): Result<boolean> {
    if (typeof name !== 'string' || name.trim() === '') {
      return [null, new Error('Invalid Ga name: must be a non-empty string')]
    }

    const index = this.subGa.findIndex((a) => a.name === name)
    if (index < 0) {
      return [null, new Error(`No Sub-Ga named "${name}" found in "${this.name}"`)]
    }

    this.subGa.splice(index, 1)
    return [true, null]
  }

  removeSubGaAtIndex(index: number): Result<boolean> {
    if (!Number.isInteger(index)) {
      return [null, new Error(`Invalid index: must be an integer, got ${index}`)]
    }

    if (index < 0 || index >= this.subGa.length) {
      return [
        null,
        new Error(`Index out of range: ${index} (length: ${this.subGa.length})`),
      ]
    }

    this.subGa.splice(index, 1)
    return [true, null]
  }

  hasChild(name: string): Result<boolean> {
    if (typeof name !== 'string' || name.trim() === '') {
      return [null, new Error('Invalid name: must be a non-empty string')]
    }
    const exists = this.subGa.some((a) => a.name === name)
    return [exists, null]
  }

  findChild(name: string): Result<IOngoingGa | null> {
    if (typeof name !== 'string' || name.trim() === '') {
      return [null, new Error('Invalid name: must be a non-empty string')]
    }
    const found = this.subGa.find((a) => a.name === name) ?? null
    return [found, null]
  }

  findByName(name: string): Result<IOngoingGa | null> {
    if (typeof name !== 'string' || name.trim() === '') {
      return [null, new Error('Invalid name: must be a non-empty string')]
    }

    if (this.name === name) return [this, null]

    for (const child of this.subGa) {
      if (child instanceof BaseOngoingGa) {
        const [found, err] = child.findByName(name)
        if (err) return [null, err]
        if (found) return [found, null]
      } else if (child.name === name) {
        return [child, null]
      }
    }

    return [null, null] // not found but no error
  }

  toPlain(): Result<IOngoingGa> {
    try {
      const plain: IOngoingGa = {
        name: this.name,
        subGa: this.subGa.map((child) =>
          child instanceof BaseOngoingGa ? child.toPlain()[0]! : child
        ),
      }
      return [plain, null]
    } catch (err) {
      return [null, new Error(`Failed to convert to plain: ${(err as Error).message}`)]
    }
  }

  getTotalCount(): Result<number> {
    try {
      let count = 1
      for (const child of this.subGa) {
        if (child instanceof BaseOngoingGa) {
          const [childCount, err] = child.getTotalCount()
          if (err) return [null, err]
          count += childCount!
        } else {
          count++
        }
      }
      return [count, null]
    } catch (err) {
      return [null, new Error(`Failed to count nodes: ${(err as Error).message}`)]
    }
  }

  getDepth(): Result<number> {
    try {
      if (this.subGa.length === 0) return [1, null]

      let maxChildDepth = 0
      for (const child of this.subGa) {
        if (child instanceof BaseOngoingGa) {
          const [depth, err] = child.getDepth()
          if (err) return [null, err]
          maxChildDepth = Math.max(maxChildDepth, depth!)
        } else {
          maxChildDepth = Math.max(maxChildDepth, 1)
        }
      }

      return [1 + maxChildDepth, null]
    } catch (err) {
      return [null, new Error(`Failed to calculate depth: ${(err as Error).message}`)]
    }
  }

  getAllChildNames(): Result<string[]> {
    try {
      const names = this.subGa.map((child) => child.name)
      return [names, null]
    } catch (err) {
      return [null, new Error(`Failed to get child names: ${(err as Error).message}`)]
    }
  }

  isEmpty(): Result<boolean> {
    return [this.subGa.length === 0, null]
  }
}
