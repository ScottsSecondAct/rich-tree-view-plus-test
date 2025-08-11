/**
 * @fileoverview LazyTreeItem - Enhanced Tree Item Component with Loading States
 *
 * A custom tree item component that extends MUI's TreeItem with enhanced
 * loading states, error handling, and visual feedback. This component
 * provides different UI states for loading, error, and normal conditions.
 *
 * Features:
 * - Loading state with spinner and "Loading..." text
 * - Error state with alert component and error message
 * - Dynamic icons based on item type (folder/file)
 * - Children count display for items with children
 * - Responsive design with proper spacing and typography
 *
 * @author RichTreeViewPlus Team
 * @version 1.0.0
 * @license MIT
 */

import React, { forwardRef } from "react";
import { Typography, CircularProgress, Alert } from "@mui/material";
import { TreeItemProps } from "@mui/x-tree-view";
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  StyledTreeItem,
  LoadingContainer,
  ErrorContainer,
  ItemIcon,
  ItemLabel,
} from "./styled";

/**
 * Props for the LazyTreeItem component
 *
 * Extends TreeItemProps with additional properties for loading states,
 * error handling, and children count display.
 */
interface LazyTreeItemProps extends TreeItemProps {
  /** Unique identifier for the tree item */
  itemId: string;
  /** Whether the item is currently loading */
  isLoading?: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Whether the item has children (for lazy loading) */
  hasChildren?: boolean;
  /** Number of children the item has */
  childrenCount?: number;
}

/**
 * LazyTreeItem Component
 *
 * A custom tree item component that provides enhanced visual feedback
 * for different states including loading, error, and normal conditions.
 * The component automatically chooses appropriate icons and displays
 * based on the item's properties and current state.
 *
 * @param props - Component props including loading/error states
 * @param ref - Forwarded ref to the underlying TreeItem
 * @returns LazyTreeItem component
 *
 * @example
 * ```tsx
 * <LazyTreeItem
 *   itemId="item-1"
 *   label="My Item"
 *   isLoading={true}
 *   childrenCount={5}
 * />
 * ```
 */
export const LazyTreeItem = forwardRef<HTMLLIElement, LazyTreeItemProps>(
  (props, ref) => {
    const {
      isLoading,
      error,
      hasChildren,
      childrenCount,
      itemId,
      label,
      ...other
    } = props;

    // Loading state - show spinner and loading text
    if (isLoading) {
      return (
        <StyledTreeItem
          ref={ref}
          itemId={itemId}
          label={
            <LoadingContainer>
              <CircularProgress size={16} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </LoadingContainer>
          }
          {...other}
        />
      );
    }

    // Error state - show error alert with message
    if (error) {
      return (
        <StyledTreeItem
          ref={ref}
          itemId={itemId}
          label={
            <ErrorContainer>
              <Alert
                severity="error"
                variant="outlined"
                icon={<ErrorIcon fontSize="small" />}
              >
                {error}
              </Alert>
            </ErrorContainer>
          }
          {...other}
        />
      );
    }

    /**
     * Determines the appropriate icon for the tree item
     *
     * Returns different icons based on whether the item has children
     * and the number of children it has.
     *
     * @returns React element representing the appropriate icon
     */
    const getItemIcon = () => {
      if (hasChildren) {
        return childrenCount === 0 ? <Folder /> : <FolderOpen />;
      }
      return <InsertDriveFile />;
    };

    // Normal state - show item with icon, label, and optional children count
    return (
      <StyledTreeItem
        ref={ref}
        itemId={itemId}
        label={
          <ItemLabel>
            <ItemIcon>{getItemIcon()}</ItemIcon>
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {label}
            </Typography>
            {childrenCount !== undefined && childrenCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                ({childrenCount})
              </Typography>
            )}
          </ItemLabel>
        }
        {...other}
      />
    );
  }
);

// Set display name for debugging and React DevTools
LazyTreeItem.displayName = "LazyTreeItem";