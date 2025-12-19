import type {
  Process,
  ProcessOptions,
  Phase,
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

  const phases = new Map<number, Phase>()
  let order: number[] = []

  let loops = new WeakSet<Process>()
  let activeLoops = 0

  let shouldRun = false
  let isStopped = false

  const maxDeltaTime = 40
  let frameInterval = 1000 / (fps || 60)
  let lastTime = 0
  let lastPauseTime = 0
  let totalPausedTime = 0

  const defaultState = () => ({ delta: 0, timestamp: 0, isRunning: false })
  let state: FrameState = defaultState()

  const createPhase = (): Phase => {
    let thisFrame = new Set<Process>()
    let nextFrame = new Set<Process>()

    let isRunning = false
    let flushNextFrame = false

    const runProcess = (process: Process): void => {
      if (loops.has(process)) phase.schedule(process)
      process(state)
    }

    const phase: Phase = {
      schedule(
        process: Process,
        { loop, schedule = true }: ProcessOptions = {},
      ): Process {
        const queue = isRunning && !schedule ? thisFrame : nextFrame
        if (loop && !loops.has(process)) {
          loops.add(process)
          activeLoops++
        }
        queue.add(process)
        return process
      },
      add(state: FrameState): void {
        if (isRunning) {
          flushNextFrame = true
          return
        }

        isRunning = true
        ;[thisFrame, nextFrame] = [nextFrame, thisFrame]
        thisFrame.forEach(runProcess)
        thisFrame.clear()
        isRunning = false

        if (flushNextFrame) {
          flushNextFrame = false
          phase.add(state)
        }
      },
      delete(process: Process): void {
        nextFrame.delete(process)
        if (loops.delete(process)) activeLoops--
        if (!activeLoops) shouldRun = false
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
    order.forEach((p) => phases.get(p)?.add(state))
    state.isRunning = false

    if (shouldRun && allowLoop && !isStopped) scheduler(runFrame)
  }

  return {
    add(
      process: Process,
      { phase = 0, ...opts }: ProcessOptions = {},
    ): Process {
      let p = phases.get(phase)
      if (!p) {
        order.push(phase)
        order.sort((a, b) => a - b)
        p = createPhase()
        phases.set(phase, p)
      }
      if (!shouldRun) {
        shouldRun = true
        lastTime = performance.now()
        scheduler(runFrame)
      }
      return p.schedule(process, { phase, ...opts })
    },
    delete(process?: Process): void {
      if (process) return phases.forEach((id) => id.delete(process))
      phases.clear()
      order = []
      loops = new WeakSet()
      state = defaultState()
      activeLoops = lastTime = lastPauseTime = totalPausedTime = 0
      shouldRun = isStopped = false
    },
    start(): void {
      if (isStopped && shouldRun) {
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
