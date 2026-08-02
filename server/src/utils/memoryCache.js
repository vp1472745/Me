// In-memory cache to hold temporary uploads in RAM during Google Drive sync (zero local disk writes)
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, buffer, mimeType) {
    this.cache.set(key, { buffer, mimeType, createdAt: Date.now() });
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const tempMemoryCache = new MemoryCache();
export default tempMemoryCache;
