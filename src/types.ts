export type Process = (state: FrameState) => void

export interface ProcessOptions {
  loop?: boolean
  phase?: number
  schedule?: boolean
}

export interface Phase {
  schedule(process: Process, options?: ProcessOptions): Process
  add(state: FrameState): void
  delete(process: Process): void
}

export interface FrameState {
  delta: number
  timestamp: number
  isRunning: boolean
}

export interface Frame {
  add(process: Process, options?: ProcessOptions): Process
  delete(process?: Process): void
  start(): void
  stop(): void
  get state(): Readonly<FrameState>
  get fps(): number
  set fps(v: number)
}

export interface FrameOptions {
  scheduler?: (process: VoidFunction) => number | void
  loop?: boolean
  fps?: number
}

export * from '@'
