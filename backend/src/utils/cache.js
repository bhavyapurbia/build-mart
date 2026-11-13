import { env } from '../config/env.js';

class InMemoryCache {
  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entry
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
    return true;
  }

  del(key) {
    return this.store.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  flush() {
    this.store.clear();
  }
}

// In-memory cache instance
const localCache = new InMemoryCache();

export const cache = {
  async get(key) {
    return localCache.get(key);
  },

  async set(key, value, ttlSeconds = 60) {
    return localCache.set(key, value, ttlSeconds);
  },

  async del(key) {
    return localCache.del(key);
  },

  async delPattern(pattern) {
    return localCache.delPattern(pattern);
  },

  async flush() {
    return localCache.flush();
  }
};

/**
 * Cache-Control middleware for public, static or slow-changing resources
 * e.g., Categories, Brands, Banners, Public Settings
 */
export const cacheControlPublic = (maxAgeSeconds = 60, swrSeconds = 300) => (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${swrSeconds}`);
  }
  next();
};

/**
 * Cache-Control middleware for private, authenticated or sensitive data
 * e.g., Cart, Checkout, User Account, Orders, Admin endpoints
 */
export const cacheControlPrivate = () => (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
};

export default { cache, cacheControlPublic, cacheControlPrivate };

