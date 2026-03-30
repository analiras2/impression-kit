import { VisibilityEvent, TrackingConfig, FlushStrategy } from '../types'

export function createTracker<T>({
    onTrack,
    flushStrategy
  }: TrackingConfig<T> & { flushStrategy?: FlushStrategy }) {
    const trackedKeys = new Set<string>()
    
    // If you omit `flushStrategy`, the tracker becomes "manual":
    // it will batch events until you call `flush()`.
    const __DEV__ = (globalThis as any).__DEV__
    if (__DEV__ && !flushStrategy) {
      console.warn(
        '[tracker] No flushStrategy provided. Remember to call flush() manually.'
      )
    }
    
    let batch: VisibilityEvent<T>[] = []
    let timeout: ReturnType<typeof setTimeout> | null = null
  
    function flush() {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
  
      if (batch.length === 0) return
  
      const items = batch
      batch = []
  
      onTrack(items)
    }
  
    function scheduleFlush() {
        if (!flushStrategy) return
      
        switch (flushStrategy.type) {
          case 'immediate':
            flush()
            break
      
          case 'time-window':
            if (timeout) clearTimeout(timeout)
      
            timeout = setTimeout(() => {
              flush()
            }, flushStrategy.windowMs)
            break
      
          case 'hybrid':
            if (batch.length >= flushStrategy.maxBatchSize) {
              flush()
              return
            }
      
            if (timeout) clearTimeout(timeout)
      
            timeout = setTimeout(() => {
              flush()
            }, flushStrategy.windowMs)
      
            break
        }
      }
  
    function track(event: VisibilityEvent<T>) {
      if (!event.isVisible) return
      if (trackedKeys.has(event.key)) return
  
      trackedKeys.add(event.key)
      batch.push(event)
  
      if (flushStrategy) scheduleFlush()
    }
  
    function reset() {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
  
      trackedKeys.clear()
      batch = []
    }
  
    return {
      track,
      flush,
      reset
    }
  }