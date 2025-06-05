import type { FrameState } from './types'

export const defaultState = (): FrameState => ({
  delta: 0.0,
  timestamp: 0.0,
  isRunning: false,
  isPaused: false,
})
