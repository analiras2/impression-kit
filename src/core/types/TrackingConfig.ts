import { VisibilityEvent } from './VisibilityEvent'

export type TrackingConfig<T> = {
  onTrack: (items: VisibilityEvent<T>[]) => void
}