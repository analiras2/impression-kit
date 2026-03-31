import { VisibilityEvent } from './VisibilityEvent'


export type FlushStrategy =
  | { type: 'manual' }
  | { type: 'immediate' }
  | { type: 'time-window'; windowMs: number }
  | { type: 'hybrid'; windowMs: number; maxBatchSize: number }

export type DeduplicationStrategy =
  | { type: 'none' }
  | { type: 'once' }
  | { type: 'ttl'; ttlMs: number }

export type TrackerConfig<T> = {
  onTrack: (events: VisibilityEvent<T>[]) => void
  onError?: (error: unknown, events: VisibilityEvent<T>[]) => void

  flushStrategy?: FlushStrategy
  deduplication?: DeduplicationStrategy

  flushOnReset?: boolean
}