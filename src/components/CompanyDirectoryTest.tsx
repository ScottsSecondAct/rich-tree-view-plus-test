import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  RichTreeViewPlus,
  DataSource,
  TreeViewItem,
} from "../rich-tree-view-plus";
import { DebugPanel } from "./DebugPanel";

interface CompanyDirectoryTestProps {
  settings: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    showDebugInfo: boolean;
  };
}

const CompanyDirectoryTest: React.FC<CompanyDirectoryTestProps> = ({
  settings,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const setRequestLogRef = useRef(setRequestLog);

  // Update ref when setRequestLog changes
  setRequestLogRef.current = setRequestLog;

  const logRequest = useCallback((message: string) => {
    setRequestLogRef.current((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  const getCompanyData = useCallback((size: "small" | "medium" | "large") => {
    const configurations = {
      small: {
        departments: [
          { id: "eng", label: "🔧 Engineering", count: 5 },
          { id: "sales", label: "💼 Sales", count: 3 },
          { id: "hr", label: "👥 HR", count: 2 },
        ],
        employees: {
          eng: 5,
          sales: 3,
          hr: 2,
        },
      },
      medium: {
        departments: [
          { id: "eng", label: "🔧 Engineering", count: 15 },
          { id: "sales", label: "💼 Sales", count: 12 },
          { id: "hr", label: "👥 HR", count: 6 },
          { id: "marketing", label: "📢 Marketing", count: 8 },
          { id: "finance", label: "💰 Finance", count: 5 },
        ],
        employees: {
          eng: 15,
          sales: 12,
          hr: 6,
          marketing: 8,
          finance: 5,
        },
      },
      large: {
        departments: [
          { id: "eng", label: "🔧 Engineering", count: 50 },
          { id: "sales", label: "💼 Sales", count: 35 },
          { id: "hr", label: "👥 HR", count: 15 },
          { id: "marketing", label: "📢 Marketing", count: 25 },
          { id: "finance", label: "💰 Finance", count: 12 },
          { id: "operations", label: "⚙️ Operations", count: 20 },
          { id: "legal", label: "⚖️ Legal", count: 8 },
          { id: "rd", label: "🔬 R&D", count: 30 },
        ],
        employees: {
          eng: 50,
          sales: 35,
          hr: 15,
          marketing: 25,
          finance: 12,
          operations: 20,
          legal: 8,
          rd: 30,
        },
      },
    };
    return configurations[size];
  }, []);

  // Memoize the dataSource to prevent recreation on every render
  const companyDataSource = useMemo((): DataSource => ({
    getTreeItems: async ({ parentId }) => {
      logRequest(
        `Loading company data for: ${
          parentId || "root"
        } (${companySize} company)`
      );

      // Simulate server delay based on company size
      const delay =
        companySize === "large" ? 1500 : companySize === "medium" ? 1000 : 500;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const data = getCompanyData(companySize);

      if (!parentId) {
        return data.departments.map((dept) => ({
          id: dept.id,
          label: `${dept.label} (${dept.count} employees)`,
          childrenCount: dept.count,
        }));
      }

      // Generate employees for department
      const employeeCount =
        data.employees[parentId as keyof typeof data.employees] || 0;
      const employees: TreeViewItem[] = [];

      for (let i = 1; i <= employeeCount; i++) {
        const roles = {
          eng: [
            "Senior Developer",
            "Frontend Engineer",
            "Backend Engineer",
            "DevOps Engineer",
            "QA Engineer",
          ],
          sales: [
            "Account Manager",
            "Sales Rep",
            "Sales Director",
            "Business Dev",
          ],
          hr: ["HR Manager", "Recruiter", "Benefits Coordinator"],
          marketing: [
            "Marketing Manager",
            "Content Creator",
            "Social Media Manager",
          ],
          finance: ["Financial Analyst", "Accountant", "CFO"],
          operations: ["Operations Manager", "Project Manager", "Coordinator"],
          legal: ["Legal Counsel", "Paralegal", "Compliance Officer"],
          rd: ["Research Scientist", "Product Manager", "Innovation Lead"],
        };

        const departmentRoles = roles[parentId as keyof typeof roles] || [
          "Employee",
        ];
        const role = departmentRoles[i % departmentRoles.length];

        employees.push({
          id: `${parentId}-emp-${i}`,
          label: `👤 Employee ${i} - ${role}`,
          childrenCount: 0,
        });
      }

      return employees;
    },

    getChildrenCount: (item) => item.childrenCount || 0,
  }), [logRequest, getCompanyData, companySize]);

  const handleCompanySizeChange = useCallback((size: "small" | "medium" | "large") => {
    setCompanySize(size);
    setExpandedItems([]);
    setSelectedItems([]);
    setRequestLog([]);
  }, []);

  const handleSelectChange = useCallback((e: any) => {
    const value = e.target.value as "small" | "medium" | "large";
    handleCompanySizeChange(value);
  }, [handleCompanySizeChange]);

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

  const handleExpandCoreDepts = useCallback(() => {
    setExpandedItems(["eng", "sales", "hr"]);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedItems([]);
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">🏢 Company Directory</Typography>
              <Box>
                <Chip
                  label={`${companySize} company`}
                  size="small"
                  color="info"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${expandedItems.length} expanded`}
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${selectedItems.length} selected`}
                  size="small"
                  color="secondary"
                />
              </Box>
            </Box>

            <Box mb={2} display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={companySize}
                  label="Company Size"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="small">Small (10 employees)</MenuItem>
                  <MenuItem value="medium">Medium (46 employees)</MenuItem>
                  <MenuItem value="large">Large (195 employees)</MenuItem>
                </Select>
              </FormControl>

              <Button
                size="small"
                onClick={handleExpandCoreDepts}
              >
                Expand Core Depts
              </Button>

              <Button size="small" onClick={handleCollapseAll}>
                Collapse All
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
                items={[]}
                dataSource={companyDataSource}
                multiSelect={settings.multiSelect}
                checkboxSelection={settings.checkboxSelection}
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                selectedItems={selectedItems}
                onSelectedItemsChange={handleSelectedItemsChange}
                defaultExpandedItems={[]}
                sx={{ p: 2 }}
              />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
          {settings.showDebugInfo && (
            <DebugPanel
              title="Company Directory Debug"
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

export default CompanyDirectoryTest;
