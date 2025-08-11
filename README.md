# RichTreeViewPlus Test Application

A comprehensive test application for the RichTreeViewPlus component that demonstrates lazy loading, caching, error handling, and performance characteristics.

## Setup Instructions

1. **Clone or create the project:**

   ```bash
   npx create-react-app rich-tree-view-plus-test --template typescript
   cd rich-tree-view-plus-test
   ```

2. **Install dependencies:**

   ```bash
   npm install @mui/material @mui/icons-material @mui/x-tree-view @emotion/react @emotion/styled
   ```

3. **Copy the RichTreeViewPlus source files** into `src/RichTreeViewPlus/` directory with the modular structure provided earlier.

4. **Replace the default files** with the test application files provided above.

5. **Start the application:**

   ```bash
   npm start
   ```

## Test Scenarios

### 📁 File System Test

- **Purpose:** Test basic lazy loading functionality
- **Features:** Nested folder structures, realistic file counts
- **Tests:** Expansion, selection, navigation

### 🏢 Company Directory Test  

- **Purpose:** Test with different data structures and sizes
- **Features:** Small/Medium/Large company data sets
- **Tests:** Scalability, department hierarchies

### ⚡ Performance Test

- **Purpose:** Measure component performance with large datasets
- **Features:** 100 categories with 10-60 items each
- **Tests:** Load times, rendering performance, memory usage

### ❌ Error Handling Test

- **Purpose:** Test error scenarios and recovery
- **Features:** Network timeouts, server errors, permission errors
- **Tests:** Error display, retry mechanisms, graceful degradation

### 💾 Cache Test

- **Purpose:** Test caching behavior and efficiency
- **Features:** 30-second TTL, cache hit/miss tracking
- **Tests:** Cache efficiency, memory usage, TTL expiration

## Project Structure

```text
src/
├── App.tsx                     # Main application with tabs
├── index.tsx                   # React entry point
├── components/
│   ├── FileSystemTest.tsx      # File system test scenario
│   ├── CompanyDirectoryTest.tsx # Company directory test
│   ├── PerformanceTest.tsx     # Performance testing
│   ├── ErrorHandlingTest.tsx   # Error handling tests
│   ├── CacheTest.tsx          # Cache behavior tests
│   └── DebugPanel.tsx         # Debug information panel
└── RichTreeViewPlus/          # Your RichTreeViewPlus module
    ├── RichTreeViewPlus.tsx
    ├── types.ts
    ├── index.ts
    ├── components/
    ├── hooks/
    ├── utils/
    └── cache/
```

## Key Features Tested

✅ **Lazy Loading:** Children load on demand
✅ **Caching:** Built-in cache with TTL
✅ **Error Handling:** Graceful error recovery
✅ **Performance:** Large dataset handling
✅ **State Management:** Expansion and selection
✅ **Theme Integration:** MUI theme compatibility
✅ **Multi-select:** Checkbox and standard selection
✅ **Debug Tools:** Real-time monitoring

## Usage Tips

1. **Open Browser DevTools** to see console logs and network activity
2. **Use the Debug Panels** to monitor component state changes
3. **Test Error Scenarios** by enabling different error modes
4. **Monitor Performance** with the built-in metrics tracking
5. **Experiment with Settings** using the global configuration panel

This test application provides comprehensive coverage of all RichTreeViewPlus features and edge cases, allowing you to verify the component works correctly in various scenarios.
