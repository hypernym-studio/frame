import type {
  FrameProcess,
  FrameProcessOptions,
  FramePhase,
  FrameState,
  FrameOptions,
  Frame,
} from './types'

/**
 * Creates a universal `frame` manager.
 *
 * @example
 *
 * ```ts
 * import { createFrame } from '@hypernym/frame'
 *
 * const frame = createFrame()
 *
 * const process = frame.add((state) => console.log(state), { loop: true }) // Adds the process
 *
 * frame.delete(process) // Deletes a specific process
 *
 * frame.add((state) => console.log(state), { phase: 1 }) // Adds the process to a specific phase (default is 0)
 *
 * frame.delete() // Deletes all processes, phases and resets the frame state
 * ```
 *
 * @see [Repository](https://github.com/hypernym-studio/frame)
 */
export function createFrame(options: FrameOptions = {}): Frame {
  let {
    scheduler = typeof window !== 'undefined'
      ? requestAnimationFrame
      : undefined,
    loop: allowLoop = true,
  } = options

  let order: number[] = []
  const phases = new Map<number, FramePhase>()
  let loops = new WeakSet<FrameProcess>()

  const maxDelta = 40
  let useDefaultDelta = true
  let isScheduled = false
  let runNextFrame = false

  const defaultState = (): FrameState => ({
    delta: 0,
    timestamp: 0,
    isRunning: false,
  })
  let state: FrameState = defaultState()

  const createPhase = (): FramePhase => {
    let thisFrame = new Set<FrameProcess>()
    let nextFrame = new Set<FrameProcess>()

    let isRunning = false
    let flushNextFrame = false

    const runProcess = (process: FrameProcess): void => {
      if (allowLoop && loops.has(process)) {
        runNextFrame = true
        phase.schedule(process, { loop: true })
      }
      process(state)
    }

    const phase: FramePhase = {
      schedule(
        process: FrameProcess,
        { loop, immediate }: FrameProcessOptions = {},
      ): FrameProcess {
        const queue = immediate && isRunning ? thisFrame : nextFrame
        const isLoop = allowLoop && loop

        if (!isLoop) runNextFrame = true
        if (isLoop && !loops.has(process)) loops.add(process)
        queue.add(process)

        return process
      },
      run(): void {
        if (isRunning) {
          flushNextFrame = true
          return
        }

        isRunning = true
        const prevFrame = thisFrame
        thisFrame = nextFrame
        nextFrame = prevFrame
        thisFrame.forEach(runProcess)
        thisFrame.clear()
        isRunning = false

        if (flushNextFrame) {
          flushNextFrame = false
          phase.run()
        }
      },
      delete(process: FrameProcess): void {
        nextFrame.delete(process)
        loops.delete(process)
      },
    }

    return phase
  }

  const scheduleFrame = (): void => {
    if (!isScheduled) {
      isScheduled = true
      scheduler?.(runFrame)
    }
  }

  const runFrame = (): void => {
    isScheduled = runNextFrame = false

    const now = performance.now()

    state.delta = useDefaultDelta
      ? 1000 / 60
      : Math.min(Math.max(now - state.timestamp, 1), maxDelta)

    state.timestamp = now
    state.isRunning = true
    order.forEach((p) => phases.get(p)?.run())
    state.isRunning = false

    useDefaultDelta = !runNextFrame

    if (runNextFrame) scheduleFrame()
  }

  return {
    add(
      process: FrameProcess,
      { phase = 0, ...opts }: FrameProcessOptions = {},
    ): FrameProcess {
      if (!scheduler) return () => {}
      let p = phases.get(phase)
      if (!p) {
        order.push(phase)
        order.sort((a, b) => a - b)
        p = createPhase()
        phases.set(phase, p)
      }
      if (!state.isRunning) scheduleFrame()
      return p.schedule(process, opts)
    },
    delete(process?: FrameProcess): void {
      if (arguments.length) {
        if (process) phases.forEach((p) => p.delete(process))
        return
      }
      phases.clear()
      order = []
      loops = new WeakSet()
      state = defaultState()
      isScheduled = runNextFrame = false
    },
    get state(): Readonly<FrameState> {
      return state
    },
  }
}
