import { createTracker } from '../../src/core/engine/createTracker'

describe('createTracker', () => {
  const makeEvent = (key: string, index = 0) => ({
    key,
    item: { id: Number(key) || key },
    index,
    isVisible: true,
    timestamp: 0,
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('manual strategy (default)', () => {
    it('ignores invisible items', () => {
      const onTrack = jest.fn()
      const tracker = createTracker({ onTrack })

      tracker.track({
        key: '1',
        item: { id: 1 },
        index: 0,
        isVisible: false,
        timestamp: 0,
      })

      expect(onTrack).not.toHaveBeenCalled()
    })

    it('accumulates and flushes once', () => {
      const onTrack = jest.fn()
      const tracker = createTracker({ onTrack })

      tracker.track(makeEvent('1'))
      expect(onTrack).not.toHaveBeenCalled()
      tracker.flush()

      expect(onTrack).toHaveBeenCalledTimes(1)
      expect(onTrack).toHaveBeenCalledWith([makeEvent('1')])

      tracker.flush()
      expect(onTrack).toHaveBeenCalledTimes(1)
    })
  })

  describe('deduplication', () => {
    it('deduplicates by key and keeps dedupe state after flush until reset', () => {
      const onTrack = jest.fn()
      const tracker = createTracker({ onTrack })

      const event = makeEvent('1')
      tracker.track(event)
      tracker.track(event)
      tracker.flush()

      expect(onTrack).toHaveBeenCalledTimes(1)
      expect(onTrack).toHaveBeenCalledWith([event])

      tracker.track(event)
      tracker.flush()
      expect(onTrack).toHaveBeenCalledTimes(1)

      tracker.reset()
      tracker.track(event)
      tracker.flush()
      expect(onTrack).toHaveBeenCalledTimes(2)
    })

    it('supports deduplication type none', () => {
      const onTrack = jest.fn()
      const tracker = createTracker({
        onTrack,
        deduplication: { type: 'none' },
      })

      tracker.track(makeEvent('1'))
      tracker.track(makeEvent('1'))
      tracker.flush()

      expect(onTrack).toHaveBeenCalledTimes(1)
      expect(onTrack).toHaveBeenCalledWith([makeEvent('1'), makeEvent('1')])
    })

    it('supports deduplication type ttl', () => {
      jest.useFakeTimers()
      const onTrack = jest.fn()
      const tracker = createTracker({
        onTrack,
        deduplication: { type: 'ttl', ttlMs: 1000 },
      })

      tracker.track(makeEvent('1'))
      tracker.flush()
      tracker.track(makeEvent('1'))
      tracker.flush()
      expect(onTrack).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)
      tracker.track(makeEvent('1'))
      tracker.flush()
      expect(onTrack).toHaveBeenCalledTimes(2)
    })
  })

  describe('immediate strategy', () => {
    it('flushes immediately when strategy is immediate', () => {
      const onTrack = jest.fn()
      const tracker = createTracker({
        onTrack,
        flushStrategy: { type: 'immediate' },
      })

      tracker.track(makeEvent('1'))

      expect(onTrack).toHaveBeenCalledTimes(1)
      expect(onTrack).toHaveBeenCalledWith([makeEvent('1')])
    })
  })

  describe('time-window strategy', () => {
    it('flushes after time window and resets timer on new events', () => {
      jest.useFakeTimers()
      const onTrack = jest.fn()

      const tracker = createTracker({
        onTrack,
        flushStrategy: { type: 'time-window', windowMs: 1000 },
      })

      tracker.track(makeEvent('1'))
      jest.advanceTimersByTime(900)
      tracker.track(makeEvent('2', 1))
      jest.advanceTimersByTime(900)

      expect(onTrack).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(onTrack).toHaveBeenCalledTimes(1)
      expect(onTrack).toHaveBeenCalledWith([makeEvent('1'), makeEvent('2', 1)])
    })
  })

  describe('hybrid strategy', () => {
    it('flushes on batch size and does not flush again from stale timeout', () => {
      jest.useFakeTimers()
      const onTrack = jest.fn()

      const tracker = createTracker({
        onTrack,
        flushStrategy: { type: 'hybrid', windowMs: 1000, maxBatchSize: 2 },
      })

      tracker.track(makeEvent('1'))
      tracker.track(makeEvent('2', 1))
      expect(onTrack).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)
      expect(onTrack).toHaveBeenCalledTimes(1)
    })

    it('flushes by timeout when max batch is not reached', () => {
      jest.useFakeTimers()
      const onTrack = jest.fn()

      const tracker = createTracker({
        onTrack,
        flushStrategy: { type: 'hybrid', windowMs: 1000, maxBatchSize: 5 },
      })

      tracker.track(makeEvent('1'))
      jest.advanceTimersByTime(1000)

      expect(onTrack).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onError and keeps batch when onTrack throws', () => {
    const onTrack = jest.fn(() => {
      throw new Error('fail')
    })
    const onError = jest.fn()
    const tracker = createTracker({ onTrack, onError })

    tracker.track(makeEvent('1'))

    expect(() => tracker.flush()).not.toThrow()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.any(Error), [makeEvent('1')])

    tracker.flush()
    expect(onTrack).toHaveBeenCalledTimes(2)
  })

  it('flushes on reset when flushOnReset is true', () => {
    const onTrack = jest.fn()
    const tracker = createTracker({
      onTrack,
      flushOnReset: true,
    })

    tracker.track(makeEvent('1'))
    tracker.reset()

    expect(onTrack).toHaveBeenCalledTimes(1)
    expect(onTrack).toHaveBeenCalledWith([makeEvent('1')])
  })
})