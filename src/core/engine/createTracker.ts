import { VisibilityEvent, TrackingConfig } from '../types'

export function createTracker<T>({ onTrack }: TrackingConfig<T>) {
  const trackedKeys = new Set<string>()
  let batch: VisibilityEvent<T>[] = []

  function track(event: VisibilityEvent<T>) {
    if (!event.isVisible) return

    if (trackedKeys.has(event.key)) return

    trackedKeys.add(event.key)
    batch.push(event)
  }

  function flush() {
    if (batch.length === 0) return

    const items = batch
    batch = []

    onTrack(items)
  }

  function reset() {
    trackedKeys.clear()
    batch = []
  }

  return {
    track,
    flush,
    reset
  }
}