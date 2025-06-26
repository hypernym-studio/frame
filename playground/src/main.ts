import { createFrame } from '@'

const frame = createFrame({ fps: 30 })

const handleVisibilityChange = (): void => {
  if (document.hidden) frame.stop()
  else frame.start()
}

document.addEventListener('visibilitychange', handleVisibilityChange)

const el = document.querySelector('.state') as HTMLElement

frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 1: Update'), { phase: 1 })
frame.add(() => console.log('Phase 0: Read'))
frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 0: Read'))

let updateIndex: number = 0
let updateStartTime: number = 0

const onUpdate = frame.add(
  (state) => {
    console.log('Phase 1: Update Loop')

    updateIndex++
    const elapsed = state.timestamp - updateStartTime

    if (elapsed >= 1000) {
      updateStartTime = state.timestamp
    }

    if (updateIndex >= 100) frame.delete(onUpdate)
  },
  { loop: true, phase: 1 },
)

let renderStartTime = 0

const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t

const onRender = frame.add(
  (state) => {
    const elapsedTime = state.timestamp - renderStartTime
    const progress = Math.min(elapsedTime / 4000, 1)
    const position = lerp(0, 900, progress)

    el.innerHTML = `${updateIndex} | ${parseFloat(state.timestamp.toFixed(0))}`
    el.style.transform = `translateX(${position}px)`

    if (position === 900) {
      frame.delete(onRender)
      console.log('Phase 2: Render Loop Done! ', frame.state)

      frame.delete()
      console.log('Frame cleared: ', frame.state)
    }
  },
  { loop: true, phase: 2 },
)
