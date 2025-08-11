import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import {
  RichTreeViewPlus,
  DataSource,
  TreeViewItem,
} from "../rich-tree-view-plus";
import { DebugPanel } from "./DebugPanel";

interface FileSystemTestProps {
  settings: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    showDebugInfo: boolean;
  };
}

const FileSystemTest: React.FC<FileSystemTestProps> = ({ settings }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const treeRef = useRef<any>(null);
  const setRequestLogRef = useRef(setRequestLog);

  // Update ref when setRequestLog changes
  setRequestLogRef.current = setRequestLog;

  const logRequest = useCallback((message: string) => {
    setRequestLogRef.current((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Memoize the dataSource to prevent recreation on every render
  const fileSystemDataSource = useMemo((): DataSource => ({
    getTreeItems: async ({ parentId }) => {
      logRequest(`Loading items for parentId: ${parentId || "root"}`);

      // Simulate realistic loading time
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      if (!parentId) {
        return [
          { id: "documents", label: "📁 Documents", childrenCount: 5 },
          { id: "downloads", label: "📁 Downloads", childrenCount: 8 },
          { id: "pictures", label: "📁 Pictures", childrenCount: 12 },
          { id: "videos", label: "📁 Videos", childrenCount: 3 },
          { id: "music", label: "📁 Music", childrenCount: 25 },
          { id: "desktop", label: "📁 Desktop", childrenCount: 7 },
          { id: "readme.txt", label: "📄 README.txt", childrenCount: 0 },
        ];
      }

      const fileStructure: Record<string, TreeViewItem[]> = {
        documents: [
          { id: "docs-work", label: "📁 Work", childrenCount: 4 },
          { id: "docs-personal", label: "📁 Personal", childrenCount: 3 },
          { id: "docs-archives", label: "📁 Archives", childrenCount: 10 },
          { id: "report.pdf", label: "📄 Annual Report.pdf", childrenCount: 0 },
          { id: "notes.txt", label: "📄 Notes.txt", childrenCount: 0 },
        ],
        downloads: [
          { id: "dl-software", label: "📁 Software", childrenCount: 6 },
          { id: "dl-documents", label: "📁 Documents", childrenCount: 4 },
          { id: "installer.exe", label: "💿 installer.exe", childrenCount: 0 },
          { id: "update.zip", label: "📦 update.zip", childrenCount: 0 },
          { id: "backup.tar.gz", label: "📦 backup.tar.gz", childrenCount: 0 },
          { id: "photo.jpg", label: "🖼️ vacation-photo.jpg", childrenCount: 0 },
          { id: "temp1.tmp", label: "📄 temp1.tmp", childrenCount: 0 },
          { id: "temp2.tmp", label: "📄 temp2.tmp", childrenCount: 0 },
        ],
        pictures: [
          { id: "pics-vacation", label: "📁 Vacation 2024", childrenCount: 45 },
          { id: "pics-family", label: "📁 Family Photos", childrenCount: 128 },
          { id: "pics-work", label: "📁 Work Events", childrenCount: 23 },
          { id: "profile.png", label: "🖼️ profile.png", childrenCount: 0 },
          { id: "avatar.jpg", label: "🖼️ avatar.jpg", childrenCount: 0 },
        ],
        "docs-work": [
          { id: "presentations", label: "📁 Presentations", childrenCount: 8 },
          { id: "contracts", label: "📁 Contracts", childrenCount: 12 },
          {
            id: "meeting-notes.docx",
            label: "📄 Meeting Notes.docx",
            childrenCount: 0,
          },
          { id: "budget.xlsx", label: "📊 Budget 2024.xlsx", childrenCount: 0 },
        ],
        "presentations": [
          { id: "slides-q1", label: "📊 Q1 Slides.pptx", childrenCount: 0 },
          { id: "slides-q2", label: "📊 Q2 Slides.pptx", childrenCount: 0 },
          { id: "slides-allhands", label: "📊 All Hands.pptx", childrenCount: 0 }
        ],
        "contracts": [
          { id: "contract-abc.pdf", label: "📄 Contract ABC.pdf", childrenCount: 0 },
          { id: "contract-xyz.pdf", label: "📄 Contract XYZ.pdf", childrenCount: 0 },
          { id: "nda.pdf", label: "📄 NDA.pdf", childrenCount: 0 }
        ],
        "docs-personal": [
          { id: "taxes-2023.pdf", label: "📄 Taxes 2023.pdf", childrenCount: 0 },
          { id: "resume.docx", label: "📄 Resume.docx", childrenCount: 0 },
          { id: "journal.txt", label: "📄 Journal.txt", childrenCount: 0 }
        ],
        "docs-archives": Array.from({ length: 10 }).map((_, idx) => ({
          id: `archive-${idx + 2010}`,
          label: `🗄️ Archive ${idx + 2010}`,
          childrenCount: 0,
        })),
        "dl-software": [
          { id: "vscode.zip", label: "💿 VSCode.zip", childrenCount: 0 },
          { id: "node.msi", label: "💿 node.msi", childrenCount: 0 },
          { id: "python.exe", label: "💿 python.exe", childrenCount: 0 },
          { id: "git.exe", label: "💿 git.exe", childrenCount: 0 },
          { id: "docker-desktop.exe", label: "💿 docker-desktop.exe", childrenCount: 0 },
          { id: "powershell-7.msi", label: "💿 PowerShell-7.msi", childrenCount: 0 }
        ],
        "dl-documents": [
          { id: "ebook.pdf", label: "📄 eBook.pdf", childrenCount: 0 },
          { id: "manual.pdf", label: "📄 Manual.pdf", childrenCount: 0 },
          { id: "invoice.pdf", label: "📄 Invoice.pdf", childrenCount: 0 },
          { id: "spec.docx", label: "📄 Spec.docx", childrenCount: 0 }
        ],
        "pics-vacation": Array.from({ length: 10 }).map((_, i) => ({
          id: `vac-${i + 1}.jpg`,
          label: `🖼️ Vacation ${i + 1}.jpg`,
          childrenCount: 0,
        })),
        "pics-family": Array.from({ length: 10 }).map((_, i) => ({
          id: `family-${i + 1}.jpg`,
          label: `🖼️ Family ${i + 1}.jpg`,
          childrenCount: 0,
        })),
        "pics-work": Array.from({ length: 10 }).map((_, i) => ({
          id: `work-${i + 1}.jpg`,
          label: `🖼️ Work ${i + 1}.jpg`,
          childrenCount: 0,
        })),
        "videos": [
          { id: "video1.mp4", label: "🎞️ video1.mp4", childrenCount: 0 },
          { id: "video2.mp4", label: "🎞️ video2.mp4", childrenCount: 0 },
          { id: "video3.mp4", label: "🎞️ video3.mp4", childrenCount: 0 }
        ],
        "music": Array.from({ length: 25 }).map((_, i) => ({
          id: `track-${i + 1}.mp3`,
          label: `🎵 Track ${i + 1}.mp3`,
          childrenCount: 0,
        })),
        "desktop": [
          { id: "todo.txt", label: "📄 todo.txt", childrenCount: 0 },
          { id: "project", label: "📁 project", childrenCount: 3 },
          { id: "screenshot.png", label: "🖼️ screenshot.png", childrenCount: 0 },
          { id: "shortcut.lnk", label: "🔗 shortcut.lnk", childrenCount: 0 },
          { id: "presentation.pptx", label: "📊 presentation.pptx", childrenCount: 0 },
          { id: "budget.xlsx", label: "📊 budget.xlsx", childrenCount: 0 },
          { id: "archive.zip", label: "📦 archive.zip", childrenCount: 0 }
        ],
        "project": [
          { id: "index.html", label: "📄 index.html", childrenCount: 0 },
          { id: "app.js", label: "📄 app.js", childrenCount: 0 },
          { id: "styles.css", label: "📄 styles.css", childrenCount: 0 }
        ],
      };

      return fileStructure[parentId] || [];
    },

    getChildrenCount: (item) => item.childrenCount || 0,
  }), [logRequest]);

  const handleClearLogs = useCallback(() => {
    setRequestLog([]);
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedItems([
      "documents",
      "downloads",
      "pictures",
      "docs-work",
      "docs-personal",
    ]);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedItems([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItems(["documents", "downloads", "pictures", "videos", "music"]);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItems([]);
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
              <Typography variant="h6">📁 File System Explorer</Typography>
              <Box>
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

            <Box mb={2}>
              <Button size="small" onClick={handleExpandAll} sx={{ mr: 1 }}>
                Expand All
              </Button>
              <Button size="small" onClick={handleCollapseAll} sx={{ mr: 1 }}>
                Collapse All
              </Button>
              <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
                Select All
              </Button>
              <Button size="small" onClick={handleClearSelection}>
                Clear Selection
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
                ref={treeRef}
                dataSource={fileSystemDataSource}
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
              title="File System Debug"
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

export default FileSystemTest;
