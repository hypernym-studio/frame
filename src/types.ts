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
   */
  play: () => void
  /**
   * Halts the entire frame update loop, pausing all scheduled tasks and animations until `.play()` is explicitly called again.
   *
   * Helps prevent unnecessary processing and save system resources.
   */
  pause: () => void
  /**
   * Allows you to remove a specific callback from the frame update cycle which means no more callback repeats on subsequent frames.
   *
   * This is useful when you need to dynamically remove or cancel a task from the queue without disrupting the rest of the frame update flow.
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
   */
  clear: () => void
  /**
   * Provides a read-only info of the internal frame `state` at any given point.
   *
   * This can include info about the frame’s current `delta`, `timestamp` and `running` status.
   *
   * Useful for debugging and monitoring or for dynamic actions based on the current state of the frame.
   */
  get state(): Readonly<FrameState>
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
   * @default ['read', 'update', 'render']
   */
  phases?: T[]
  /**
   * Specifies the timing mechanism used for scheduling the frame update cycle.
   *
   * This determines how the frame updates are processed, whether through the `requestAnimationFrame` or `setTimeout` timing strategy.
   *
   * For use cases like testing, animation control, or specialized timing (e.g., in non-browser environments), you can specify
   * other ticker mechanism:
   *
   * - `raf` — requestAnimationFrame
   * - `timeout` — setTimeout
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
   * @default undefined
   */
  fps?: number
}

export * from './'
