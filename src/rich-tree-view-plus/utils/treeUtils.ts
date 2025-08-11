/**
 * @fileoverview Tree Utilities - Helper Functions for Tree Operations
 * 
 * This file contains utility functions for manipulating tree structures,
 * enhancing tree items with UI states, and performing common tree operations.
 * These utilities support the RichTreeViewPlus component's lazy loading
 * and state management features.
 * 
 * Key Functions:
 * - Recursive tree updates and item finding
 * - Tree item enhancement with loading/error states
 * - Tree flattening and parent relationship utilities
 * - State management for lazy loading operations
 * 
 * @author RichTreeViewPlus Team
 * @version 1.0.0
 * @license MIT
 */

import { TreeViewItem, EnhancedTreeViewItem, DataSource, LazyLoadingState } from '../types';

/**
 * Recursively updates items in a tree structure
 * 
 * Traverses the tree structure and updates the children of a specific parent item.
 * This function is used to add loaded children to existing tree items during
 * lazy loading operations.
 * 
 * @param items - The current tree items array
 * @param parentId - The ID of the parent item to update
 * @param children - The new children to add to the parent
 * @returns New tree items array with updated children
 * 
 * @example
 * ```tsx
 * const updatedItems = updateItemsRecursively(
 *   currentItems,
 *   'parent-1',
 *   [{ id: 'child-1', label: 'Child 1' }]
 * );
 * ```
 */
export const updateItemsRecursively = (
  items: TreeViewItem[],
  parentId: string,
  children: TreeViewItem[]
): TreeViewItem[] => {
  return items.map(item => {
    if (item.id === parentId) {
      return { ...item, children };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateItemsRecursively(item.children, parentId, children)
      };
    }
    return item;
  });
};

/**
 * Recursively finds an item by ID in a tree structure
 * 
 * Searches through the entire tree structure to find an item with the
 * specified ID. Returns null if the item is not found.
 * 
 * @param items - The tree items array to search in
 * @param id - The ID of the item to find
 * @returns The found item or null if not found
 * 
 * @example
 * ```tsx
 * const item = findItemById(treeItems, 'item-123');
 * if (item) {
 *   console.log('Found item:', item.label);
 * }
 * ```
 */
export const findItemById = (items: TreeViewItem[], id: string): TreeViewItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Enhances items with loading/error states and lazy loading placeholders
 * 
 * Processes tree items to add UI-specific properties like loading indicators,
 * error states, and children count information. This function is used to
 * prepare tree items for rendering with proper visual feedback.
 * 
 * @param items - The tree items to enhance
 * @param lazyLoadingState - Current loading and error states
 * @param dataSource - Optional data source for children count
 * @returns Enhanced tree items with UI state properties
 * 
 * @example
 * ```tsx
 * const enhancedItems = enhanceItemsWithStates(
 *   treeItems,
 *   { loadingItems: new Set(['item-1']), errorItems: new Map() },
 *   dataSource
 * );
 * ```
 */
export const enhanceItemsWithStates = (
  items: TreeViewItem[],
  { loadingItems, errorItems }: LazyLoadingState,
  dataSource?: DataSource
): EnhancedTreeViewItem[] => {
  return items.map(item => {
    const childrenEnhanced = item.children && item.children.length > 0
      ? enhanceItemsWithStates(item.children, { loadingItems, errorItems }, dataSource)
      : item.children;

    const childrenWereChanged = childrenEnhanced !== item.children;

    if (!dataSource) {
      return childrenWereChanged ? { ...item, children: childrenEnhanced } as EnhancedTreeViewItem : item as EnhancedTreeViewItem;
    }

    const childrenCount = dataSource.getChildrenCount(item);
    const isLoading = loadingItems.has(item.id);
    const error = errorItems.get(item.id);
    const needsPlaceholder = childrenCount !== 0 && (!item.children || item.children.length === 0);

    const needsEnhancement = isLoading || error || needsPlaceholder || childrenWereChanged;

    if (!needsEnhancement) {
      return item as EnhancedTreeViewItem;
    }

    const enhanced: EnhancedTreeViewItem = {
      ...item,
      children: childrenEnhanced,
      slotProps: {
        ...item.slotProps,
        item: {
          ...(item.slotProps?.item ?? {}),
          isLoading,
          error,
          hasChildren: childrenCount !== 0,
          childrenCount,
        },
      },
    };

    if (isLoading) {
      enhanced.children = [{ id: `${item.id}-loading`, label: 'Loading...', slotProps: { item: { isLoading: true } } }];
    } else if (error) {
      enhanced.children = [{ id: `${item.id}-error`, label: 'Error loading children', slotProps: { item: { error } } }];
    } else if (needsPlaceholder) {
      enhanced.children = [{ id: `${item.id}-placeholder`, label: ' ', slotProps: { item: { isPlaceholder: true } } }];
    }

    return enhanced;
  });
};

/**
 * Flattens a tree structure into a flat array
 * 
 * Converts a hierarchical tree structure into a flat array containing
 * all items in depth-first order. This is useful for operations that
 * need to process all items regardless of their level in the tree.
 * 
 * @param items - The tree items to flatten
 * @returns Flat array of all tree items
 * 
 * @example
 * ```tsx
 * const allItems = flattenTree(treeItems);
 * console.log('Total items:', allItems.length);
 * ```
 */
export const flattenTree = (items: TreeViewItem[]): TreeViewItem[] => {
  const flattened: TreeViewItem[] = [];

  const flatten = (items: TreeViewItem[]) => {
    items.forEach(item => {
      flattened.push(item);
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };

  flatten(items);
  return flattened;
};

/**
 * Gets all parent IDs for a given item
 * 
 * Traverses up the tree structure to find all parent IDs for a specific item.
 * Returns an array of parent IDs in order from root to immediate parent.
 * 
 * @param items - The tree items to search in
 * @param targetId - The ID of the target item
 * @returns Array of parent IDs from root to immediate parent
 * 
 * @example
 * ```tsx
 * const parentIds = getParentIds(treeItems, 'child-123');
 * console.log('Parent path:', parentIds); // ['root', 'parent-1', 'parent-2']
 * ```
 */
export const getParentIds = (items: TreeViewItem[], targetId: string): string[] => {
  const parents: string[] = [];

  /**
   * Recursive helper function to find parents
   * 
   * @param items - Current level items to search
   * @param targetId - The target item ID
   * @param currentParents - Current path of parent IDs
   * @returns True if target was found in this branch
   */
  const findParents = (items: TreeViewItem[], targetId: string, currentParents: string[]): boolean => {
    for (const item of items) {
      if (item.id === targetId) {
        parents.push(...currentParents);
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (findParents(item.children, targetId, [...currentParents, item.id])) {
          return true;
        }
      }
    }
    return false;
  };

  findParents(items, targetId, []);
  return parents;
};

export const PLACEHOLDER_ID_SUFFIX = {
  LOADING: '-loading',
  ERROR: '-error',
};