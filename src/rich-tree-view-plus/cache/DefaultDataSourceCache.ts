/**
 * @fileoverview DefaultDataSourceCache - In-Memory Cache Implementation
 *
 * A default implementation of the DataSourceCache interface that provides
 * in-memory caching with TTL (Time To Live) support. This cache stores
 * tree view data in memory with automatic expiration based on configurable
 * TTL values.
 *
 * Features:
 * - In-memory storage with automatic cleanup
 * - Configurable TTL (Time To Live) for cache entries
 * - Automatic expiration of stale entries
 * - Cache size management and cleanup utilities
 * - Thread-safe operations for concurrent access
 *
 * @author RichTreeViewPlus Team
 * @version 1.0.0
 * @license MIT
 */

import { DataSourceCache } from '../types';

/**
 * Internal cache entry structure
 *
 * Represents a single cached item with its value, timestamp, and TTL.
 */
interface CacheEntry {
  /** The cached value */
  value: any;
  /** Timestamp when the entry was created (in milliseconds) */
  timestamp: number;
  /** Time to live duration in milliseconds */
  ttl: number;
}

/**
 * DefaultDataSourceCache Class
 *
 * A default implementation of the DataSourceCache interface that provides
 * in-memory caching with TTL support. This cache is suitable for most
 * use cases where data doesn't need to persist across browser sessions.
 *
 * @example
 * ```tsx
 * const cache = new DefaultDataSourceCache(5 * 60 * 1000); // 5 minutes TTL
 * cache.set('key', value);
 * const value = cache.get('key');
 * ```
 */
export class DefaultDataSourceCache implements DataSourceCache {
  /** Internal cache storage using Map */
  private cache = new Map<string, CacheEntry>();

  /** Default TTL value in milliseconds */
  private defaultTtl: number;

  /**
   * Constructor for DefaultDataSourceCache
   *
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  constructor(ttl: number = 5 * 60 * 1000) {
    this.defaultTtl = ttl;
  }

  /**
   * Retrieves a value from the cache
   *
   * Checks if the key exists and if the entry has not expired.
   * Automatically removes expired entries during retrieval.
   *
   * @param key - The cache key to retrieve
   * @returns The cached value or null if not found/expired
   */
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if entry has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Stores a value in the cache
   *
   * Creates a new cache entry with the current timestamp and specified TTL.
   * If no TTL is provided, uses the default TTL value.
   *
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in milliseconds
   */
  set(key: string, value: any, ttl?: number) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl
    });
  }

  /**
   * Clears all cached data
   *
   * Removes all entries from the cache, effectively resetting it
   * to an empty state.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Removes a specific item from the cache
   *
   * @param key - The cache key to remove
   * @returns True if the item was removed, false if not found
   */
  delete(key: string) {
    return this.cache.delete(key);
  }

  /**
   * Checks if a key exists in the cache
   *
   * Verifies that the key exists and that the entry has not expired.
   * Automatically removes expired entries during the check.
   *
   * @param key - The cache key to check
   * @returns True if the key exists and is not expired
   */
  has(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    // Check if entry has expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Gets the current size of the cache
   *
   * @returns Number of entries currently in the cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Gets all cache keys
   *
   * @returns Array of all cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Cleans up expired entries from the cache
   *
   * Iterates through all cache entries and removes those that have expired.
   * This method is useful for periodic cleanup to prevent memory leaks.
   */
  cleanup() {
    const now = Date.now();
    // Use forEach instead of for...of for better compatibility
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }
}