#!/usr/bin/env pwsh

<#### Kill-Port-3000.ps1 ####>
# Purpose: Forcefully terminate any process currently listening on TCP port 3000.
# Usage   : Run from PowerShell ->  ./kill-port-3000.ps1
#           (No admin rights required for stopping owned processes; admin may
#            be necessary for system-owned ones.)
# ----------
# How it works:
#   1. Finds active TCP listeners on the requested port (default 3000).
#   2. Extracts the owning process IDs.
#   3. Iterates over each PID and stops it with `Stop-Process -Force`.
#   4. Logs actions to the console and exits with success even if no process
#      is found.
# ---------------------------------------------------------------------------

param(
    [int]$Port = 3000
)

Write-Host "🔍  Searching for processes listening on TCP port $Port ..."

# Retrieve unique process IDs that own a LISTEN connection on the specified port.
$listenerPids = (
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
)

if (-not $listenerPids) {
    Write-Host "✅  No process is currently listening on port $Port."
    exit 0
}

foreach ($processId in $listenerPids) {
    try {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        $procName = if ($process) { $process.ProcessName } else { "Unknown" }
        Write-Host "⛔  Stopping process [$processId] $procName ..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "✔️   Process [$processId] $procName terminated." -ForegroundColor Green
    } catch {
        Write-Warning "⚠️   Failed to stop process Id $processId : $_"
    }
}

Write-Host "🏁  Done. All listeners on port $Port have been handled."
