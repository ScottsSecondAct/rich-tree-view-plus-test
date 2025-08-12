import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { RichTreeViewPlus } from '../RichTreeViewPlus';
import type { DataSource, TreeViewItem } from '../types';
import { DefaultDataSourceCache } from '../cache/DefaultDataSourceCache';

/**
 * Creates a minimal DataSource backed by an in-memory map.
 * Children are resolved asynchronously to mimic real network latency.
 */
function createMockDataSource() {
  const calls: string[] = [];
  const data: Record<string, TreeViewItem[]> = {
    root: [
      { id: 'parent', label: 'Parent', childrenCount: 1 },
    ],
    parent: [
      { id: 'child-1', label: 'Child 1', childrenCount: 0 },
    ],
  };

  const getTreeItems: DataSource['getTreeItems'] = async ({ parentId }) => {
    const key = parentId ?? 'root';
    calls.push(key);
    // Simulate async latency
    await new Promise((resolve) => setTimeout(resolve, 50));
    return data[key] ?? [];
  };

  const getChildrenCount: DataSource['getChildrenCount'] = (item) => {
    return item.childrenCount ?? (data[item.id]?.length ?? 0);
  };

  return {
    dataSource: {
      getTreeItems,
      getChildrenCount,
    } as DataSource,
    calls,
  } as const;
}

describe('RichTreeViewPlus', () => {
  it('lazy-loads children when a node is expanded', async () => {
    const { dataSource } = createMockDataSource();

    render(<RichTreeViewPlus dataSource={dataSource} multiSelect checkboxSelection />);

    // Wait for root item to load
    await waitFor(() => expect(screen.getByText('Parent')).toBeInTheDocument());

    // Child should not be present before expansion
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();

    // Expand the parent node (button element with role="treeitem")
    fireEvent.click(screen.getByText('Parent'));

    // Wait for lazy load to complete and child to appear
    await waitFor(() => expect(screen.getByText('Child 1')).toBeInTheDocument());
  });

  it('uses cache + staleTime logic (fresh vs stale)', async () => {
    jest.useFakeTimers();
    const { dataSource, calls } = createMockDataSource();

    render(
      <RichTreeViewPlus
        dataSource={dataSource}
        dataSourceCache={new DefaultDataSourceCache()}
        staleTime={500}
      />,
    );

    // Wait for root item
    await waitFor(() => expect(screen.getByText('Parent')).toBeInTheDocument());

    // Expand parent – first fetch
    fireEvent.click(screen.getByText('Parent'));
    await waitFor(() => expect(screen.getByText('Child 1')).toBeInTheDocument());

    // Collapse parent
    fireEvent.click(screen.getByText('Parent'));

    // Expand again immediately – should be served from cache/state (no new fetch)
    fireEvent.click(screen.getByText('Parent'));
    await waitFor(() => expect(screen.getByText('Child 1')).toBeInTheDocument());

    // Advance time beyond staleTime, then collapse & re-expand
    act(() => {
      jest.advanceTimersByTime(600);
    });
    fireEvent.click(screen.getByText('Parent')); // collapse
    fireEvent.click(screen.getByText('Parent')); // expand – should trigger new fetch

    // Wait for possible new child appearance
    await waitFor(() => expect(screen.getByText('Child 1')).toBeInTheDocument());

    // Expect two network calls for 'parent': one initial, one after stale
    const parentCalls = calls.filter((id) => id === 'parent');
    expect(parentCalls.length).toBe(2);

    jest.useRealTimers();
  });
});
