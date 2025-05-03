export type PhaseIDs = 'read' | 'update' | 'render'

export type PhaseCallback = (state: FrameState) => void

export interface PhaseScheduleOptions {
  /**
   * Specifies whether the phase callback should continue to repeat through each subsequent frame, without stopping after the first execution.
   *
   * Directs the scheduling system to re-run the same task on each frame until explicitly canceled or cleared.
   *
   * By default, the callback will only be executed once.
   *
   * @example
   *
   * ```ts
   * frame.update((state) => console.log(state), { loop: true })
   * ```
   *
   * @default undefined
   */
  loop?: boolean
  /**
   * Specifies the scheduling behavior.
   *
   * By default this is enabled which means the callback waits for the next loop cycle.
   *
   * If disabled, it cancels the scheduling to the next frame and executes at the end of the current frame.
   *
   * @example
   *
   * ```ts
   * let index = 0
   *
   * frame.update(() => {
   *   index++
   *   frame.update(() => index++, { schedule: false })
   * })
   * frame.render(() => console.log('Index: ', index)) // => Index 2
   * ```
   *
   * @default true
   */
  schedule?: boolean
}

export type PhaseSchedule = (
  callback: PhaseCallback,
  options?: PhaseScheduleOptions,
) => PhaseCallback

export interface Phase {
  schedule: PhaseSchedule
  run: (state: FrameState) => void
  cancel: (callback: PhaseCallback) => void
  clear: () => void
}

export interface FrameState {
  delta: number
  timestamp: number
  isRunning: boolean
  isPaused: boolean
}

export type FramePhases<T extends string> = {
  [K in T]: PhaseSchedule
}

export type Frame<T extends string> = {
  /**
   * Unpauses the loop and restores the normal frame update cycle.
   *
   * Ensures that the frame updates continue as expected, without skipping any frames,
   * and the system will continue processing scheduled tasks on each new frame.
   *
   * @example
   *
   * ```ts
   * frame.play()
   * ```
   */
  play: () => void
  /**
   * Halts the entire frame update loop, pausing all scheduled tasks and animations until `.play()` is explicitly called again.
   *
   * Helps prevent unnecessary processing and save system resources.
   *
   * @example
   *
   * ```ts
   * frame.pause()
   * ```
   */
  pause: () => void
  /**
   * Allows you to remove a specific callback from the frame update cycle which means no more callback repeats on subsequent frames.
   *
   * This is useful when you need to dynamically remove or cancel a task from the queue without disrupting the rest of the frame update flow.
   *
   * @example
   *
   * ```ts
   * frame.cancel(frame.read(() => {}))
   * ```
   */
  cancel: (callback: PhaseCallback) => void
  /**
   * Removes all scheduled phases from the frame update cycle and reset the state of the frame.
   *
   * It effectively clears the entire update queue, stopping all scheduled tasks from running on subsequent frames and cancels the ticker.
   * No tasks will be executed until new ones are scheduled.
   *
   * Useful for cleanup or re-initialization, like when starting over or clearing tasks after a specific process completes.
   *
   * It's recommended to call this method when you are sure that there is no need for another frame process,
   * such as before changing routes in meta-frameworks.
   *
   * @example
   *
   * ```ts
   * frame.clear()
   * ```
   */
  clear: () => void
  /**
   * Provides a read-only info of the internal frame `state` at any given point.
   *
   * This can include info about the frame’s current `delta`, `timestamp` and `running` status.
   *
   * Useful for debugging and monitoring or for dynamic actions based on the current state of the frame.
   *
   * @example
   *
   * ```ts
   * frame.state
   * ```
   */
  get state(): Readonly<FrameState>
  /**
   * Provides a read-only number of active frame loops at any given point.
   *
   * Useful for debugging and monitoring or for dynamic actions.
   *
   * @example
   *
   * ```ts
   * frame.activeLoops
   * ```
   */
  get activeLoops(): Readonly<number>
} & FramePhases<T>

export type TickerIDs = 'raf' | 'timeout'

export interface FrameOptions<T extends string> {
  /**
   * Specifies an array of phases that will be executed in strict order during the frame update cycle.
   *
   * Each phase corresponds to a specific point in the frame's execution flow, such as reading input, updating state, or rendering visuals.
   *
   * Useful when need to define own additional phases or reduce them to a specific number.
   * This allows scheduling custom tasks for specific moments in the frame cycle, helping to organize and optimize frame processing.
   *
   * Also, frame dynamically configures type safety under the hood, automatically adjusting and validating types for each phase
   * while preventing runtime errors and ensuring your frame updates are always on track.
   *
   * @example
   *
   * ```ts
   * createFrame({ phases: ['measure', 'mutate'] })
   * ```
   *
   * @default ['read', 'update', 'render']
   */
  phases?: T[]
  /**
   * Specifies the ticking mechanism used to schedule frame update cycles.
   *
   * This determines how frame updates are processed, either via the `requestAnimationFrame` or `setTimeout` timing strategy.
   *
   * - `raf` — requestAnimationFrame
   * - `timeout` — setTimeout
   *
   * @example
   *
   * ```ts
   * createFrame({ ticker: 'timeout' })
   * ```
   *
   * @default 'raf'
   */
  ticker?: TickerIDs
  /**
   * Specifies a fixed rate for the frame update cycle.
   *
   * Useful when you want to control the framerate limit and prevent the frame loop from running at the maximum possible speed
   * (e.g., for performance reasons, consistency, or to match a loop’s intended frame rate).
   *
   * This ensure that the updates are more predictable and not too fast or inconsistent.
   *
   * By default, the frame runs as fast as possible (typically tied to the raf cycle, which is usually 60 FPS or higher).
   *
   * @example
   *
   * ```ts
   * createFrame({ fps: 60 })
   * ```
   *
   * @default undefined
   */
  fps?: number | false
}

export * from './'
