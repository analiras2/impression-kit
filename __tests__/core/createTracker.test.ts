import { createTracker } from '../../src/core/engine/createTracker'

describe('createTracker', () => {
  it('should track a visible item and flush immediately', () => {
    const onTrack = jest.fn()

    const tracker = createTracker({
      onTrack
    })

    tracker.track({
      key: '1',
      item: { id: 1 },
      index: 0,
      isVisible: true,
      timestamp: 0
    })

    expect(onTrack).toHaveBeenCalledTimes(1)
    expect(onTrack).toHaveBeenCalledWith([
      expect.objectContaining({
        key: '1',
        index: 0
      })
    ])
  })

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
  
    expect(onTrack).toHaveBeenCalledTimes(1)
  })
})