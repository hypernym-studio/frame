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
      : () => {},
    loop: allowLoop = true,
    fps,
  } = options

  const phases = new Map<number, FramePhase>()
  let order: number[] = []

  let pending = 0
  let activeLoops = 0
  let loops = new WeakSet<FrameProcess>()

  const maxDeltaTime = 40
  let frameInterval = 1000 / (fps || 60)
  let lastTime = 0
  let lastPauseTime = 0
  let totalPausedTime = 0
  let isStopped = false

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
        phase.schedule(process, { loop: true })
      } else if (pending > 0) {
        pending--
      }
      process(state)
    }

    const phase: FramePhase = {
      schedule(
        process: FrameProcess,
        { loop, schedule = true }: FrameProcessOptions = {},
      ): FrameProcess {
        const queue = isRunning && !schedule ? thisFrame : nextFrame
        if (!loop || !allowLoop) pending++
        if (allowLoop && loop && !loops.has(process)) {
          loops.add(process)
          activeLoops++
        }
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
        if (nextFrame.delete(process) && !loops.has(process) && pending > 0) {
          pending--
        }
        if (allowLoop && loops.delete(process)) activeLoops--
      },
    }

    return phase
  }

  const runFrame = (): void => {
    if (isStopped) return

    const now = performance.now()
    const time = now - totalPausedTime

    if (fps) {
      const delta = time - lastTime
      if (delta < frameInterval) {
        if (!isStopped) scheduler(runFrame)
        return
      }
      lastTime = time - (delta % frameInterval)
      state.delta = frameInterval
    } else {
      state.delta =
        state.timestamp === 0
          ? frameInterval
          : Math.min(Math.max(time - state.timestamp, 1), maxDeltaTime)
      lastTime = time
    }

    state.timestamp = time
    state.isRunning = true
    order.forEach((p) => phases.get(p)?.run())
    state.isRunning = false

    if ((allowLoop && activeLoops > 0) || pending > 0) {
      scheduler(runFrame)
    }
  }

  return {
    add(
      process: FrameProcess,
      { phase = 0, ...opts }: FrameProcessOptions = {},
    ): FrameProcess {
      let p = phases.get(phase)
      if (!p) {
        order.push(phase)
        order.sort((a, b) => a - b)
        p = createPhase()
        phases.set(phase, p)
      }
      if (pending === 0 && activeLoops === 0) {
        lastTime = performance.now()
        scheduler(runFrame)
      }
      return p.schedule(process, { phase, ...opts })
    },
    delete(process?: FrameProcess): void {
      if (process) return phases.forEach((id) => id.delete(process))
      phases.clear()
      order = []
      loops = new WeakSet()
      state = defaultState()
      pending = activeLoops = lastTime = lastPauseTime = totalPausedTime = 0
      isStopped = false
    },
    start(): void {
      if (isStopped) {
        isStopped = false
        const now = performance.now()
        if (lastPauseTime) {
          totalPausedTime += now - lastPauseTime
          lastPauseTime = 0
        }
        state.timestamp = lastTime = now - totalPausedTime
        scheduler(runFrame)
      }
    },
    stop(): void {
      if (!isStopped) {
        isStopped = true
        lastPauseTime = performance.now()
      }
    },
    get state(): Readonly<FrameState> {
      return state
    },
    get fps(): number {
      return fps || Infinity
    },
    set fps(v) {
      frameInterval = 1000 / (v || 60)
      fps = v
    },
  }
}
