<h1 align="center">@hypernym/frame</h1>

<p align="center">Universal Frame Manager.</p>

<p align="center">
  <a href="https://github.com/hypernym-studio/frame">Repository</a>
  <span>✦</span>
  <a href="https://www.npmjs.com/package/@hypernym/frame">Package</a>
  <span>✦</span>
  <a href="https://github.com/hypernym-studio/frame/releases">Releases</a>
  <span>✦</span>
  <a href="https://github.com/hypernym-studio/frame/discussions">Discussions</a>
</p>

<br>

<pre align="center">pnpm add @hypernym/frame</pre>

<p align="center">
  <sub>Package size: <code>~1.28 KB</code> minified, <code>~705 B</code> gzip</sub>
</p>

<br>

## Features

- Ultra Lightweight & Powerful
- Framework Independent
- Written in TypeScript
- Native SSR Support
- No External Dependencies
- API Friendly

## Core Concepts

- Frame Scheduling
- Dynamic Phases
- Strict Queue Order
- Custom Scheduler
- Frame Controls
- FPS Managment
- Frame State
- Modular Code
- Type-safe

## Installation

```sh
pnpm add @hypernym/frame
```

```sh
npm install @hypernym/frame
```

## CDN

### ESM (minified)

```html
<script type="module">
  import { createFrame } from 'https://unpkg.com/@hypernym/frame/dist/index.min.js'
  const frame = createFrame()
</script>
```

### IIFE (minified)

```html
<script src="https://unpkg.com/@hypernym/frame/dist/index.iife.js"></script>
<script>
  const { createFrame } = Frame
  const frame = createFrame()
</script>
```

### UMD (minified)

```html
<script src="https://unpkg.com/@hypernym/frame/dist/index.umd.js"></script>
<script>
  const { createFrame } = Frame
  const frame = createFrame()
</script>
```

## Quick Start

Creates a `frame` manager with the default phase.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame()

let index = 0

// Adds a custom process to the `default` phase and enables looping
const process = frame.add(
  (state) => {
    index++
    console.log('Process Loop', index)

    if (index > 100) {
      frame.delete(process)
      console.log('Process Loop: Done!', state)
    }
  },
  { loop: true },
)
```

Each phase is executed in strictly ascending numerical order.

```ts
frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 1: Update'), { phase: 1 })
frame.add(() => console.log('Phase 0: Read'))
frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 0: Read'))
frame.add(() => console.log('Phase 1: Update'), { phase: 1 })
```

Output:

```txt
Phase 0: Read
Phase 0: Read
Phase 1: Update
Phase 1: Update
Phase 2: Render
Phase 2: Render
```

## API

```ts
import { createFrame } from '@hypernym/frame'

// Frame
const frame = createFrame(options)

// Phases
frame.add(process, options)
frame.delete(process)
frame.delete()

// Controls
frame.start()
frame.stop()

// Getters/Setters
frame.state
frame.fps
```

### add

- Type: `(process: Process, options?: ProcessOptions): Process`

Adds a specific process to the frame update cycle.

By default, the process will be executed only once.

```ts
frame.add(process, options)
```

### delete

- Type: `(process?: Process): void`

Deletes a specific process from the frame update cycle.

```ts
frame.delete(process) // Deletes a specific process
frame.delete() // Deletes all processes, phases and resets the frame state
```

### start

- Type: `(): void`

Starts the entire frame loop.

```ts
frame.start()
```

### stop

- Type: `(): void`

Stops the entire frame loop.

```ts
frame.stop()
```

### loop

- Type: `boolean`
- Default: `undefined`

Specifies whether the phase process should continue to repeat, without stopping after the first execution.

```ts
frame.add((state) => console.log(state), { loop: true })
```

### phase

- Type: `number`
- Default: `0`

Specifies a custom frame phase.

Phases always run in strictly ascending numerical order.

```ts
frame.add(process, { phase: -1 }) // Runs before 0
frame.add(process) // Default phase is 0
frame.add(process, { phase: 1 }) // Runs after 0
frame.add(process, { phase: 2 }) // Runs after 1
// ...
```

### schedule

- Type: `boolean`
- Default: `true`

Specifies the scheduling behavior.

By default, the process waits for the next loop cycle. If disabled, it cancels the scheduling to the next frame and executes at the end of the current frame.

```ts
let index = 0

frame.add(() => {
  index++
  frame.add(() => index++, { schedule: false })
})
frame.add(() => console.log('Index: ', index), { phase: 1 }) // => Index 2
```

### state

- Type: `object`

Provides read‑only info about the frame’s internal `state` at any given point.

```ts
frame.add((state) => console.log(state))

// Gets the `state` via getter
console.log(frame.state)
```

## Options

### scheduler

- Type: `(process: VoidFunction) => number | void`
- Default: `requestAnimationFrame`

Specifies the scheduling system for the frame cycle.

Determines how the frame updates are processed, whether through the `requestAnimationFrame`, `setTimeout` or `microtask`.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ scheduler: queueMicrotask, loop: false })
```

### fps

- Type: `number`
- Default: `undefined`

Specifies a fixed rate for the frame update cycle.

By default, the frame runs as fast as possible (typically tied to the `raf` cycle, which is usually 60 FPS or higher).

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ fps: 60 })

// Specifies the `fps` via setter
frame.fps = 60
```

## License

Developed in 🇭🇷 Croatia, © Hypernym Studio.

Released under the [MIT](LICENSE.txt) license.
