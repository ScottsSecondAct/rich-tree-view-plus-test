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
 * @author Scott Davis
 * @version 1.1.0 - 2025-08-11
 * @license MIT – see LICENSE in the repository root for full text
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
  /** time in ms after which already-loaded children are considered stale */
  staleTime?: number;
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
    staleTime,
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
    staleTime,
  });

  const didInitialLoadRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Initial Data Load
  // This effect performs the first load against the provided DataSource. It
  // executes a single time per unique dataSource instance and sets the
  // didInitialLoadRef flag so the same data isn't fetched twice.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const currentDataSource = dataSourceRef.current;

    if (!currentDataSource) return;

    // Reset the flag if the dataSource object identity changes
    if (dataSource !== currentDataSource) {
      didInitialLoadRef.current = false;
    }

    if (!didInitialLoadRef.current) {
      didInitialLoadRef.current = true;
      loadItems().catch((error) => {
        console.error("RichTreeViewPlus: Failed to load initial items:", error);
      });
    }
  }, [dataSource, loadItems]);

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
      if (!isControlledExpansion && dataSourceRef.current) {
        // Get the previous expanded items to determine which ones are newly expanded
        const previousExpanded: string[] = controlledExpandedItems ?? [];
        const newlyExpanded = itemIds.filter(id => !previousExpanded.includes(id));
        
        console.log('RichTreeViewPlus: newlyExpanded items (uncontrolled):', newlyExpanded);
        
        // Handle lazy loading for newly expanded items
        newlyExpanded.forEach((itemId) => {
          console.log('RichTreeViewPlus: calling handleItemExpansion for (uncontrolled):', itemId);
          handleItemExpansion(itemId, internalItems);
        });
      }
    },
    [
      onExpandedItemsChange,
      controlledExpandedItems,
      internalItems,
      handleItemExpansion,
      isControlledExpansion,
    ]
  );

  // ---------------------------------------------------------------------------
  // Handle programmatic expansion state changes (controlled mode)
  //
  // When the parent component controls the `expandedItems` prop this effect
  // detects which items have become newly expanded and triggers lazy-loading
  // for their children on demand.
  // ---------------------------------------------------------------------------
  const prevControlledExpandedRef = useRef<string[]>(controlledExpandedItems || []);

  useEffect(() => {
    if (!controlledExpandedItems) return; // Only relevant in controlled mode

    const previous = prevControlledExpandedRef.current;
    const newlyExpanded = controlledExpandedItems.filter(
      (id) => !previous.includes(id)
    );

    if (newlyExpanded.length > 0) {
      newlyExpanded.forEach((itemId) => {
        handleItemExpansion(itemId, internalItems);
      });
    }

    // Update ref for next comparison
    prevControlledExpandedRef.current = controlledExpandedItems;
  }, [controlledExpandedItems, internalItems, handleItemExpansion]);

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
