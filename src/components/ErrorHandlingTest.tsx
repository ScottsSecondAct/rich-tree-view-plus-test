import React, { useState, useCallback, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { RichTreeViewPlus, DataSource } from "../rich-tree-view-plus";
import { DebugPanel } from "./DebugPanel";

interface ErrorHandlingTestProps {
  settings: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    showDebugInfo: boolean;
  };
}

const ErrorHandlingTest: React.FC<ErrorHandlingTestProps> = ({ settings }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const [errorConfig, setErrorConfig] = useState({
    rootError: false,
    childError: false,
    randomErrors: false,
    slowResponses: false,
    networkTimeouts: false,
  });

  const logRequest = useCallback((message: string) => {
    setRequestLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Memoize the dataSource to prevent recreation on every render
  const errorHandlingDataSource = useMemo((): DataSource => ({
    getTreeItems: async ({ parentId }) => {
      logRequest(`Attempting to load: ${parentId || "root"}`);

      // Simulate slow responses
      if (errorConfig.slowResponses) {
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 + Math.random() * 2000)
        );
      }

      // Simulate network timeouts
      if (errorConfig.networkTimeouts && Math.random() > 0.7) {
        logRequest(`❌ Network timeout for: ${parentId || "root"}`);
        throw new Error("Network timeout - request took too long");
      }

      // Root level errors
      if (!parentId && errorConfig.rootError) {
        logRequest(`❌ Root error triggered`);
        throw new Error("Failed to load root items - server error 500");
      }

      // Child level errors
      if (parentId && errorConfig.childError && parentId.includes("error")) {
        logRequest(`❌ Child error for: ${parentId}`);
        throw new Error(
          `Access denied for ${parentId} - insufficient permissions`
        );
      }

      // Random errors
      if (errorConfig.randomErrors && Math.random() > 0.8) {
        logRequest(`❌ Random error for: ${parentId || "root"}`);
        throw new Error("Random server error - please try again");
      }

      // Normal loading
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!parentId) {
        logRequest(`✅ Successfully loaded root items`);
        return [
          { id: "normal-folder", label: "📁 Normal Folder", childrenCount: 3 },
          {
            id: "error-folder",
            label: "❌ Error Prone Folder",
            childrenCount: 2,
          },
          {
            id: "slow-folder",
            label: "🐌 Slow Loading Folder",
            childrenCount: 5,
          },
          {
            id: "timeout-folder",
            label: "⏰ Timeout Folder",
            childrenCount: 1,
          },
          {
            id: "normal-file.txt",
            label: "📄 normal-file.txt",
            childrenCount: 0,
          },
        ];
      }

      const responses = {
        "normal-folder": [
          { id: "normal-1", label: "📄 Document 1.pdf", childrenCount: 0 },
          { id: "normal-2", label: "📄 Document 2.docx", childrenCount: 0 },
          { id: "normal-3", label: "📄 Document 3.xlsx", childrenCount: 0 },
        ],
        "error-folder": [
          { id: "error-1", label: "📄 Protected File 1", childrenCount: 0 },
          { id: "error-2", label: "📄 Protected File 2", childrenCount: 0 },
        ],
        "slow-folder": [
          { id: "slow-1", label: "📄 Large File 1.zip", childrenCount: 0 },
          { id: "slow-2", label: "📄 Large File 2.iso", childrenCount: 0 },
          { id: "slow-3", label: "📄 Large File 3.tar", childrenCount: 0 },
          { id: "slow-4", label: "📄 Large File 4.dmg", childrenCount: 0 },
          { id: "slow-5", label: "📄 Large File 5.bin", childrenCount: 0 },
        ],
        "timeout-folder": [
          { id: "timeout-1", label: "📄 Remote File.txt", childrenCount: 0 },
        ],
      };

      const result = responses[parentId as keyof typeof responses] || [];
      logRequest(
        `✅ Successfully loaded ${result.length} items for: ${parentId}`
      );
      return result;
    },

    getChildrenCount: (item) => item.childrenCount || 0,
  }), [logRequest, errorConfig]);

  const toggleErrorConfig = useCallback((key: keyof typeof errorConfig) => {
    setErrorConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAll = useCallback(() => {
    setExpandedItems([]);
    setSelectedItems([]);
    setRequestLog([]);
    setErrorConfig({
      rootError: false,
      childError: false,
      randomErrors: false,
      slowResponses: false,
      networkTimeouts: false,
    });
  }, []);

  const handleExpandedItemsChange = useCallback((_: any, itemIds: string[]) => {
    setExpandedItems(itemIds);
  }, []);

  const handleSelectedItemsChange = useCallback((_: any, itemIds: string | string[] | null) => {
    if (Array.isArray(itemIds)) {
      setSelectedItems(itemIds);
    } else if (typeof itemIds === 'string') {
      setSelectedItems([itemIds]);
    } else {
      setSelectedItems([]);
    }
  }, []);

  const handleClearLogs = useCallback(() => {
    setRequestLog([]);
  }, []);

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
              ❌ Error Handling Testing
            </Typography>

            <Alert severity="warning" sx={{ mb: 2 }}>
              Configure error scenarios below to test how the component handles
              failures.
            </Alert>

            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Error Configuration:
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={errorConfig.rootError}
                      onChange={() => toggleErrorConfig("rootError")}
                    />
                  }
                  label="Root Errors"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={errorConfig.childError}
                      onChange={() => toggleErrorConfig("childError")}
                    />
                  }
                  label="Child Errors"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={errorConfig.randomErrors}
                      onChange={() => toggleErrorConfig("randomErrors")}
                    />
                  }
                  label="Random Errors (20%)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={errorConfig.slowResponses}
                      onChange={() => toggleErrorConfig("slowResponses")}
                    />
                  }
                  label="Slow Responses (3-5s)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={errorConfig.networkTimeouts}
                      onChange={() => toggleErrorConfig("networkTimeouts")}
                    />
                  }
                  label="Network Timeouts (30%)"
                />
              </FormGroup>
            </Box>

            <Box mb={2}>
              <Button variant="outlined" onClick={resetAll} size="small">
                Reset All
              </Button>
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
                dataSource={errorHandlingDataSource}
                multiSelect={settings.multiSelect}
                checkboxSelection={settings.checkboxSelection}
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                selectedItems={selectedItems}
                onSelectedItemsChange={handleSelectedItemsChange}
                sx={{ p: 2 }}
              />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
          {settings.showDebugInfo && (
            <DebugPanel
              title="Error Handling Debug"
              expandedItems={expandedItems}
              selectedItems={selectedItems}
              requestLog={requestLog}
              onClearLogs={handleClearLogs}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ErrorHandlingTest;
