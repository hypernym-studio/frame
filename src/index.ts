import { isBrowser, defaultState } from './utils'
import type {
  Phase,
  PhaseIDs,
  PhaseCallback,
  PhaseScheduleOptions,
  FrameState,
  FrameOptions,
  Frame,
} from './types'

/**
 * Creates a universal `frame` manager.
 *
 * **Frame** is designed to manage and execute processes in different phases of a frame-based loop,
 * typically used for timed operations, making it ideal for game loops, animations or periodic updates.
 *
 * Organizes processes into distinct default phases (`read`, `update`, `render`),
 * controls timing with FPS and delta time, ensuring smooth execution by syncing
 * with the browser’s `requestAnimationFrame` method (or a fallback in non-browser environments),
 * and allows dynamic configuration of frame phases with automatic type inference for enhanced development experience.
 *
 * **Frame** provides `play`, `pause`, `cancel` and `clear` methods for powerful control over the execution of the frame cycle,
 * allowing advanced manipulation of when the frame loop should continue or wait for next update.
 *
 * These methods are super useful in situations where you need to manage the frame dynamically,
 * such as when the user switches tabs and returns to the page.
 *
 * @example
 *
 * ```ts
 * import { createFrame } from '@hypernym/frame'
 *
 * const frame = createFrame()
 *
 * let index = 0
 *
 * // Adds a custom callback to the `update` phase and enables looping
 *
 * const onUpdate = frame.update(
 *   (state) => {
 *     console.log('Update Phase Loop')
 *
 *     index++
 *
 *     if (index > 100) {
 *       frame.cancel(onUpdate)
 *       console.log('Update Phase Loop: Done!', state)
 *     }
 *   },
 *   { loop: true },
 * )
 * ```
 *
 * Also, it's possible to create a `frame` manager with custom phases.
 *
 * Frame will automatically handle everything based on the defined values, with full type safety and autocompletion,
 * ensuring a seamless development experience.
 *
 * @example
 *
 * ```ts
 * import { createFrame } from '@hypernym/frame'
 *
 * // Creates a new `frame` manager with custom phases `measure` and `mutate`
 * // These custom phases will replace the default ones (s'read', 'update', 'render')
 * const frame = createFrame({ phases: ['measure', 'mutate'] })
 *
 * // Adds a custom callback to the `measure` phase
 * frame.measure(() => {
 *   console.log('measure')
 * })
 *
 * // Adds a custom callback to the `mutate` phase
 * frame.mutate(() => {
 *   console.log('mutate')
 * })
 *
 * // Clears all callbacks from phases, resets state and cancels ticker
 * frame.clear()
 * ```
 *
 * @see [Repository](https://github.com/hypernym-studio/frame)
 */
export function createFrame<T extends string = PhaseIDs>(
  options: FrameOptions<T> = {},
): Frame<T> {
  let {
    phases: framePhases = ['read', 'update', 'render'] as T[],
    ticker = 'raf',
    fps,
  } = options

  const phases = {} as Record<T, Phase>
  const loops = new Set<PhaseCallback>()

  let tickerId: number | null = null
  let shouldRunTicker: boolean = false
  let isPaused: boolean = false

  const frameInterval: number = 1000 / (fps || 60)
  let lastFrameTime: number = 0
  let lastPauseTime: number | null = null
  let totalPausedTime: number = 0
  let useFrameInterval: boolean = true

  let state: FrameState = defaultState()

  const phase = (callback: (id: Phase) => void): void =>
    framePhases.forEach((id) => callback(phases[id]))

  const createPhase = (): Phase => {
    let thisFrame = new Set<PhaseCallback>()
    let nextFrame = new Set<PhaseCallback>()

    let isRunning: boolean = false
    let flushNextFrame: boolean = false

    const runPhaseCallback = (callback: PhaseCallback): void => {
      if (loops.has(callback)) phase.schedule(callback)
      callback(state)
    }

    const swapFrames = () => ([thisFrame, nextFrame] = [nextFrame, thisFrame])

    const phase: Phase = {
      schedule: (
        callback: PhaseCallback,
        { loop, schedule = true }: PhaseScheduleOptions = {},
      ): PhaseCallback => {
        const queue = isRunning && !schedule ? thisFrame : nextFrame
        if (loop) loops.add(callback)
        if (!queue.has(callback)) queue.add(callback)
        return callback
      },
      run: (state: FrameState): void => {
        if (isRunning) {
          flushNextFrame = true
          return
        }

        isRunning = true

        swapFrames()
        thisFrame.forEach(runPhaseCallback)
        thisFrame.clear()

        isRunning = false

        if (flushNextFrame) {
          flushNextFrame = false
          phase.run(state)
        }
      },
      cancel: (callback: PhaseCallback): void => {
        nextFrame.delete(callback)
        loops.delete(callback)
      },
      clear: (): void => {
        thisFrame.clear()
        nextFrame.clear()
      },
    }
    return phase
  }

  const runTicker = (): void => {
    if (ticker === 'raf') {
      if (isBrowser) tickerId = requestAnimationFrame(runFrame)
    } else {
      const now = performance.now()
      tickerId = setTimeout(
        () => runFrame(now),
        Math.max(0, frameInterval - (now - lastFrameTime)),
      ) as unknown as number
    }
  }

  const cancelTicker = (): void => {
    if (ticker === 'raf') {
      if (isBrowser && tickerId) {
        cancelAnimationFrame(tickerId)
        tickerId = null
      }
    } else {
      if (tickerId) {
        clearTimeout(tickerId)
        tickerId = null
      }
    }
  }

  const runFrame = (timestamp: number): void => {
    const time = timestamp - totalPausedTime
    shouldRunTicker = loops.size > 0

    if (fps) {
      const delta = time - lastFrameTime
      if (delta < frameInterval) {
        runTicker()
        return
      }
      lastFrameTime = time - (delta % frameInterval)
    }

    state.delta = useFrameInterval ? frameInterval : time - state.timestamp
    state.timestamp = time
    state.isPaused = isPaused

    state.isRunning = true

    phase((id) => id.run(state))

    state.isRunning = false

    if (shouldRunTicker && !isPaused) {
      useFrameInterval = false
      runTicker()
    } else cancelTicker()
  }

  const frame: Frame<T> = {
    play: (): void => {
      if (isPaused && shouldRunTicker) {
        isPaused = false
        const now = performance.now()
        if (lastPauseTime) {
          totalPausedTime += now - lastPauseTime
          lastPauseTime = null
        }
        lastFrameTime = now - totalPausedTime
        state.timestamp = lastFrameTime
        runTicker()
      }
    },
    pause: (): void => {
      if (!isPaused) {
        isPaused = true
        cancelTicker()
        lastPauseTime = performance.now()
      }
    },
    cancel: (callback: PhaseCallback): void => {
      phase((id) => id.cancel(callback))
    },
    clear: (): void => {
      state = defaultState()
      phase((id) => id.clear())
      cancelTicker()
      shouldRunTicker = false
    },
    get state(): Readonly<FrameState> {
      return state
    },
  } as Frame<T>

  framePhases.forEach((id) => {
    phases[id] = createPhase()
    frame[id] = ((
      callback: PhaseCallback,
      options: PhaseScheduleOptions = {},
    ) => {
      if (!shouldRunTicker) {
        useFrameInterval = true
        lastFrameTime = performance.now()
        runTicker()
      }
      return phases[id].schedule(callback, options)
    }) as Frame<T>[T]
  })

  return frame
}
