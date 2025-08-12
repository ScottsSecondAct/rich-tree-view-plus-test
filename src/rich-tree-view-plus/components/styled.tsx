/**
 * @fileoverview Styled Components for RichTreeViewPlus
 *
 * This file contains styled components that provide enhanced styling for the
 * RichTreeViewPlus library. These components extend MUI's base components
 * with custom styling for better visual appearance and user experience.
 *
 * Key Components:
 * - StyledRichTreeView: Enhanced tree view container
 * - StyledTreeItem: Enhanced tree item with hover and focus states
 * - LoadingContainer: Container for loading state display
 * - ErrorContainer: Container for error state display
 * - ItemIcon: Icon container for tree items
 * - ItemLabel: Label container for tree items
 *
 * @author Scott Davis
 * @version 1.1.0 - 2025-08-11
 * @license MIT
 */

import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { RichTreeView, TreeItem } from "@mui/x-tree-view";

/**
 * StyledRichTreeView - Enhanced Tree View Container
 *
 * A styled version of RichTreeView with enhanced visual styling including
 * padding, background color, border radius, and border styling.
 */
export const StyledRichTreeView = RichTreeView;

/**
 * StyledTreeItem - Enhanced Tree Item Component
 *
 * A styled version of TreeItem with enhanced visual feedback including
 * hover effects, focus states, selection styling, and proper spacing.
 * Provides a consistent and accessible user experience.
 */
export const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  // Content styling with hover and focus effects
  "& .MuiTreeItem-content": {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.25, 0),
    transition: theme.transitions.create(["background-color", "box-shadow"], {
      duration: theme.transitions.duration.short,
    }),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 1,
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },

  // Icon container styling
  "& .MuiTreeItem-iconContainer": {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(0.5),
    color: theme.palette.action.active,
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  // Label styling
  "& .MuiTreeItem-label": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    color: "inherit",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  // Group transition styling for nested items
  "& .MuiTreeItem-groupTransition": {
    marginLeft: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    borderLeft: `1px dashed ${theme.palette.divider}`,
  },
}));

/**
 * LoadingContainer - Container for Loading State Display
 *
 * A styled container that provides consistent layout and styling for
 * loading states in tree items. Includes proper spacing and alignment
 * for loading spinners and text.
 */
export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1, 0),
  color: theme.palette.text.secondary,
  gap: theme.spacing(1),
}));

/**
 * ErrorContainer - Container for Error State Display
 *
 * A styled container that provides consistent layout and styling for
 * error states in tree items. Includes proper spacing and typography
 * for error alerts and messages.
 */
export const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  "& .MuiAlert-root": {
    padding: theme.spacing(0.5, 1),
    fontSize: theme.typography.caption.fontSize,
  },
}));

/**
 * ItemIcon - Icon Container for Tree Items
 *
 * A styled container for icons in tree items. Provides consistent
 * sizing, color, and alignment for various icon types (folders, files, etc.).
 */
export const ItemIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.action.active,
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
  },
}));

/**
 * ItemLabel - Label Container for Tree Items
 *
 * A styled container for labels in tree items. Provides consistent
 * layout, spacing, and text truncation for item labels and metadata.
 */
export const ItemLabel = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0, // Allow text truncation
}));