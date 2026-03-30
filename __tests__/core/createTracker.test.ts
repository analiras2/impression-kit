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
})