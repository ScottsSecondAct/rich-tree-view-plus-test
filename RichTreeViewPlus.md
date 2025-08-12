# RichTreeViewPlus Documentation

## Overview

`RichTreeViewPlus` is an enhanced wrapper around MUI X’s `RichTreeView` component that adds transparent **lazy-loading**, **error handling**, and **caching** to large hierarchical data sets.  It is designed to drop-in replace `RichTreeView` with minimal changes while giving you production-ready UX out-of-the-box.

Key improvements:

* 🌳 **Lazy loading** – children are fetched on-demand when a node is expanded.
* ♻️ **Caching** – pluggable cache layer with TTL prevents redundant network calls.
* 🚨 **Robust error handling** – failed loads display inline error states and allow retry.
* 🚦 **Rich UI feedback** – loading placeholders, spinners, error banners, custom icons.
* 🧩 **Composable** – headless hook (`useLazyLoading`) and utilities can be reused in other tree-like UIs.

---

## File Map

| File | Purpose |
| --- | --- |
| `src/rich-tree-view-plus/RichTreeViewPlus.tsx` | **Main component**.  Combines MUI RichTreeView with lazy-loading hook, enhanced slots and UX. |
| `src/rich-tree-view-plus/hooks/useLazyLoading.ts` | **Headless React hook** that orchestrates data fetches, cache interaction, loading / error state. |
| `src/rich-tree-view-plus/types.ts` | Central TypeScript interfaces (`TreeViewItem`, `DataSource`, `DataSourceCache`, etc.). |
| `src/rich-tree-view-plus/cache/DefaultDataSourceCache.ts` | Default in-memory cache implementation with TTL & cleanup helpers. |
| `src/rich-tree-view-plus/components/` | Presentation-only React components and styles. |
| &nbsp;&nbsp;• `LazyTreeItem.tsx` | Tree item rendering loading / error / normal states. |
| &nbsp;&nbsp;• `styled.tsx` | MUI-`styled()` wrappers for TreeItem / containers. |
| `src/rich-tree-view-plus/utils/treeUtils.ts` | Pure helpers for tree traversal, flattening, placeholder injection, etc. |

> **Tip:** All pieces are decoupled—swap any of them with your own implementations while keeping the rest.

---

## Core Component: `RichTreeViewPlus`

```tsx
<RichTreeViewPlus
  dataSource={myDataSource}
  dataSourceCache={myCache /* optional */}
  staleTime={60_000 /* 60s before re-fetch */}
  multiSelect
  onExpandedItemsChange={(e, ids) => console.log('Expanded', ids)}
/>
```

### Props (in addition to the base RichTreeView props)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `items` | `TreeViewItem[]` | Initial root items (can be empty). |
| `dataSource` | `DataSource` | Required provider for fetching nodes. |
| `dataSourceCache` | `DataSourceCache` | Optional cache strategy (default = in-memory). |
| `staleTime` | `number` | Milliseconds before previously-fetched children are considered stale & refetched (default 30 000). |

The component passes through all other MUI RichTreeView props (selection, controlled expansion, styling, etc.).

### Internal Flow

1. **Mount** – hook loads root items via `dataSource.getTreeItems({ parentId: undefined })`.
2. **Expand node** – `handleItemExpansion` checks cache & staleness, then fetches children if needed.
3. **Loading UI** – `enhanceItemsWithStates` injects placeholder child with spinner.
4. **Error** – on failure, placeholder is replaced by inline `Alert` via `LazyTreeItem`.
5. **Cache** – successful fetch stored with TTL; subsequent expands hit cache until stale.

![flow diagram](docs/.assets/rich-tree-flow.png) <!-- optional asset -->

---

## Hook: `useLazyLoading`

A reusable hook that **does not depend on MUI**—ideal if you want to build a different tree UI layer.

```ts
const {
  items,
  loadingItems,
  errorItems,
  loadItems,
  retryLoadItems,
  handleItemExpansion,
  clearCache,
} = useLazyLoading({ dataSource, dataSourceCache, initialItems });
```

Notable behaviours:

* Keeps `loadingItems: Set<string>` & `errorItems: Map<string,string>` for pinpoint UI feedback.
* Automatic cache invalidation via `staleTime`.
* Provides imperative helpers (`retryLoadItems`, `clearCache`).

---

## Utility Functions

* `updateItemsRecursively` – immutably splice children into correct parent.
* `findItemById` – depth-first search by id.
* `enhanceItemsWithStates` – injects placeholders / loading / error state props for UI.
* `flattenTree`, `getParentIds` – misc helpers for traversal & analytics.

---

## Default Cache

`DefaultDataSourceCache` is a thin wrapper around a `Map<string, CacheEntry>` with TTL.

* `set(key, val, ttl?)` & `get(key)` respect expiry.
* `delete`, `clear`, `has`, `size`, `keys`, `cleanup` utilities provided.
* Swap with `localStorage`, `IndexedDB`, or server-side cache by implementing the `DataSourceCache` interface.

---

## Supported Scenarios

| Scenario | How RichTreeViewPlus Helps |
| --- | --- |
| **File Explorer** | Lazy fetch directory listing & file metadata only when expanded; placeholders show pending folders. |
| **Company Directory** | Load departments → teams → employees on demand, reducing initial payload. |
| **Large Taxonomy / Product Catalog** | Millions of nodes stay responsive; caching avoids repeated API calls across navigation. |
| **Permissions-Aware Trees** | Data source can inject permission info; error placeholders handle 403/404 gracefully. |
| **Real-time FS Monitor (PerformanceTest.tsx)** | Rapid expansions collapse & re-expand reuse cached data until TTL expires. |

---

## Extending / Customising

1. **Replace Icons & Label** – create your own `LazyTreeItem` variant and supply via `slots={{ item: MyItem }}`.
2. **Persisted Cache** – implement `DataSourceCache` that stores to `localStorage` or server.
3. **Analytics** – tap into `onExpandedItemsChange` to log user navigation paths (use `utils/getParentIds`).
4. **Virtualisation** – wrap RichTreeViewPlus in a virtual scroll container for extreme-large trees.

---

## Further Reading & Examples

* `src/components/FileSystemTest.tsx` – mock file system explorer demo.
* `src/components/CompanyDirectoryTest.tsx` – HR org-chart example.
* `src/components/ErrorHandlingTest.tsx` – demonstrates retry mechanics.
* `src/components/PerformanceTest.tsx` – stress test for 10 000+ nodes.

---

### License

MIT © 2025 Scott Davis
