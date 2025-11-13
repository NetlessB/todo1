import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { Ga, ResultError } from './models/ga.model'

export const usePendingGa = defineStore('pendingGa', () => {
  const rootOfGa = ref<Ga>(
    reactive({
      name: 'Root_Ga',
      subGa: [],
    }),
  )

  let onChangeCallback: ((newVal: Ga) => void) | null = null

  function setOnChange(cb: (newVal: Ga) => void): void {
    if (typeof cb !== 'function') {
      throw new Error('setOnChange expects a function')
    }
    onChangeCallback = cb
  }

  function clearOnChange(): void {
    onChangeCallback = null
  }

  function onChange(newVal: Ga): void {
    if (!onChangeCallback) return

    try {
      onChangeCallback(newVal)
    } catch (err) {
      console.error('Error in onChange callback:', err)
    }
  }

  function buildGa(name: string, subGa?: Ga[]): Ga {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid Ga name: must be a non-empty string')
    }

    if (subGa !== undefined && !Array.isArray(subGa)) {
      throw new Error('Invalid subGa: must be an array of Ga or undefined')
    }

    const ga = {
      name: name.trim(),
      subGa: subGa ?? [],
    } satisfies Ga

    return reactive(ga)
  }

  function newGaAt(name: string, at: Ga, index?: number): ResultError {
    if (!at || typeof at !== 'object') {
      return new Error('Invalid Ga object')
    }

    if (!Array.isArray(at.subGa)) {
      return new Error('Invalid Ga structure: subGa must be an array')
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return new Error('Invalid name for Ga')
    }

    const findGa = at.subGa.find((a) => a.name === name)
    if (findGa) {
      return new Error(`Duplicate Ga name: '${name}'`)
    }

    const theGa = buildGa(name)
    const invalidIndex =
      typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= at.subGa.length

    if (invalidIndex) at.subGa.push(theGa)
    else at.subGa.splice(index!, 0, theGa)

    // Change happened → notify
    onChange(rootOfGa.value)

    return null
  }

  function removeGaAtIndexOf(index: number, of: Ga[]): ResultError {
    if (!Array.isArray(of)) {
      return new Error('Invalid input: "of" must be an array of Ga')
    }

    if (!Number.isInteger(index)) {
      return new Error(`Invalid index: must be an integer, got ${index}`)
    }

    if (index < 0 || index >= of.length) {
      return new Error(`Index out of range: ${index}`)
    }

    of.splice(index, 1)

    // Change happened → notify
    onChange(rootOfGa.value)

    return null
  }

  function removeGaAt(name: string, at: Ga): ResultError {
    if (!at || typeof at !== 'object' || !Array.isArray(at.subGa)) {
      return new Error('Invalid Ga structure: "subGa" must be an array')
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return new Error('Invalid Ga name: must be a non-empty string')
    }

    const indexOfGa = at.subGa.findIndex((a) => a.name === name)
    if (indexOfGa < 0) {
      return new Error(`No Sub-Ga named "${name}" found inside "${at.name}"`)
    }

    const err = removeGaAtIndexOf(indexOfGa, at.subGa)
    if (err) return new Error(`Failed to remove Ga "${name}" from "${at.name}": ${err.message}`)

    // notify is already done inside removeGaAtIndexOf
    return null
  }

  async function initFromJsonBin(): Promise<ResultError> {
    const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID
    const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY

    if (!BIN_ID || !API_KEY) {
      return new Error('JSON Bin credentials missing in environment variables')
    }

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: {
          'X-Master-Key': API_KEY,
        },
      })

      if (!res.ok) {
        return new Error(`Failed to fetch JSON Bin: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      if (!data || !data.record) {
        return new Error('Invalid JSON Bin response structure')
      }

      const gaData = data.record as Ga
      rootOfGa.value = reactive(gaData)

      // Loading data is a change
      onChange(rootOfGa.value)

      return null
    } catch (err: unknown) {
      return new Error(`Error fetching JSON Bin: ${(err as Error).message}`)
    }
  }

  async function updateJsonBin(): Promise<ResultError> {
    const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID
    const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY

    if (!BIN_ID || !API_KEY) {
      return new Error('JSON Bin credentials missing in environment variables')
    }

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify(rootOfGa.value),
      })

      if (!res.ok) {
        return new Error(`Failed to update JSON Bin: ${res.status} ${res.statusText}`)
      }

      return null
    } catch (err: unknown) {
      return new Error(`Error updating JSON Bin: ${(err as Error).message}`)
    }
  }

  return {
    rootOfGa,
    buildGa,
    newGaAt,
    removeGaAtIndexOf,
    removeGaAt,
    initFromJsonBin,
    updateJsonBin,
    setOnChange,
    clearOnChange,
    onChange,
  }
})
