<h1 align="center">Frame</h1>

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
  <sub><strong>Package size</strong>: <code>~1.44 KB</code> minified, <code>~790 B</code> gzip</sub>
</blockquote>

## Core Concepts

#### Frame Scheduling 🔀

> Manages and schedules processes in different phases of the frame loop, using requestAnimationFrame for synchronization and ensuring smooth execution in timed operations like game loops and animations.

#### Custom Dynamic Phases 🔢

> Allows dynamic configuration of frame phases (read, update, render) for more flexibility and precise control over the execution flow of different tasks.

#### Multiple Ticker Mechanisms ⏱️

> Supports multiple ticking mechanisms, such as raf or timeout, to execute tasks at different intervals, enabling fine-grained control over the timing of operations in sync with the frame cycle.

#### Frame Controls 🎮

> Provides methods for the frame cycle, offering developers complete control over the execution flow, especially useful for dynamic scenarios like tab-switching or manual pause/resume functionality.

#### FPS Managment 🎯

> Adds fixed rate control for frame update cycle, limiting the maximum frame rate for performance consistency and predictability, preventing the loop from running too fast or inconsistently.

#### Frame State 💿

> Tracks and stores the state of the frame cycle, allowing for accurate, consistent handling of time-dependent processes during each frame update, ensuring reliable execution.

## Introduction

**Frame** is designed to manage and execute processes in different phases of a frame-based loop, typically used for timed operations, making it ideal for game loops, animations or periodic updates.

Organizes processes into distinct default phases (`read`, `update`, `render`), controls timing with FPS and delta time, ensuring smooth execution by syncing with the browser’s `requestAnimationFrame` method (or a fallback in non-browser environments), and allows dynamic configuration of frame phases with automatic type inference for enhanced development experience.

**Frame** provides `play`, `pause`, `cancel` and `clear` methods for powerful control over the execution of the frame cycle, allowing advanced manipulation of when the frame loop should continue or wait for next update.

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

// Adds a custom callback to the `update` phase and enables looping
const onUpdate = frame.update(
  (state) => {
    index++
    console.log('Update Phase Loop', index)

    if (index > 100) {
      frame.cancel(onUpdate)
      console.log('Update Phase Loop: Done!', state)
    }
  },
  { loop: true },
)
```

Each phase is executed in a strict order, which can be defined via `frame` options.

Default phase order is `read` → `update` → `render`.

```ts
frame.render(() => console.log('Phase 3: Render'))
frame.update(() => console.log('Phase 2: Update'))
frame.read(() => console.log('Phase 1: Read'))
frame.render(() => console.log('Phase 3: Render'))
frame.read(() => console.log('Phase 1: Read'))
frame.update(() => console.log('Phase 2: Update'))
```

Output:

```txt
Phase 1: Read
Phase 1: Read
Phase 2: Update
Phase 2: Update
Phase 3: Render
Phase 3: Render
```

Also, it's possible to create a `frame` manager with custom phases.

**Frame** will automatically handle everything based on the defined values, with full type safety and autocompletion, ensuring a seamless development experience.

```ts
import { createFrame } from '@hypernym/frame'

// Creates a new `frame` manager with custom phases
// These custom phases will replace the default ones ('read', 'update', 'render')
const frame = createFrame({ phases: ['measure', 'mutate'] })

// Adds a custom callback to the `mutate` phase
frame.mutate(() => {
  console.log('Phase 2: Mutate')
})

// Adds a custom callback to the `measure` phase
frame.measure(() => {
  console.log('Phase 1: Measure')
})
```

Output:

```txt
Phase 1: Measure
Phase 2: Mutate
```

## API

```ts
import { createFrame } from '@hypernym/frame'

// Frame
const frame = createFrame(options)

// Phases
frame.read(callback, options)
frame.update(callback, options)
frame.render(callback, options)

// Controls
frame.play()
frame.pause()
frame.cancel(callback)
frame.clear()
```

### state

- Type: `object`

Provides a read-only info of the internal frame `state` at any given point.

This can include info about the frame’s current `delta`, `timestamp` and `running` status.

Useful for debugging and monitoring or for dynamic actions based on the current state of the frame.

```ts
frame.update((state) => console.log(state))

// The state can also be accessed via the `.state` getter
console.log(frame.state)
```

### loop

- Type: `boolean`
- Default: `undefined`

Specifies whether the phase callback should continue to repeat through each subsequent frame, without stopping after the first execution.

Directs the scheduling system to re-run the same task on each frame until explicitly canceled or cleared.

By default, the callback will only be executed once.

```ts
frame.update((state) => console.log(state), { loop: true })
```

### schedule

- Type: `boolean`
- Default: `true`

Specifies the scheduling behavior.

By default this is enabled which means the callback waits for the next loop cycle.

If disabled, it cancels the scheduling to the next frame and executes at the end of the current frame.

```ts
let index = 0

frame.update(() => {
  index++
  frame.update(() => index++, { schedule: false })
})
frame.render(() => console.log('Index: ', index)) // => Index 2
```

### play

- Type: `() => void`

Unpauses the loop and restores the normal frame update cycle.

Ensures that the frame updates continue as expected, without skipping any frames, and the system will continue processing scheduled tasks on each new frame.

```ts
frame.play()
```

### pause

- Type: `() => void`

Halts the entire frame update loop, pausing all scheduled tasks and animations until `.play()` is explicitly called again.

Helps prevent unnecessary processing and save system resources.

```ts
frame.pause()
```

### cancel

- Type: `(callback: PhaseCallback) => void`

Allows you to remove a specific callback from the frame update cycle which means no more callback repeats on subsequent frames.

This is useful when you need to dynamically remove or cancel a task from the queue without disrupting the rest of the frame update flow.

```ts
frame.cancel(frame.read(() => {}))
```

### clear

- Type: `() => void`

Removes all scheduled phases from the frame update cycle and reset the state of the frame.

It effectively clears the entire update queue, stopping all scheduled tasks from running on subsequent frames and cancels the ticker. No tasks will be executed until new ones are scheduled.

Useful for cleanup or re-initialization, like when starting over or clearing tasks after a specific process completes.

It's recommended to call this method when you are sure that there is no need for another frame process, such as before changing routes in meta-frameworks.

```ts
frame.clear()
```

## Examples

### Visibility Change (Switching Tabs)

This example shows how a **Frame** can be paused when the user switches tabs and resume playback when the user returns to the page.

```ts
const frame = createFrame()

frame.update(() => console.log('Updating...'), { loop: true })

// ...

let isVisibilityEnabled: boolean = false

const handleVisibilityChange = (): void => {
  if (document.hidden) frame.pause()
  else frame.play()
}

const addVisibilityChange = (): void => {
  if (!isVisibilityEnabled) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    isVisibilityEnabled = true
  }
}

const removeVisibilityChange = (): void => {
  if (isVisibilityEnabled) {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    isVisibilityEnabled = false
  }
}

// Adds `visibilitychange` event to the document
addVisibilityChange()

// Later in the code, it removes the event from the document
// removeVisibilityChange()
```

## Options

All options are documented with descriptions and examples so autocompletion will be offered as you type. Simply hover over the property and see what it does in the quick info tooltip.

### phases

- Type: `string[]`
- Default: `['read', 'update', 'render']`

Specifies an array of phases that will be executed in strict order during the frame update cycle. Each phase corresponds to a specific point in the frame's execution flow, such as reading input, updating state, or rendering visuals.

Useful when need to define own additional phases or reduce them to a specific number. This allows scheduling custom tasks for specific moments in the frame cycle, helping to organize and optimize frame processing.

Also, frame dynamically configures type safety under the hood, automatically adjusting and validating types for each phase while preventing runtime errors and ensuring your frame updates are always on track.

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ phases: ['measure', 'mutate'] })
```

### ticker

- Type: `string`
- Default: `raf`

Specifies the timing mechanism used for scheduling the frame update cycle.

This determines how the frame updates are processed, whether through the `requestAnimationFrame` or `setTimeout` timing strategy.

For use cases like testing, animation control, or specialized timing (e.g., in non-browser environments), you can specify other ticker mechanism:

- `raf` — requestAnimationFrame
- `timeout` — setTimeout

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ ticker: 'raf' })
```

### fps

- Type: `number`
- Default: `undefined`

Specifies a fixed rate for the frame update cycle.

Useful when you want to control the framerate limit and prevent the frame loop from running at the maximum possible speed (e.g., for performance reasons, consistency, or to match a loop’s intended frame rate).

This ensure that the updates are more predictable and not too fast or inconsistent.

By default, the frame runs as fast as possible (typically tied to the `raf` cycle, which is usually 60 FPS or higher).

```ts
import { createFrame } from '@hypernym/frame'

const frame = createFrame({ fps: 60 })
```

## Community

Feel free to ask questions or share new ideas.

Use the official [discussions](https://github.com/hypernym-studio/frame/discussions) to get involved.

## License

Developed in 🇭🇷 Croatia, © Hypernym Studio.

Released under the [MIT](LICENSE.txt) license.
