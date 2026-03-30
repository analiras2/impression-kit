import { createTracker } from '../../src/core/engine/createTracker'

describe('createTracker', () => {
  it('should not track invisible items', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: false,
      timestamp: 0
    })
  
    expect(onTrack).not.toHaveBeenCalled()
  })

  it('should track item only once', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    const event = {
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    }
  
    tracker.track(event)
    tracker.track(event)

    tracker.flush()
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('should accumulate events until flush is called', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })
  
    expect(onTrack).not.toHaveBeenCalled()
  })

  it('should flush accumulated events', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })
  
    tracker.flush()
  
    expect(onTrack).toHaveBeenCalledTimes(1)
    expect(onTrack).toHaveBeenCalledWith([
      expect.objectContaining({ key: '1' })
    ])
  })

  it('should clear batch after flush', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    const event = {
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    }
  
    tracker.track(event)
    tracker.flush()
    tracker.flush()
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('should still deduplicate events', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({ onTrack })
  
    const event = {
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    }
  
    tracker.track(event)
    tracker.track(event)
  
    tracker.flush()
  
    expect(onTrack).toHaveBeenCalledTimes(1)
    expect(onTrack).toHaveBeenCalledWith([event])
  })

  it('should flush immediately when strategy is immediate', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({
      onTrack,
      flushStrategy: { type: 'immediate' }
    })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('should allow tracking again after reset()', () => {
    const onTrack = jest.fn()

    const tracker = createTracker({ onTrack })

    const event = {
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    }

    tracker.track(event)
    tracker.track(event)

    expect(onTrack).not.toHaveBeenCalled()

    tracker.flush()
    expect(onTrack).toHaveBeenCalledTimes(1)

    tracker.reset()

    tracker.track(event)
    tracker.flush()

    expect(onTrack).toHaveBeenCalledTimes(2)
    expect(onTrack).toHaveBeenNthCalledWith(2, [event])
  })

  it('should flush after time window', () => {
    jest.useFakeTimers()
  
    const onTrack = jest.fn()
  
    const tracker = createTracker({
      onTrack,
      flushStrategy: { type: 'time-window', windowMs: 1000 }
    })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })
  
    expect(onTrack).not.toHaveBeenCalled()
  
    jest.advanceTimersByTime(1000)
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('should flush immediately when batch size is reached (hybrid)', () => {
    const onTrack = jest.fn()
  
    const tracker = createTracker({
      onTrack,
      flushStrategy: { type: 'hybrid', windowMs: 1000, maxBatchSize: 2 }
    })
  
    tracker.track({ key: '1', item: { id: 1 }, index: 0, isVisible: true, timestamp: 0 })
    tracker.track({ key: '2', item: { id: 2 }, index: 1, isVisible: true, timestamp: 0 })
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('should flush by timeout if batch size not reached (hybrid)', () => {
    jest.useFakeTimers()
  
    const onTrack = jest.fn()
  
    const tracker = createTracker({
      onTrack,
      flushStrategy: { type: 'hybrid', windowMs: 1000, maxBatchSize: 5 }
    })
  
    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })
  
    jest.advanceTimersByTime(1000)
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })
})