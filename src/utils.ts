import type { FrameState } from './types'

export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

export const defaultState = (): FrameState => ({
  delta: 0.0,
  timestamp: 0.0,
  isRunning: false,
  isPaused: false,
})
