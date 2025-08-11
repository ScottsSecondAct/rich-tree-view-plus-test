import React from "react";
import { Paper, Typography, Box, Button, Alert, Chip } from "@mui/material";

interface DebugPanelProps {
  title: string;
  expandedItems: string[];
  selectedItems: string[];
  requestLog: string[];
  onClearLogs: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  title,
  expandedItems,
  selectedItems,
  requestLog,
  onClearLogs,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🐛 {title}
      </Typography>

      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          State Information
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <Chip
            label={`${expandedItems.length} expanded`}
            size="small"
            color="primary"
          />
          <Chip
            label={`${selectedItems.length} selected`}
            size="small"
            color="secondary"
          />
        </Box>
      </Box>

      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">
            Request Log ({requestLog.length})
          </Typography>
          <Button size="small" onClick={onClearLogs}>
            Clear
          </Button>
        </Box>

        <Box
          sx={{
            maxHeight: 300,
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1,
            mt: 1,
            fontSize: "0.75rem",
            fontFamily: "monospace",
            backgroundColor: "grey.50",
          }}
        >
          {requestLog.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No requests yet
            </Typography>
          ) : (
            requestLog.slice(-20).map((log, index) => (
              <div key={index} style={{ marginBottom: "2px" }}>
                {log}
              </div>
            ))
          )}
        </Box>
      </Box>

      <Alert severity="info">
        <Typography variant="caption">
          Monitor component behavior and API calls in real-time
        </Typography>
      </Alert>
    </Paper>
  );
};
