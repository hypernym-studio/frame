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

<br>

## Features

- Free & Open Source
- Ultra-lightweight & Powerful
- Framework-Independent
- Written in TypeScript
- Native SSR Support
- No External Dependencies
- Extremely Easy to Use
- API-Friendly

<blockquote>
  <sub><strong>Package size</strong>: <code>~1.37 KB</code> minified, <code>~737 B</code> gzip</sub>
</blockquote>

## Core Concepts

- **Frame Scheduling**: Schedules processes in different phases of the frame loop.
- **Dynamic Phases**: Allows dynamic configuration of frame phases.
- **Custom Scheduler**: Supports various schedulers, such as raf, timeout, and microtask.
- **Frame Controls**: Provides developers complete control over the execution flow.
- **FPS Managment**: Adds fixed rate control for frame update cycle.
- **Frame State**: Tracks and stores the state of the frame cycle.
- **Modular Code**: Follows modern module standards for flexibility and integration.
- **Type-safe**: Provides first-class TypeScript support with official built-in declarations.

## Introduction

**Frame** is designed to manage and execute processes in different phases of a frame-based loop, typically used for timed operations, making it ideal for game loops, animations or periodic updates.

Organizes processes into distinct phases, controls timing with FPS and delta time, ensuring smooth execution by syncing with the browser’s `requestAnimationFrame` method, and allows dynamic configuration of frame phases.

**Frame** provides `add`, `delete`, `start` and `stop` methods for powerful control over the execution of the frame cycle, allowing advanced manipulation of when the frame loop should continue or wait for next update.

These methods are super useful in situations where you need to manage the frame dynamically, such as when the user switches tabs and returns to the page.

## Installation

Install `@hypernym/frame` package:

```sh
# via pnpm
pnpm add @hypernym/frame
```

```sh
# via npm
npm install @hypernym/frame
```

### CDN

Here are some examples of how to integrate **Frame** from a CDN via a script tag.

Also, it is possible to download files manually and serve them accordingly.

#### ESM (minified)

```html
<script type="module">
  import { createFrame } from 'https://unpkg.com/@hypernym/frame/dist/index.min.mjs'
  const frame = createFrame()
</script>
```

#### IIFE (minified)

```html
<script src="https://unpkg.com/@hypernym/frame/dist/index.iife.js"></script>
<script>
  const { createFrame } = Frame
  const frame = createFrame()
</script>
```

#### UMD (minified)

```html
<script src="https://unpkg.com/@hypernym/frame/dist/index.umd.js"></script>
<script>
  const { createFrame } = Frame
  const frame = createFrame()
</script>
```

## Quick Start

Create a `frame` manager with default phases.

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

Each phase is executed in a strict order, which can be defined via `frame` options.

Default phase order is `read` → `update` → `render`.

```ts
frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 1: Update'), { phase: 1 })
frame.add(() => console.log('Phase 0: Read'))
frame.add(() => console.log('Phase 2: Render'), { phase: 2 })
frame.add(() => console.log('Phase 0: Read'))
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

- Type: `(process: Process, options?: ProcessOptions) => Process`

Adds a specific process to the frame update cycle.

By default, the process will be executed only once, but you can configure it to repeat by enabling a `loop: true` option, continuing until it is explicitly stopped.

```ts
frame.add(process, options)
```

### delete

- Type: `(process?: Process) => void`

Allows you to remove a specific process from the frame update cycle which means no more process repeats on subsequent frames.

This is useful when you need to dynamically remove or cancel a task from the queue without disrupting the rest of the frame update flow.

```ts
frame.delete(process)
```

It is also possible to removes all scheduled phases from the frame update cycle and reset the state of the frame.

Effectively clears the entire update queue, stopping all scheduled tasks from running on subsequent frames and cancels the scheduler. No tasks will be executed until new ones are scheduled.

Useful for cleanup or re-initialization, like when starting over or clearing tasks after a specific process completes.

It's recommended to call this method when you are sure that there is no need for another frame process, such as before changing routes in meta-frameworks.

```ts
frame.delete()
```

### start

- Type: `() => void`

Unpauses the loop and restores the normal frame update cycle.

Ensures that the frame updates continue as expected, without skipping any frames, and the system will continue processing scheduled tasks on each new frame.

```ts
frame.start()
```

### stop

- Type: `() => void`

Halts the entire frame update loop, pausing all scheduled tasks and animations until `.start()` is explicitly called again.

Helps prevent unnecessary processing and save system resources.

```ts
frame.stop()
```

### loop

- Type: `boolean`
- Default: `undefined`

Specifies whether the phase process should continue to repeat through each subsequent frame, without stopping after the first execution.

Directs the scheduling system to re-run the same task on each frame until explicitly deleted.

```ts
frame.add((state) => console.log(state), { loop: true })
```

### phase

- Type: `number`
- Default: `0`

All phases are unified under a single `.add()` method and are created dynamically, optimizing performance by avoiding unnecessary initialization.

The default phase is `0`, and specifying a phase is optional. You can define an unlimited number of phases, though most use cases only require one or two, typically three: `read (0)`, `update (1)`, and `render (2)`.

Phases always run in `strict` numerical order, from the smallest to the largest.

```ts
frame.add(process, { phase: -1 }) // runs before 0
frame.add(process) // default phase is 0
frame.add(process, { phase: 1 }) // runs after 0
frame.add(process, { phase: 2 }) // runs after 1
// etc ...
```

### schedule

- Type: `boolean`
- Default: `true`

Specifies the scheduling behavior.

By default this is enabled which means the process waits for the next loop cycle.

If disabled, it cancels the scheduling to the next frame and executes at the end of the current frame.

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

Provides a read-only info of the internal frame `state` at any given point.

This can include info about the frame’s current `delta`, `timestamp` and `running` status.

Useful for debugging and monitoring or for dynamic actions based on the current state of the frame.

```ts
frame.add((state) => console.log(state))

// The state can also be accessed via the `.state` getter
console.log(frame.state)
```

## Options

### scheduler

- Type: `(process: VoidFunction) => number | void`
- Default: `requestAnimationFrame`

Specifies the scheduling system for the frame cycle.

This determines how the frame updates are processed, whether through the `requestAnimationFrame`, `setTimeout` or `microtask`.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ scheduler: queueMicrotask, loop: false })
```

### fps

- Type: `number | false`
- Default: `undefined`

Specifies a fixed rate for the frame update cycle.

Useful when you want to control the framerate limit and prevent the frame loop from running at the maximum possible speed (e.g., for performance reasons, consistency, or to match a loop’s intended frame rate).

This ensure that the updates are more predictable and not too fast or inconsistent.

By default, the frame runs as fast as possible (typically tied to the `raf` cycle, which is usually 60 FPS or higher).

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ fps: 60 })

// It can also be set dynamically via the `.fps` setter
frame.fps = 60
```

## Community

Feel free to ask questions or share new ideas.

Use the official [discussions](https://github.com/hypernym-studio/frame/discussions) to get involved.

## License

Developed in 🇭🇷 Croatia, © Hypernym Studio.

Released under the [MIT](LICENSE.txt) license.
