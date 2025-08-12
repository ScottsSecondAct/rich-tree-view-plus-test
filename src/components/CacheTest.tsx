import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  RichTreeViewPlus,
  DataSource,
  DefaultDataSourceCache,
} from "../rich-tree-view-plus";

interface CacheTestProps {
  settings: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    showDebugInfo: boolean;
  };
}

interface CacheStats {
  key: string;
  hits: number;
  misses: number;
  lastAccess: Date;
}

const CacheTest: React.FC<CacheTestProps> = ({ settings }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [treeKey, setTreeKey] = useState(0); // force remount to test cache hits

  // Custom cache with monitoring
  const cacheRef = useRef(new DefaultDataSourceCache(30000)); // 30 second TTL for testing
  const requestStatsRef = useRef<Map<string, CacheStats>>(new Map());
  const originalGetRef = useRef<(key: string) => any>();

  const updateCacheStats = useCallback((key: string, isHit: boolean) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[updateCacheStats]', key, isHit ? 'HIT' : 'MISS');
    }
    const prev = requestStatsRef.current.get(key);
    const newStats: CacheStats = {
      key,
      hits: (prev?.hits || 0) + (isHit ? 1 : 0),
      misses: (prev?.misses || 0) + (isHit ? 0 : 1),
      lastAccess: new Date(),
    };

    requestStatsRef.current.set(key, newStats);
    setCacheStats(Array.from(requestStatsRef.current.values()));
  }, []);

  // Patch cache get once to track hits/misses even when data source is not called
  React.useEffect(() => {
    if (!originalGetRef.current) {
      originalGetRef.current = cacheRef.current.get.bind(cacheRef.current);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – overriding method for instrumentation
      cacheRef.current.get = (key: string) => {
        const val = originalGetRef.current!(key);
        updateCacheStats(key, !!val);
        return val;
      };
    }
  }, [updateCacheStats]);

  const cacheTestDataSourceRef = useRef<DataSource>();

  if (!cacheTestDataSourceRef.current) {
    cacheTestDataSourceRef.current = {
      async getTreeItems({ parentId }) {
        const cacheKey = `items-${parentId || "root"}`;
        const cached = cacheRef.current.get(cacheKey);

        if (process.env.NODE_ENV !== 'production') {
          console.log('[DataSource getTreeItems]', cacheKey, 'cached?', !!cached);
        }

        setRequestCount((prev) => prev + 1);

        if (cached) {
          console.log(`Cache HIT for ${cacheKey}`);
          return cached;
        }

        console.log(`Cache MISS for ${cacheKey} - fetching from server`);

        // Simulate server request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let result;
        if (!parentId) {
          result = [
            { id: "cache-1", label: "📁 Cached Folder 1", childrenCount: 3 },
            { id: "cache-2", label: "📁 Cached Folder 2", childrenCount: 4 },
            { id: "cache-3", label: "📁 Cached Folder 3", childrenCount: 2 },
            {
              id: "cache-file.txt",
              label: "📄 cached-file.txt",
              childrenCount: 0,
            },
          ];
        } else {
          const itemCount = Math.floor(Math.random() * 5) + 2;
          result = Array.from({ length: itemCount }, (_, i) => ({
            id: `${parentId}-item-${i}`,
            label: `📄 ${parentId} Item ${i + 1}`,
            childrenCount: 0,
          }));
        }

        cacheRef.current.set(cacheKey, result);
        return result;
      },

      getChildrenCount: (item) => item.childrenCount || 0,
    };
  }

  const cacheTestDataSource = cacheTestDataSourceRef.current;

  const clearCache = () => {
    cacheRef.current.clear();
    requestStatsRef.current.clear();
    setCacheStats([]);
    setRequestCount(0);
  };

  const testCacheEfficiency = async () => {
    // Test: Expand and collapse same items multiple times
    const testItems = ["cache-1", "cache-2"];

    for (let i = 0; i < 3; i++) {
      // Expand
      setExpandedItems(testItems);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Collapse
      setExpandedItems([]);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const totalHits = cacheStats.reduce((sum, stat) => sum + stat.hits, 0);
  const totalMisses = cacheStats.reduce((sum, stat) => sum + stat.misses, 0);
  const hitRate =
    totalHits + totalMisses > 0
      ? (totalHits / (totalHits + totalMisses)) * 100
      : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3 
      }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 66.67%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              💾 Cache Testing
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Cache TTL is set to 30 seconds for testing. Expand folders multiple
              times to see caching in action.
            </Alert>

            <Box mb={2} display="flex" gap={2} alignItems="center">
              <Button variant="contained" onClick={testCacheEfficiency}>
                Run Cache Test
              </Button>
              <Button variant="outlined" onClick={clearCache}>
                Clear Cache
              </Button>
              <Button variant="text" onClick={() => setTreeKey((k) => k + 1)}>
                Remount Tree
              </Button>
              <Chip label={`${requestCount} total requests`} color="primary" />
              <Chip label={`${hitRate.toFixed(1)}% hit rate`} color="success" />
            </Box>

            <Box
              sx={{
                minHeight: 400,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <RichTreeViewPlus
                staleTime={30000}
                key={treeKey}
                dataSource={cacheTestDataSource}
                dataSourceCache={cacheRef.current}
                multiSelect={settings.multiSelect}
                checkboxSelection={settings.checkboxSelection}
                expandedItems={expandedItems}
                onExpandedItemsChange={(_, itemIds) => setExpandedItems(itemIds)}
                selectedItems={selectedItems}
                onSelectedItemsChange={(_, itemIds) =>
                  setSelectedItems(itemIds as string[])
                }
                sx={{ p: 2 }}
              />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Cache Statistics
            </Typography>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Total Requests: {requestCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cache Hits: {totalHits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cache Misses: {totalMisses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hit Rate: {hitRate.toFixed(1)}%
              </Typography>
            </Box>

            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cache Key</TableCell>
                    <TableCell align="center">Hits</TableCell>
                    <TableCell align="center">Misses</TableCell>
                    <TableCell>Last Access</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cacheStats.map((stat) => (
                    <TableRow key={stat.key}>
                      <TableCell>
                        <Typography variant="caption">{stat.key}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={stat.hits}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={stat.misses}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {stat.lastAccess.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CacheTest;
