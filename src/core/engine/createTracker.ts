import { TrackerConfig, VisibilityEvent } from "../types";
import { createDeduplicator } from "./createDeduplicator";

export function createTracker<T>({
  onTrack,
  onError,
  flushStrategy = { type: 'manual' },
  deduplication = { type: 'once' },
  flushOnReset = false,
}: TrackerConfig<T>) {
  let batch: VisibilityEvent<T>[] = []
  let timeout: ReturnType<typeof setTimeout> | null = null

  const dedupe = createDeduplicator(deduplication)

  function flush() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    if (batch.length === 0) return

    const items = [...batch]

    try {
      onTrack(items)
      batch = []
    } catch (err) {
      onError?.(err, items)
    }
  }

  function scheduleFlush() {
    if (flushStrategy.type === 'manual') return

    if (flushStrategy.type === 'immediate') {
      flush()
      return
    }

    if (
      flushStrategy.type === 'hybrid' &&
      batch.length >= flushStrategy.maxBatchSize
    ) {
      flush()
      return
    }

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(flush, flushStrategy.windowMs)
  }

  function track(event: VisibilityEvent<T>) {
    if (!event.isVisible) return
    if (!dedupe.shouldTrack(event.key)) return

    batch.push(event)
    scheduleFlush()
  }

  function reset() {
    if (flushOnReset) {
      flush()
    } else {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      batch = []
    }

    dedupe.reset()
  }

  return {
    track,
    flush,
    reset,
  }
}