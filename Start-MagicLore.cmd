@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 tools\launch_preview.py
  goto end
)
where python >nul 2>nul
if not errorlevel 1 (
  python tools\launch_preview.py
  goto end
)
echo Python 3 was not found. You can still double-click index.html,
echo or upload the static release to GitHub Pages. No server is required there.
:end
if errorlevel 1 pause
endlocal
