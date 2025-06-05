export type PhaseIDs = 'read' | 'update' | 'render'

export type PhaseCallback = (state: FrameState) => void

export interface PhaseScheduleOptions {
  loop?: boolean
  schedule?: boolean
}

export type PhaseSchedule = (
  callback: PhaseCallback,
  options?: PhaseScheduleOptions,
) => PhaseCallback

export interface Phase {
  schedule: PhaseSchedule
  run: (state: FrameState) => void
  cancel: (callback?: PhaseCallback) => void
}

export interface FrameState {
  delta: number
  timestamp: number
  isRunning: boolean
}

export type FramePhases<T extends string> = {
  [K in T]: PhaseSchedule
}

export type Frame<T extends string> = {
  start: () => void
  stop: () => void
  cancel: (callback?: PhaseCallback) => void
  get state(): Readonly<FrameState>
} & FramePhases<T>

export interface FrameOptions<T extends string> {
  phases?: T[]
  scheduler?: (callback: VoidFunction) => number | void
  allowLoop?: boolean
  fps?: number | false
}

export * from './'
