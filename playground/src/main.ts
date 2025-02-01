import { createFrame } from '@'

const frame = createFrame({ fps: 30 })

const handleVisibilityChange = (): void => {
  if (document.hidden) frame.pause()
  else frame.play()
}

document.addEventListener('visibilitychange', handleVisibilityChange)

const el = document.querySelector('.state') as HTMLElement

frame.render(() => console.log('Phase 3: Render'))
frame.update(() => console.log('Phase 2: Update'))
frame.read(() => console.log('Phase 1: Read'))
frame.render(() => console.log('Phase 3: Render'))
frame.read(() => console.log('Phase 1: Read'))

let updateIndex: number = 0
let updateStartTime: number = 0

const onUpdate = frame.update(
  (state) => {
    console.log('Phase 2: Update Loop')

    updateIndex++
    const elapsed = state.timestamp - updateStartTime

    if (elapsed >= 1000) {
      updateStartTime = state.timestamp
    }

    if (updateIndex >= 100) frame.cancel(onUpdate)
  },
  { loop: true },
)

let renderStartTime = 0

const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t

const onRender = frame.render(
  (state) => {
    const elapsedTime = state.timestamp - renderStartTime
    const progress = Math.min(elapsedTime / 4000, 1)
    const position = lerp(0, 900, progress)

    el.innerHTML = `${updateIndex} | ${parseFloat(state.timestamp.toFixed(0))}`
    el.style.transform = `translateX(${position}px)`

    if (position === 900) {
      frame.cancel(onRender)
      console.log('Phase 3: Render Loop Done! ', frame.state)

      frame.clear()
      console.log('Frame cleared: ', frame.state)
    }
  },
  { loop: true },
)
