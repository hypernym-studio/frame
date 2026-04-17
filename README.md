<h1 align="center">@hypernym/frame</h1>

<p align="center">Universal Frame Manager.</p>

<p align="center">
  <a href="https://github.com/hypernym-studio/frame">Repository</a>
  <span>|</span>
  <a href="https://www.npmjs.com/package/@hypernym/frame">Package</a>
  <span>|</span>
  <a href="https://github.com/hypernym-studio/frame/releases">Releases</a>
  <span>|</span>
  <a href="https://github.com/hypernym-studio/frame/discussions">Discussions</a>
</p>

<br>

<pre align="center">pnpm add @hypernym/frame</pre>

<p align="center">
  <sub>Size: <code>~1.01 KB</code> min, <code>~0.58 KB</code> gzip</sub>
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

Phases always run from the lowest number to the highest.

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

// Main Frame
const frame = createFrame(options)

// Methods
frame.add(process, options)
frame.delete(process)

// Getters
frame.state
```

## add

- Type: `(process: FrameProcess, options?: FrameProcessOptions): FrameProcess`

Adds a specific process to the frame update cycle.

> [!NOTE]
>
> By default, the process will be executed only once (phase: `0`).

```ts
frame.add(process, options)
```

## loop

- Type: `boolean`
- Default: `undefined`

Specifies whether the phase process should continue to repeat, without stopping after the first execution.

> [!NOTE]
>
> Repeating processes need to be removed manually using the `frame.delete(process)` method.

```ts
frame.add((state) => console.log(state), { loop: true })
```

## delete

- Type: `(process?: FrameProcess): void`

Deletes a specific process from the frame update cycle.

> [!NOTE]
>
> Calling `frame.delete()` without the `process` parameter resets the main `frame` instance, resulting in the deletion of all processes, phases, and state.

```ts
frame.delete(process) // Deletes a specific process
frame.delete() // Deletes all processes, phases and resets the frame state
```

## phase

- Type: `number`
- Default: `0`

Specifies a custom frame phase.

Phases are processed in ascending numerical order, meaning lower run before higher ones.

```ts
frame.add(process, { phase: -1 }) // Runs before 0
frame.add(process) // Default phase is 0
frame.add(process, { phase: 1 }) // Runs after 0
frame.add(process, { phase: 2 }) // Runs after 1
// ...
```

## immediate

- Type: `boolean`
- Default: `undefined`

Controls the scheduling behavior.

By default, the process is scheduled to the next loop cycle. When enabled, it skips scheduling and executes at the end of the current frame.

```ts
let index = 0

frame.add(() => {
  index++
  frame.add(() => index++, { immediate: true })
})
frame.add(() => console.log('Index: ', index), { phase: 1 }) // => Index 2
```

## state

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

Determines how the frame updates are processed, whether through the `requestAnimationFrame` or `microtask`.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ scheduler: queueMicrotask, loop: false })
```

### loop

- Type: `boolean`
- Default: `true`

Specifies global looping across all processes.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ loop: false })
```

## License

Developed in 🇭🇷 Croatia, © Hypernym Studio.

Released under the [MIT](LICENSE.txt) license.
