import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import FileSystemTest from "./components/FileSystemTest";
import CompanyDirectoryTest from "./components/CompanyDirectoryTest";
import PerformanceTest from "./components/PerformanceTest";
import ErrorHandlingTest from "./components/ErrorHandlingTest";
import CacheTest from "./components/CacheTest";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [globalSettings, setGlobalSettings] = useState({
    multiSelect: true,
    checkboxSelection: false,
    darkMode: false,
    showDebugInfo: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleSetting = (setting: keyof typeof globalSettings) => {
    setGlobalSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          🌳 RichTreeViewPlus Test Suite
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Comprehensive testing application for lazy-loading tree view component
        </Typography>
      </Box>

      {/* Global Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Global Settings
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={globalSettings.multiSelect}
                onChange={() => toggleSetting("multiSelect")}
              />
            }
            label="Multi Select"
          />
          <FormControlLabel
            control={
              <Switch
                checked={globalSettings.checkboxSelection}
                onChange={() => toggleSetting("checkboxSelection")}
              />
            }
            label="Checkbox Selection"
          />
          <FormControlLabel
            control={
              <Switch
                checked={globalSettings.darkMode}
                onChange={() => toggleSetting("darkMode")}
              />
            }
            label="Dark Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={globalSettings.showDebugInfo}
                onChange={() => toggleSetting("showDebugInfo")}
              />
            }
            label="Show Debug Info"
          />
        </FormGroup>
      </Paper>

      {/* Test Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="📁 File System" />
          <Tab label="🏢 Company Directory" />
          <Tab label="⚡ Performance" />
          <Tab label="❌ Error Handling" />
          <Tab label="💾 Cache Testing" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <FileSystemTest settings={globalSettings} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CompanyDirectoryTest settings={globalSettings} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <PerformanceTest settings={globalSettings} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ErrorHandlingTest settings={globalSettings} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <CacheTest settings={globalSettings} />
      </TabPanel>

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: "primary.50" }}>
        <Typography variant="h6" gutterBottom>
          📋 Testing Instructions
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>
              <strong>File System Tab:</strong> Test basic lazy loading with
              nested folders
            </li>
            <li>
              <strong>Company Directory Tab:</strong> Test with different data
              structures
            </li>
            <li>
              <strong>Performance Tab:</strong> Test with large datasets and
              measure performance
            </li>
            <li>
              <strong>Error Handling Tab:</strong> Test error scenarios and
              recovery
            </li>
            <li>
              <strong>Cache Testing Tab:</strong> Test caching behavior and TTL
            </li>
          </ol>
        </Typography>
      </Paper>
    </Container>
  );
}

export default App;
