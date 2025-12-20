export type FrameProcess = (state: FrameState) => void

export interface FrameProcessOptions {
  loop?: boolean
  phase?: number
  schedule?: boolean
}

export interface FramePhase {
  schedule(process: FrameProcess, options?: FrameProcessOptions): FrameProcess
  add(state: FrameState): void
  delete(process: FrameProcess): void
}

export interface FrameState {
  delta: number
  timestamp: number
  isRunning: boolean
}

export interface Frame {
  add(process: FrameProcess, options?: FrameProcessOptions): FrameProcess
  delete(process?: FrameProcess): void
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
