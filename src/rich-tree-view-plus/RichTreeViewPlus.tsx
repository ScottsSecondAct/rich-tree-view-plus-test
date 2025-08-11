/**
 * @fileoverview RichTreeViewPlus - Enhanced Tree View Component with Lazy Loading
 *
 * This component extends MUI's RichTreeView with enhanced lazy loading capabilities,
 * better error handling, and improved user experience. It provides visual feedback
 * for loading states, error recovery, and flexible caching options.
 *
 * Key Features:
 * - Enhanced lazy loading with visual indicators
 * - Comprehensive error handling and retry functionality
 * - Flexible caching system with TTL support
 * - Custom tree item component with loading/error states
 * - Automatic expansion handling for lazy loading
 * - Support for both single and multi-selection modes
 *
 * @author RichTreeViewPlus Team
 * @version 1.0.0
 * @license MIT
 */

import React, { useEffect, useCallback, useMemo, forwardRef, useRef } from "react";
import { RichTreeViewProps, useTreeViewApiRef } from "@mui/x-tree-view";
import {
  ExpandMore,
  ChevronRight,
  FiberManualRecord,
} from "@mui/icons-material";

import { TreeViewItem, DataSource, DataSourceCache } from "./types";
import { RichTreeView } from "@mui/x-tree-view";
import { LazyTreeItem } from "./components/LazyTreeItem";
import { useLazyLoading } from "./hooks/useLazyLoading";
import { enhanceItemsWithStates } from "./utils/treeUtils";

/**
 * Props for the RichTreeViewPlus component.
 *
 * Extends RichTreeViewProps with enhanced lazy loading capabilities
 * while maintaining compatibility with the base RichTreeView component.
 */
export interface RichTreeViewPlusProps
  extends Omit<RichTreeViewProps<any, any>, "items"> {
  /** Initial tree items to display */
  items?: TreeViewItem[];
  /** Data source for lazy loading tree items */
  dataSource?: DataSource;
  /** Cache implementation for storing loaded data */
  dataSourceCache?: DataSourceCache;
}

/**
 * RichTreeViewPlus - Enhanced Tree View Component
 *
 * A wrapper around MUI's RichTreeView that adds enhanced lazy loading capabilities,
 * better error handling, and improved user experience. The component automatically
 * handles loading states, error recovery, and provides visual feedback to users.
 *
 * @param props - Component props
 * @param ref - Forwarded ref to the underlying RichTreeView
 * @returns RichTreeViewPlus component
 *
 * @example
 * ```tsx
 * <RichTreeViewPlus
 *   dataSource={myDataSource}
 *   dataSourceCache={myCache}
 *   multiSelect={true}
 *   onExpandedItemsChange={handleExpansion}
 * />
 * ```
 */
export const RichTreeViewPlus = forwardRef<
  HTMLUListElement,
  RichTreeViewPlusProps
>((props, ref) => {
  const {
    items = [],
    dataSource,
    dataSourceCache,
    onExpandedItemsChange,
    expandedItems: controlledExpandedItems,
    defaultExpandedItems = [],
    ...otherProps
  } = props;

  // Initialize the tree view API reference
  const apiRef = useTreeViewApiRef();

  // Determine if expansion is controlled by parent component
  const isControlledExpansion = controlledExpandedItems !== undefined;

  // Use refs to store stable references
  const dataSourceRef = useRef(dataSource);
  const itemsRef = useRef(items);

  // Update refs when props change
  dataSourceRef.current = dataSource;
  itemsRef.current = items;

  // Use the lazy loading hook for enhanced data management
  const {
    items: internalItems,
    loadingItems,
    errorItems,
    loadItems,
    handleItemExpansion,
  } = useLazyLoading({
    dataSource,
    dataSourceCache,
    initialItems: items,
  });

  /**
   * Initialize items from data source if no initial items provided
   *
   * This effect runs when the component mounts or when the data source changes.
   * It automatically loads the initial tree data if no items are provided.
   */
  useEffect(() => {
    const currentDataSource = dataSourceRef.current;
    
    if (currentDataSource && internalItems.length === 0) {
      loadItems().catch((error) => {
        console.error("RichTreeViewPlus: Failed to load initial items:", error);
      });
    }
  }, [dataSource, internalItems.length, loadItems]);

  /**
   * Enhanced expansion change handler
   *
   * Handles both controlled and uncontrolled expansion states.
   * For uncontrolled expansion, it automatically triggers lazy loading
   * when items are expanded.
   *
   * @param event - React synthetic event (can be null)
   * @param itemIds - Array of expanded item IDs
   */
  const handleExpandedItemsChange = useCallback(
    (event: React.SyntheticEvent | null, itemIds: string[]) => {
      console.log('RichTreeViewPlus: handleExpandedItemsChange called:', { itemIds, event });
      
      // Call the parent's onExpandedItemsChange first
      if (onExpandedItemsChange) {
        onExpandedItemsChange(event as React.SyntheticEvent, itemIds);
      }

      // Always handle lazy loading when items are expanded, regardless of control mode
      if (dataSourceRef.current) {
        // Get the previous expanded items to determine which ones are newly expanded
        const previousExpanded = controlledExpandedItems || [];
        const newlyExpanded = itemIds.filter(id => !previousExpanded.includes(id));
        
        console.log('RichTreeViewPlus: newlyExpanded items:', newlyExpanded);
        
        // Handle lazy loading for newly expanded items
        newlyExpanded.forEach((itemId) => {
          console.log('RichTreeViewPlus: calling handleItemExpansion for:', itemId);
          handleItemExpansion(itemId, internalItems);
        });
      }
    },
    [
      onExpandedItemsChange,
      controlledExpandedItems,
      internalItems,
      handleItemExpansion,
    ]
  );

  /**
   * Enhance items with loading/error states and lazy loading placeholders
   *
   * This memoized value processes the internal items to add UI-specific
   * properties like loading indicators and error states.
   */
  const enhancedItems = useMemo(() => {
    return enhanceItemsWithStates(
      internalItems,
      { loadingItems, errorItems },
      dataSource
    );
  }, [internalItems, loadingItems, errorItems, dataSource]);

  /**
   * Custom slots configuration for enhanced UI
   *
   * Provides custom components for tree items, icons, and other UI elements
   * while allowing overrides through otherProps.slots.
   */
  const slots = useMemo(
    () => ({
      item: LazyTreeItem,
      collapseIcon: ExpandMore,
      expandIcon: ChevronRight,
      endIcon: FiberManualRecord,
      ...otherProps.slots,
    }),
    [otherProps.slots]
  );

  return (
    <RichTreeView
      ref={ref}
      apiRef={apiRef}
      items={enhancedItems}
      expandedItems={controlledExpandedItems}
      defaultExpandedItems={defaultExpandedItems}
      onExpandedItemsChange={handleExpandedItemsChange}
      slots={slots}
      sx={{
        p: 1,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        ...otherProps.sx,
      }}
      {...otherProps}
    />
  );
});

// Set display name for debugging and React DevTools
RichTreeViewPlus.displayName = "RichTreeViewPlus";

export default RichTreeViewPlus;
