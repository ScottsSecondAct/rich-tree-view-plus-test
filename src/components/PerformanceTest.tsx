import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  LinearProgress,
} from "@mui/material";
import { RichTreeViewPlus, DataSource } from "../rich-tree-view-plus";
import { DebugPanel } from "./DebugPanel";
interface PerformanceTestProps {
  settings: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    showDebugInfo: boolean;
  };
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  itemCount: number;
}

const PerformanceTest: React.FC<PerformanceTestProps> = ({ settings }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const [runId, setRunId] = useState(0);
  const setRequestLogRef = useRef(setRequestLog);
  setRequestLogRef.current = setRequestLog;

  const logRequest = useCallback((message: string) => {
    setRequestLogRef.current((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  const startTimeRef = useRef<number>(0);

  const addMetric = useCallback((operation: string, itemCount: number) => {
    const duration = performance.now() - startTimeRef.current;
    setMetrics((prev) => [
      ...prev,
      {
        operation,
        duration,
        timestamp: new Date(),
        itemCount,
      },
    ]);
  }, []);

  // High-performance data source with large datasets (memoized to keep reference stable)
  const performanceDataSource: DataSource = useMemo((): DataSource => ({
    getTreeItems: async ({ parentId }) => {
      startTimeRef.current = performance.now();
      logRequest(`getTreeItems(${parentId ?? 'root'}) start`);

      // Simulate varying load times based on dataset size
      const delay = parentId
        ? 100 + Math.random() * 200
        : 300 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));

      let result;
      if (!parentId) {
        const rootItems = Array.from({ length: 100 }, (_, i) => ({
          id: `category-${i}`,
          label: `📁 Category ${i + 1}`,
          childrenCount: Math.floor(Math.random() * 50) + 10,
        }));

        addMetric("Load Root Items", rootItems.length);
        result = rootItems;
      } else {
        // Extract category number from parentId
        const categoryNum = parseInt(parentId.split("-")[1]);
        const itemCount = Math.floor(Math.random() * 50) + 10;

        const childItems = Array.from({ length: itemCount }, (_, i) => {
          const hasChildren = Math.random() > 0.7; // 30% chance of having children
          return {
            id: `${parentId}-item-${i}`,
            label: `${hasChildren ? "📁" : "📄"} Item ${categoryNum}-${i + 1}`,
            childrenCount: hasChildren ? Math.floor(Math.random() * 20) + 1 : 0,
          };
        });

        addMetric(`Load Children for ${parentId}`, childItems.length);
        result = childItems;
      }

      logRequest(`getTreeItems(${parentId ?? 'root'}) -> returned ${result.length}`);
      return result;
    },

    getChildrenCount: (item) => item.childrenCount || 0,
  }), [addMetric, logRequest, runId]);

  const runPerformanceTest = async () => {
    // Start a new run: increment runId so the data source (and tree) remounts
    setRunId((prev) => prev + 1);
    setIsRunningTest(true);
    setTestProgress(0);
    setMetrics([]);
    setRequestLog([]);

    try {
      // Test 1: Expand first 10 categories
      for (let i = 0; i < 10; i++) {
        setExpandedItems((prev) => [...prev, `category-${i}`]);
        setTestProgress((i + 1) * 10);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Test 2: Mass selection
      const allItems = Array.from({ length: 50 }, (_, i) => `category-${i}`);
      setSelectedItems(allItems);
      setTestProgress(70);

      // Test 3: Collapse all
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setExpandedItems([]);
      setTestProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setTestProgress(100);
    } catch (error) {
      console.error("Performance test failed:", error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const clearMetrics = () => {
    setMetrics([]);
  };

  const averageLoadTime =
    metrics.length > 0
      ? metrics.reduce((sum, metric) => sum + metric.duration, 0) /
        metrics.length
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
              ⚡ Performance Testing
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              This test loads 100 categories with 10-60 items each to measure
              performance.
            </Alert>

            <Box mb={2}>
              <Button
                variant="contained"
                onClick={runPerformanceTest}
                disabled={isRunningTest}
                sx={{ mr: 2 }}
              >
                {isRunningTest ? "Running Test..." : "Run Performance Test"}
              </Button>

              <Button onClick={clearMetrics}>Clear Metrics</Button>
            </Box>

            {isRunningTest && (
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Test Progress: {testProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={testProgress} />
              </Box>
            )}

            <Box
              sx={{
                minHeight: 400,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <RichTreeViewPlus
                key={runId}
                dataSource={performanceDataSource}
                multiSelect={settings.multiSelect}
                checkboxSelection={settings.checkboxSelection}
                expandedItems={expandedItems}
                onExpandedItemsChange={(_, itemIds) => setExpandedItems(itemIds)}
                selectedItems={selectedItems}
                onSelectedItemsChange={(_, itemIds) => {
                  if (Array.isArray(itemIds)) {
                    setSelectedItems(itemIds);
                  } else if (typeof itemIds === 'string') {
                    setSelectedItems([itemIds]);
                  } else {
                    setSelectedItems([]);
                  }
                }}
                sx={{ p: 2 }}
              />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Performance Metrics
            </Typography>
            
            {metrics.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Average Load Time: {averageLoadTime.toFixed(2)}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Operations: {metrics.length}
                </Typography>
              </Box>
            )}
          </Paper>

          {settings.showDebugInfo && (
            <DebugPanel
              title="Performance Debug"
              expandedItems={expandedItems}
              selectedItems={selectedItems}
              requestLog={requestLog}
              onClearLogs={() => setRequestLog([])}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PerformanceTest;
