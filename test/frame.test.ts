// @vitest-environment jsdom

import { createFrame } from '@'
import { describe, test } from 'vitest'

describe('Frame Manager', () => {
  test('should create a frame manager', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      const results: boolean[] = []

      results.push(frame ? true : false)
      results.push(frame.state.delta === 0 ? true : false)
      results.push(frame.state.timestamp === 0 ? true : false)
      results.push(frame.state.isRunning === false ? true : false)

      return results.every((v) => v === true) ? resolve() : reject()
    })
  })

  test('should run phases in the correct order: 0 -> 1 -> 2', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      const phases: string[] = []

      frame.add(() => phases.push('phase 2'), { phase: 2 })
      frame.add(() => phases.push('phase 1'), { phase: 1 })
      frame.add(() => phases.push('phase 0'))
      frame.add(() => phases.push('phase 2'), { phase: 2 })
      frame.add(() => phases.push('phase 0'))
      frame.add(() => phases.push('phase 1'), { phase: 1 })

      const order = [
        'phase 0',
        'phase 0',
        'phase 1',
        'phase 1',
        'phase 2',
        'phase 2',
      ]

      return phases.every((v, i) => v === order[i]) ? resolve() : reject()
    })
  })

  test('should remove a specific callback from the frame cycle', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      let isTriggered = false

      const process = frame.add(() => (isTriggered = true))
      frame.add(() => frame.delete(process), { phase: 1 })

      return !isTriggered ? resolve() : reject()
    })
  })

  test('should continue to repeat through each subsequent frame', () => {
    return new Promise<void>((resolve) => {
      const frame = createFrame()

      let index = 0

      frame.add(() => index++, { loop: true })
      frame.add(
        () => {
          if (index >= 3) {
            frame.delete()
            resolve()
          }
        },
        { loop: true },
      )
    })
  })

  test('should cancel the scheduling and execute at the end of the current frame', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      let index = 0

      frame.add(() => {
        index++
        frame.add(() => index++, { schedule: false })
      })
      frame.add(() => (index === 2 ? resolve() : reject()), { phase: 1 })
    })
  })
})
