import { DeduplicationStrategy } from "../types";

export function createDeduplicator(strategy: DeduplicationStrategy) {
    const dedupeStore =
        strategy.type === 'ttl'
            ? new Map<string, number>()
            : new Set<string>()

    return {
        shouldTrack(key: string) {
            if (strategy.type === 'none') return true

            if (strategy.type === 'once') {
                const set = dedupeStore as Set<string>
                if (set.has(key)) return false
                set.add(key)
                return true
            }

            const now = Date.now()
            const ttl = strategy.ttlMs
            const map = dedupeStore as Map<string, number>

            const last = map.get(key)
            if (last !== undefined && now - last < ttl) return false

            map.set(key, now)
            return true
        },

        reset() {
            dedupeStore.clear()
        },
    }
}