import React from 'react';
import { renderHook, act } from '@testing-library/react';
import type { DataSource, TreeViewItem } from '../types';
import { useLazyLoading } from '../hooks/useLazyLoading';
import { DefaultDataSourceCache } from '../cache/DefaultDataSourceCache';

function createDataSource(map: Record<string, TreeViewItem[]>) {
  const getTreeItems: DataSource['getTreeItems'] = async ({ parentId }) => {
    await new Promise((r) => setTimeout(r, 10));
    return map[parentId ?? 'root'] ?? [];
  };
  const getChildrenCount: DataSource['getChildrenCount'] = (item) => item.childrenCount ?? (map[item.id]?.length ?? 0);
  return { getTreeItems, getChildrenCount } as DataSource;
}

describe('useLazyLoading', () => {
  it('loads root items on mount', async () => {
    const ds = createDataSource({
      root: [{ id: 'a', label: 'A', childrenCount: 0 }],
    });

    const { result } = renderHook(() =>
      useLazyLoading({ dataSource: ds, dataSourceCache: new DefaultDataSourceCache() }),
    );

    // Trigger root load manually
    await act(async () => {
      await result.current.loadItems();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('a');
  });

  it('loads children when handleItemExpansion called', async () => {
    const ds = createDataSource({
      root: [{ id: 'parent', label: 'Parent', childrenCount: 1 }],
      parent: [{ id: 'child', label: 'Child', childrenCount: 0 }],
    });

    const { result } = renderHook(() =>
      useLazyLoading({ dataSource: ds, dataSourceCache: new DefaultDataSourceCache() }),
    );

    // Load root items first
    await act(async () => {
      await result.current.loadItems();
    });

    act(() => {
      result.current.handleItemExpansion('parent', result.current.items);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const parent = result.current.items[0];
    expect(parent.children?.[0].id).toBe('child');
  });
});
