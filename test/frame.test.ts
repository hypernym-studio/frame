// @vitest-environment jsdom

import { createFrame } from '@'
import { describe, test } from 'vitest'

describe('Frame Manager', () => {
  test('should create a frame manager with default phases', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      const results: boolean[] = []

      results.push(frame ? true : false)
      results.push(frame.state.delta === 0 ? true : false)
      results.push(frame.state.timestamp === 0 ? true : false)
      results.push(frame.state.isRunning === false ? true : false)
      results.push(frame.state.isPaused === false ? true : false)

      return results.every((v) => v === true) ? resolve() : reject()
    })
  })

  test('should run phases in the correct order: read -> update -> render', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      const phases: string[] = []

      frame.render(() => phases.push('render'))
      frame.update(() => phases.push('update'))
      frame.read(() => phases.push('read'))
      frame.render(() => phases.push('render'))
      frame.read(() => phases.push('read'))
      frame.update(() => phases.push('update'))

      const order = ['read', 'read', 'update', 'update', 'render', 'render']

      return phases.every((v, i) => v === order[i]) ? resolve() : reject()
    })
  })

  test('should run custom phases in the correct order: measure -> mutate', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame({ phases: ['measure', 'mutate'] })

      const phases: string[] = []

      frame.mutate(() => phases.push('mutate'))
      frame.measure(() => phases.push('measure'))
      frame.mutate(() => phases.push('mutate'))
      frame.measure(() => phases.push('measure'))
      frame.mutate(() => phases.push('mutate'))
      frame.mutate(() => phases.push('mutate'))

      const order = [
        'measure',
        'measure',
        'measure',
        'mutate',
        'mutate',
        'mutate',
      ]

      return phases.every((v, i) => v === order[i]) ? resolve() : reject()
    })
  })

  test('should remove a specific callback from the frame cycle', () => {
    return new Promise<void>((resolve, reject) => {
      const frame = createFrame()

      let isTriggered = false

      const onUpdate = frame.update(() => (isTriggered = true))
      frame.render(() => frame.cancel(onUpdate))

      return !isTriggered ? resolve() : reject()
    })
  })

  test('should continue to repeat through each subsequent frame', () => {
    return new Promise<void>((resolve) => {
      const frame = createFrame()

      let index = 0

      frame.update(() => index++, { loop: true })
      frame.render(
        () => {
          if (index >= 3) {
            frame.clear()
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

      frame.update(() => {
        index++
        frame.update(() => index++, { schedule: false })
      })
      frame.render(() => (index === 2 ? resolve() : reject()))
    })
  })
})
