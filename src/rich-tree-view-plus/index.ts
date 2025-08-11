/**
 * @fileoverview RichTreeViewPlus Library - Main Export File
 * 
 * This file serves as the main entry point for the RichTreeViewPlus library.
 * It exports all public APIs including components, types, hooks, utilities,
 * and cache implementations for use by consuming applications.
 * 
 * Exports:
 * - Main component: RichTreeViewPlus
 * - Type definitions: TreeViewItem, DataSource, DataSourceCache, etc.
 * - Components: LazyTreeItem and styled components
 * - Hooks: useLazyLoading with its types
 * - Cache: DefaultDataSourceCache implementation
 * - Utilities: Tree manipulation and enhancement functions
 * 
 * @author RichTreeViewPlus Team
 * @version 1.0.0
 * @license MIT
 */

// Main component export
export { default as RichTreeViewPlus } from './RichTreeViewPlus';
export type { RichTreeViewPlusProps } from './RichTreeViewPlus';

// Type exports - Core interfaces and types used throughout the library
export type {
  TreeViewItem,           // Basic tree item structure
  DataSource,             // Data source interface for lazy loading
  DataSourceCache,        // Cache interface for data storage
  LazyLoadingState,       // State management for lazy loading
  EnhancedTreeViewItem,   // Enhanced item with UI state properties
} from './types';

// Component exports - Custom components for enhanced functionality
export { LazyTreeItem } from './components/LazyTreeItem';
export {
  StyledRichTreeView,     // Styled tree view container
  StyledTreeItem,         // Styled tree item component
  LoadingContainer,       // Loading state container
  ErrorContainer,         // Error state container
  ItemIcon,               // Icon container for tree items
  ItemLabel,              // Label container for tree items
} from './components/styled';

// Hook exports - Custom hooks for state management
export { useLazyLoading } from './hooks/useLazyLoading';
export type { UseLazyLoadingProps, UseLazyLoadingResult } from './hooks/useLazyLoading';

// Cache exports - Cache implementations for data storage
export { DefaultDataSourceCache } from './cache/DefaultDataSourceCache';

// Utility exports - Helper functions for tree operations
export {
  updateItemsRecursively, // Recursively update tree items
  findItemById,           // Find item by ID in tree structure
  enhanceItemsWithStates, // Enhance items with UI states
  flattenTree,            // Flatten tree to array
  getParentIds,           // Get parent IDs for an item
} from './utils/treeUtils';