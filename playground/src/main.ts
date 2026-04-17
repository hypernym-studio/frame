import { createFrame } from '@'

const frame = createFrame()

frame.add(({ timestamp, delta, isRunning }) => {
  console.log('Run once (1)', timestamp, delta, isRunning)

  frame.add(({ timestamp, delta, isRunning }) => {
    console.log('Run once (3)', timestamp, delta, isRunning)
  })
})

frame.add(({ timestamp, delta, isRunning }) => {
  console.log('Run once (2)', timestamp, delta, isRunning)

  frame.add(({ timestamp, delta, isRunning }) => {
    console.log('Run once (4)', timestamp, delta, isRunning)
  })
})

let resolve: (value: boolean) => void

const completed = new Promise((res) => {
  resolve = res
})

let index = 0

const process = frame.add(
  ({ timestamp, delta, isRunning }) => {
    index++

    console.log(`Loop (${index})`, timestamp, delta, isRunning)

    if (index >= 33) {
      frame.delete(process)
      resolve(true)
    }
  },
  { loop: true },
)

completed.then(() => {
  console.log('Frame State', frame.state)

  requestAnimationFrame(() => {
    frame.add(({ timestamp, delta, isRunning }) => {
      console.log('Run once (final)', timestamp, delta, isRunning)
    })
  })
})
