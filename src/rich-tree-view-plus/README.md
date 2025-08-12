# RichTreeViewPlus

A drop-in replacement for MUI v5+ `RichTreeView` that adds first-class *lazy-loading*, *caching* and *per-node TTL* support while preserving the familiar MUI API.

RichTreeViewPlus is ideal for huge or remote hierarchies such as:

* File-systems or cloud storage buckets
* Organisation charts & directory trees
* Product catalogues
* Anything where child items are expensive to fetch and should be loaded **on-demand**

---

## Table of contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Core concepts](#core-concepts)
4. [Component API](#component-api)
5. [Supporting types](#supporting-types)
6. [Customisation](#customisation)
7. [Advanced topics](#advanced-topics)
8. [FAQ](#faq)
9. [License](#license)

---

## Installation

```bash
# with npm
npm install @mui/material @mui/x-tree-view rich-tree-view-plus

# or with yarn
yarn add @mui/material @mui/x-tree-view rich-tree-view-plus
```

RichTreeViewPlus has the same peer-deps as **@mui/x-tree-view**. Make sure you are using MUI v5 or newer.

---

## Quick start

```tsx
import { RichTreeViewPlus, type TreeViewItem } from 'rich-tree-view-plus';
import { MemoryDataSource } from './myDataSources';

const dataSource = new MemoryDataSource();

export default function FileExplorer() {
  return (
    <RichTreeViewPlus
      dataSource={dataSource}
      // optional – enable multi-selection & check-boxes
      multiSelect
      checkboxSelection
      // Optional cache – defaults to in-memory implementation
      dataSourceCache={dataSource.cache}
      // Children become stale after 30 s and will be re-fetched next expand
      staleTime={30_000}
      sx={{ height: 600, overflow: 'auto' }}
    />
  );
}
```

---

## Core concepts

### 1. `DataSource`
An abstraction around *where* your data lives. It is responsible for:

* Fetching the children for a given parent id (`getTreeItems`).
* Providing the *number* of children without fetching them (`getChildrenCount`).

RichTreeViewPlus never looks at your raw backend – it only talks to a `DataSource` implementation.

### 2. `DataSourceCache`
A pluggable cache that RichTreeViewPlus consults **before** asking the `DataSource`.

* Default implementation is in-memory with optional TTL per entry.
* Provide your own (e.g. `localStorage`, IndexedDB, SWR cache) by implementing the same interface.

### 3. Per-node TTL
Tree nodes may become out-of-date (e.g. a folder was deleted by another user). Specify `staleTime` to tell RichTreeViewPlus when previously-fetched children should be considered *stale* and automatically re-fetched on the next expand.

---

## Component API

### `<RichTreeViewPlus />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataSource` | `DataSource` | **required** | Object that supplies tree data lazily. |
| `dataSourceCache` | `DataSourceCache` | `new DefaultDataSourceCache()` | Override caching strategy. Pass `null` to disable caching entirely. |
| `items` | `TreeViewItem[]` | `[]` | Pre-loaded tree (rare – usually use lazy mode). |
| `staleTime` | `number` | `30_000` | Milliseconds after which already-fetched children are treated as stale and re-loaded on expansion. |
| `multiSelect` | `boolean` | `false` | Enable multi-selection (same as MUI). |
| `checkboxSelection` | `boolean` | `false` | Show checkboxes next to each item. |
| `expandedItems` | `string[]` | | Make the component [controlled] – parent drives expansion state. |
| `onExpandedItemsChange` | `(event, itemIds: string[]) => void` | | Callback when user expands / collapses. |
| `selectedItems` | `string[]` | | Controlled selection state. |
| `onSelectedItemsChange` | `(event, itemIds: string | string[] | null) => void` | | Called when selection changes. |
| `loadingIndicator` | `ReactNode` | `'Loading…'` | Rendered while children are being fetched. |
| `errorIndicator` | `(error: string) => ReactNode` | | Custom render for errors. |
| `sx`, `style`, `className`, `slots`, `slotProps`, `...` | | Passed straight to the underlying MUI `RichTreeView`. |

> **Tip** – All other props accepted by MUI RichTreeView are forwarded unchanged.

---

## Supporting types

### `TreeViewItem`
```ts
interface TreeViewItem {
  id: string;          // unique per node
  label: string;       // what the user sees
  children?: TreeViewItem[]; // optional eager children
  childrenCount?: number;    // how many children without loading them
  // …any other custom fields (icon, metadata, etc.)
}
```

### `DataSource`
```ts
interface DataSource {
  getTreeItems(params: { parentId?: string }): Promise<TreeViewItem[]>;
  getChildrenCount(item: TreeViewItem): number;
}
```

### `DataSourceCache`
```ts
interface DataSourceCache {
  get(key: string): any | Promise<any>;   // null if not found/expired
  set(key: string, value: any, ttl?: number): void;
  clear(): void;
  delete?(key: string): boolean;
  has?(key: string): boolean;
}
```

---

## Customisation

### Custom tree item appearance
RichTreeViewPlus exposes a `LazyTreeItem` component which already shows loading / error / checkbox states. You can replace it via MUI **slots**:

```tsx
<RichTreeViewPlus
  dataSource={dataSource}
  slots={{ item: MyFancyTreeItem }}
/>
```

Your component receives all original MUI props **plus**:

```ts
interface ExtraLazyProps {
  isLoading?: boolean;
  error?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  isPlaceholder?: boolean; // internal
}
```

### Styling & theming
Because it is built on MUI you can theme it exactly the same way – either using the `sx` prop or your global theme overrides.

---

## Advanced topics

### 1. Disabling caching
```tsx
<RichTreeViewPlus dataSource={apiDataSource} dataSourceCache={null} />
```

### 2. Using localStorage cache
Implement the `DataSourceCache` interface with `localStorage` or any persistence layer you want and pass it via the `dataSourceCache` prop.

### 3. Programmatic control (controlled expansion)
```tsx
const [expanded, setExpanded] = useState<string[]>([]);
<RichTreeViewPlus
  dataSource={ds}
  expandedItems={expanded}
  onExpandedItemsChange={(_, ids) => setExpanded(ids)}
/>
```

### 4. Hook-only usage
`useLazyLoading` is exported for advanced cases where you want full control over rendering.

```ts
const { items, handleItemExpansion } = useLazyLoading({ dataSource });
```

---

## FAQ

**Q: How big can my tree be?**  
Lazy loading means you only render what the user actually expands, so millions of nodes are fine provided they are chunked sensibly at each level.

**Q: Does it work with server components / SSR?**  
Yes – however initial fetches happen on the server. Make sure your DataSource is SSR-safe.

**Q: How do I show custom icons?**  
Add whatever fields you need to `TreeViewItem` (e.g. `icon`) and render them in your custom item component.

---

## License

MIT – © 2025 Scott Davis
