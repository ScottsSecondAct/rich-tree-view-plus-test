/**
 * @fileoverview useLazyLoading Hook - Enhanced Lazy Loading for Tree Views
 *
 * This hook provides enhanced lazy loading capabilities for tree view components.
 * It manages loading states, error handling, caching, and automatic data fetching
 * when tree items are expanded.
 *
 * Key Features:
 * - Automatic data fetching on item expansion
 * - Comprehensive error handling and retry functionality
 * - Flexible caching with TTL support
 * - Loading and error state management
 * - Recursive tree structure updates
 *
 * @author Scott Davis
 * @version 1.1.0 - 2025-08-11
 * @license MIT
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { DataSource, DataSourceCache, TreeViewItem, LazyLoadingState } from '../types';
import { DefaultDataSourceCache } from '../cache/DefaultDataSourceCache';
import { updateItemsRecursively, findItemById } from '../utils/treeUtils';

/**
 * Props for the useLazyLoading hook.
 *
 * Defines the configuration options for lazy loading behavior.
 */
export interface UseLazyLoadingProps {
  /** Data source for fetching tree items */
  dataSource?: DataSource;
  /** Cache implementation for storing loaded data */
  dataSourceCache?: DataSourceCache;
  /** Initial tree items to start with */
  initialItems?: TreeViewItem[];
  /** Time (ms) after which previously fetched children are considered stale */
  staleTime?: number; // default 30s
}

/**
 * Result object returned by the useLazyLoading hook.
 *
 * Provides the current state and methods for managing lazy loading operations.
 */
export interface UseLazyLoadingResult extends LazyLoadingState {
  /** Current tree items with loaded data */
  items: TreeViewItem[];
  /** Function to load items for a specific parent */
  loadItems: (parentId?: string) => Promise<void>;
  /** Function to clear all cached data */
  clearCache: () => void;
  /** Function to retry loading items for a specific parent */
  retryLoadItems: (parentId: string) => Promise<void>;
  /** Function to handle item expansion and trigger lazy loading */
  handleItemExpansion: (itemId: string, currentItems: TreeViewItem[]) => void;
}

/**
 * useLazyLoading Hook
 *
 * A custom React hook that provides enhanced lazy loading capabilities for tree views.
 * It manages the loading of tree data on-demand, handles caching, and provides
 * comprehensive error handling and retry functionality.
 *
 * @param props - Configuration options for lazy loading
 * @returns Object containing current state and methods for lazy loading
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   loadingItems,
 *   errorItems,
 *   loadItems,
 *   clearCache,
 *   retryLoadItems,
 *   handleItemExpansion
 * } = useLazyLoading({
 *   dataSource: myDataSource,
 *   dataSourceCache: myCache,
 *   initialItems: []
 * });
 * ```
 */
export const useLazyLoading = ({
  dataSource,
  dataSourceCache,
  initialItems = [],
  staleTime = 30_000,
}: UseLazyLoadingProps): UseLazyLoadingResult => {
  // State for managing tree items
  const [items, setItems] = useState<TreeViewItem[]>(initialItems);

  // State for tracking loading items
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // State for tracking error items
  const [errorItems, setErrorItems] = useState<Map<string, string>>(new Map());

  // Use refs to store stable references to avoid recreation
  const dataSourceRef = useRef(dataSource);
  const cacheRef = useRef<DataSourceCache>();
  const fetchedTimesRef = useRef<Map<string, number>>(new Map());

  // Update refs when props change
  dataSourceRef.current = dataSource;

  /**
   * Initialize cache instance with fallback to default cache
   *
   * Uses the provided cache or creates a new DefaultDataSourceCache instance.
   */
  const cache = useMemo(() => {
    const cacheInstance = dataSourceCache || new DefaultDataSourceCache();
    cacheRef.current = cacheInstance;
    return cacheInstance;
  }, [dataSourceCache]);

  /**
   * Clear cache and reset loading/error states
   *
   * Removes all cached data and resets the loading and error states
   * to their initial values.
   */
  const clearCache = useCallback(() => {
    cache.clear();
    setLoadingItems(new Set());
    setErrorItems(new Map());
  }, [cache]);

  /**
   * Update children for a specific parent item
   *
   * Recursively updates the tree structure to add children to a specific parent.
   * This function is memoized to prevent unnecessary re-renders.
   *
   * @param parentId - The ID of the parent item
   * @param children - Array of child items to add
   */
  const updateItemChildren = useCallback((parentId: string, children: TreeViewItem[]) => {
    setItems(prevItems => updateItemsRecursively(prevItems, parentId, children));
  }, []);

  /**
   * Load root items or specific parent items
   *
   * Fetches tree items from the data source, with support for caching.
   * Handles loading states and error management.
   *
   * @param parentId - Optional parent ID to load children for
   * @returns Promise that resolves when loading is complete
   */
  const loadItems = useCallback(async (parentId?: string) => {
    const currentDataSource = dataSourceRef.current;
    const currentCache = cacheRef.current;
    
    if (!currentDataSource) {
      console.warn('useLazyLoading: dataSource is required for lazy loading');
      return;
    }

    const cacheKey = `items-${parentId || 'root'}`;
    const cachedItems = currentCache?.get(cacheKey);

    // Return cached items if available
    if (cachedItems) {
      if (parentId) {
        updateItemChildren(parentId, cachedItems);
      } else {
        setItems(cachedItems);
      }
      return;
    }

    try {
      // Set loading state for the specific parent
      if (parentId) {
        setLoadingItems(prev => new Set(prev).add(parentId));
        setErrorItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(parentId);
          return newMap;
        });
      }

      // Fetch items from data source
      const fetchedItems = await currentDataSource.getTreeItems({ parentId });

      // Cache the results
      currentCache?.set(cacheKey, fetchedItems);

      // Record fetch time
      fetchedTimesRef.current.set(parentId || 'root', Date.now());

      // Update state based on whether we're loading root or children
      if (parentId) {
        updateItemChildren(parentId, fetchedItems);
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(parentId);
          return newSet;
        });
      } else {
        setItems(fetchedItems);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load items';

      if (parentId) {
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(parentId);
          return newSet;
        });
        setErrorItems(prev => new Map(prev).set(parentId, errorMessage));
      }

      console.error('useLazyLoading: Error loading tree items:', error);
      throw error; // Re-throw to allow component to handle
    }
  }, [updateItemChildren]);

  /**
   * Retry loading items for a specific parent
   *
   * Clears the cache for the specified parent and attempts to reload the data.
   *
   * @param parentId - The parent ID to retry loading for
   * @returns Promise that resolves when retry is complete
   */
  const retryLoadItems = useCallback(async (parentId: string) => {
    const currentCache = cacheRef.current;
    const cacheKey = `items-${parentId || 'root'}`;
    currentCache?.delete?.(cacheKey);
    await loadItems(parentId);
  }, [loadItems]);

  /**
   * Handle item expansion and trigger lazy loading
   *
   * Called when a tree item is expanded. Checks if the item has children
   * that need to be loaded and triggers the loading process.
   *
   * @param itemId - The ID of the expanded item
   * @param currentItems - Current tree items for context
   */
  const handleItemExpansion = useCallback((itemId: string, currentItems: TreeViewItem[]) => {
    console.log('useLazyLoading: handleItemExpansion called:', { itemId, currentItemsLength: currentItems.length });
    
    const currentDataSource = dataSourceRef.current;
    if (!currentDataSource) {
      console.log('useLazyLoading: No data source available');
      return;
    }

    const item = findItemById(currentItems, itemId);
    if (item) {
      const childrenCount = currentDataSource.getChildrenCount(item);
      console.log('useLazyLoading: Found item:', { itemId, childrenCount, hasChildren: !!item.children, childrenLength: item.children?.length });
      
      const lastFetched = fetchedTimesRef.current.get(itemId);
      const isStale = !lastFetched || Date.now() - lastFetched > staleTime;

      // Need to load if no children yet OR data considered stale
      if (childrenCount !== 0 && (isStale || !item.children || item.children.length === 0)) {
        // Remove cached entry if stale so cache miss triggers fresh fetch
        if (isStale) {
          cacheRef.current?.delete?.(`items-${itemId}`);
        }
        console.log('useLazyLoading: Loading children for item:', itemId);
        loadItems(itemId).catch((error) => {
          console.error(`Failed to load children for item ${itemId}:`, error);
        });
      } else {
        console.log('useLazyLoading: Item already has children or no children to load');
      }
    } else {
      console.log('useLazyLoading: Item not found:', itemId);
    }
  }, [loadItems, staleTime]);

  return {
    items,
    loadingItems,
    errorItems,
    loadItems,
    clearCache,
    retryLoadItems,
    handleItemExpansion,
  };
};