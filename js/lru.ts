/**
 * Minimal LRU cache backed by a Map (which preserves insertion order).
 * Supports: new LRU(capacity), .get(key), .set(key, value)
 */
export default class LRU<K = any, V = any> {
    private _capacity: number;
    private _map: Map<K, V>;

    constructor(capacity: number) {
        this._capacity = capacity;
        this._map = new Map<K, V>();
    }

    get(key: K): V | undefined {
        if (!this._map.has(key)) {
            return undefined;
        }
        var value = this._map.get(key)!;
        // Move to end (most recently used)
        this._map.delete(key);
        this._map.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this._map.has(key)) {
            this._map.delete(key);
        } else if (this._map.size >= this._capacity) {
            // Evict least recently used (first key)
            this._map.delete(this._map.keys().next().value as K);
        }
        this._map.set(key, value);
    }
}
