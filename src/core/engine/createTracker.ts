import { VisibilityEvent } from '../types'
import { TrackingConfig } from '../types'

export function createTracker<T>({ onTrack }: TrackingConfig<T>) {
  const trackedKeys = new Set<string>()

  function track(event: VisibilityEvent<T>) {
    if (!event.isVisible) return

    if (trackedKeys.has(event.key)) return

    trackedKeys.add(event.key)

    onTrack([event])
  }

  function reset() {
    trackedKeys.clear()
  }

  return {
    track,
    reset
  }
}