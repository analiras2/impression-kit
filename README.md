# impression-kit

Lightweight utility to track **visibility events** with batching, deduplication and flexible flush strategies — ideal for feeds, analytics and impression tracking.

---

## ✨ Features

* Batch multiple events before sending
* Deduplication by `key`
* Manual or automatic flush strategies
* Predictable and side-effect-safe behavior

---

## 📦 Installation

```bash
npm install impression-kit
```

---

## 🚀 Usage

### Manual mode (default)

```ts
import { createTracker } from 'impression-kit'

const tracker = createTracker({
  onTrack: (items) => {
    console.log(items)
  }
})

tracker.track({
  key: 'product-123',
  item: { id: 123 },
  index: 0,
  isVisible: true,
  timestamp: Date.now()
})

// manually trigger delivery
tracker.flush()
```

---

### Automatic flush (time window)

```ts
const tracker = createTracker({
  onTrack: (items) => console.log(items),
  flushStrategy: {
    type: 'time-window',
    windowMs: 1000
  }
})
```

---

## 🧠 API

### `createTracker<T>(options)`

Creates a tracker instance.

Returns:

* `track(event: VisibilityEvent<T>)`
* `flush()`
* `reset()`

---

## 🧩 Types

### `VisibilityEvent<T>`

```ts
type VisibilityEvent<T> = {
  key: string
  item: T
  index: number
  isVisible: boolean
  timestamp: number
}
```

---

### `onTrack`

```ts
(items: VisibilityEvent<T>[]) => void
```

Called with a batch of accumulated events.

---

## 🔁 Dedupe, flush and reset

* `track()` ignores events with `isVisible: false`
* deduplication happens by `event.key`
* `flush()` clears only the batch (deduplication state is preserved)
* `reset()` clears both batch and deduplication state

---

## ⚙️ Flush strategies

If no `flushStrategy` is provided, the tracker operates in **manual mode**:

* `track()` accumulates events
* you must call `flush()` explicitly

---

### `immediate`

Flushes right after each valid `track()` call.

```ts
flushStrategy: { type: 'immediate' }
```

---

### `time-window`

Flushes after a time window since the last tracked event.

```ts
flushStrategy: { 
  type: 'time-window',
  windowMs: 1000
}
```

* Each new event resets the timer

---

### `hybrid`

Combines time window + batch size.

```ts
flushStrategy: {
  type: 'hybrid',
  windowMs: 1000,
  maxBatchSize: 10
}
```

* Flushes immediately when `maxBatchSize` is reached
* Otherwise falls back to `windowMs`

---

## 🧠 Design decisions

* Dedupe is scoped to the tracker lifecycle and only resets via `reset()`
* `flush()` is a delivery mechanism and does not affect deduplication
* Manual mode is the default to give full control over delivery timing
* Strategies are isolated from core tracking logic

---

## 🎯 Use cases

* Feed impression tracking (e.g. FlatList / RecyclerView)
* Analytics batching to reduce network overhead
* Visibility-based features (e.g. autoplay, lazy loading)

---

## 📄 License

MIT
