import React, { useState, useRef } from "react";
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

  // Custom cache with monitoring
  const cacheRef = useRef(new DefaultDataSourceCache(30000)); // 30 second TTL for testing
  const requestStatsRef = useRef<Map<string, CacheStats>>(new Map());

  const updateCacheStats = (key: string, isHit: boolean) => {
    const stats = requestStatsRef.current.get(key) || {
      key,
      hits: 0,
      misses: 0,
      lastAccess: new Date(),
    };

    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    stats.lastAccess = new Date();

    requestStatsRef.current.set(key, stats);
    setCacheStats(Array.from(requestStatsRef.current.values()));
  };

  const cacheTestDataSource: DataSource = {
    getTreeItems: async ({ parentId }) => {
      const cacheKey = `items-${parentId || "root"}`;
      const cached = cacheRef.current.get(cacheKey);

      setRequestCount((prev) => prev + 1);

      if (cached) {
        updateCacheStats(cacheKey, true);
        console.log(`Cache HIT for ${cacheKey}`);
        return cached;
      }

      updateCacheStats(cacheKey, false);
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
