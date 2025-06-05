import { defaultState } from './utils'
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
 * Creates a compact `frame` manager.
 *
 * @example
 *
 * ```ts
 * import { createFrame } from '@hypernym/frame/compact'
 *
 * const frame = createFrame()
 *
 * frame.update((state) => console.log(state), { loop: true })
 * ```
 *
 * @see [Repository](https://github.com/hypernym-studio/frame)
 */
export function createFrame<T extends string = PhaseIDs>(
  options: FrameOptions<T> = {},
): Frame<T> {
  let {
    phases: framePhases = ['read', 'update', 'render'] as T[],
    scheduler = typeof window !== 'undefined'
      ? requestAnimationFrame
      : () => {},
    allowLoop = true,
    fps,
  } = options

  const phases = {} as Record<T, Phase>

  let loops = new WeakSet<PhaseCallback>()
  let activeLoops = 0

  let shouldRunFrame = false
  let isStopped = false

  const frameInterval = 1000 / (fps || 60)
  const maxDeltaTime = 40
  let lastFrameTime = 0
  let lastPauseTime: number | null = null
  let totalPausedTime = 0

  let state: FrameState = defaultState()

  const phase = (callback: (id: Phase) => void): void =>
    framePhases.forEach((id) => callback(phases[id]))

  const createPhase = (): Phase => {
    let thisFrame = new Set<PhaseCallback>()
    let nextFrame = new Set<PhaseCallback>()

    let isRunning = false
    let flushNextFrame = false

    const runPhaseCallback = (callback: PhaseCallback): void => {
      if (loops.has(callback)) phase.schedule(callback)
      callback(state)
    }

    const phase: Phase = {
      schedule: (
        callback: PhaseCallback,
        { loop, schedule = true }: PhaseScheduleOptions = {},
      ): PhaseCallback => {
        const queue = isRunning && !schedule ? thisFrame : nextFrame
        if (loop) {
          if (!loops.has(callback)) activeLoops++
          loops.add(callback)
        }
        if (!queue.has(callback)) queue.add(callback)
        return callback
      },
      run: (state: FrameState): void => {
        if (isRunning) {
          flushNextFrame = true
          return
        }

        isRunning = true
        ;[thisFrame, nextFrame] = [nextFrame, thisFrame]
        thisFrame.forEach(runPhaseCallback)
        thisFrame.clear()
        isRunning = false

        if (flushNextFrame) {
          flushNextFrame = false
          phase.run(state)
        }
      },
      cancel: (callback?: PhaseCallback): void => {
        if (!callback) {
          thisFrame.clear()
          nextFrame.clear()
          return
        }
        nextFrame.delete(callback)
        if (loops.has(callback)) activeLoops--
        loops.delete(callback)
      },
    }
    return phase
  }

  const runFrame = (): void => {
    if (isStopped) return

    const now = performance.now()
    const time = now - totalPausedTime

    shouldRunFrame = activeLoops > 0

    if (fps) {
      const delta = time - lastFrameTime
      if (delta < frameInterval) {
        if (!isStopped) scheduler(runFrame)
        return
      }
      lastFrameTime = time - (delta % frameInterval)
      state.delta = frameInterval
    } else {
      state.delta =
        state.timestamp === 0
          ? frameInterval
          : Math.min(Math.max(time - state.timestamp, 1), maxDeltaTime)
      lastFrameTime = time
    }

    state.timestamp = time
    state.isRunning = true
    phase((id) => id.run(state))
    state.isRunning = false

    if (shouldRunFrame && allowLoop && !isStopped) scheduler(runFrame)
  }

  const frame: Frame<T> = {
    start: (): void => {
      if (isStopped && shouldRunFrame) {
        isStopped = false
        const now = performance.now()
        if (lastPauseTime) {
          totalPausedTime += now - lastPauseTime
          lastPauseTime = null
        }
        lastFrameTime = now - totalPausedTime
        state.timestamp = lastFrameTime
        scheduler(runFrame)
      }
    },
    stop: (): void => {
      if (!isStopped) {
        isStopped = true
        lastPauseTime = performance.now()
      }
    },
    cancel: (callback?: PhaseCallback): void => {
      if (!callback) {
        state = defaultState()
        loops = new WeakSet()
        activeLoops = 0
        phase((id) => id.cancel())
        shouldRunFrame = false
        return
      }
      phase((id) => id.cancel(callback))
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
      if (!shouldRunFrame) {
        shouldRunFrame = true
        lastFrameTime = performance.now()
        scheduler(runFrame)
      }
      return phases[id].schedule(callback, options)
    }) as Frame<T>[T]
  })

  return frame
}
