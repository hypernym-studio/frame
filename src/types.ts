export type FrameProcess = (state: FrameState) => void

export interface FrameProcessOptions {
  loop?: boolean
  phase?: number
  immediate?: boolean
}

export interface FramePhase {
  schedule(process: FrameProcess, options?: FrameProcessOptions): FrameProcess
  run(): void
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
  get state(): Readonly<FrameState>
}

export interface FrameOptions {
  scheduler?: (process: VoidFunction) => number | void
  loop?: boolean
}

export * from '@'
