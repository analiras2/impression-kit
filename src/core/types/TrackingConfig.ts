import { VisibilityEvent } from './VisibilityEvent'

export type TrackingConfig<T> = {
  onTrack: (items: VisibilityEvent<T>[]) => void
}

export type FlushStrategy =
| { type: 'immediate' }
| { type: 'time-window'; windowMs: number }
| { type: 'hybrid'; windowMs: number; maxBatchSize: number }