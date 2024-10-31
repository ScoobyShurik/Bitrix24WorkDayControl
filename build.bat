@echo off

setlocal enabledelayedexpansion

:: Проверяем наличие папки node_modules
if exist "node_modules" (
  echo "Catalog node_modules exist."
) else (
  echo "Catalog node_modules not exist. starting npm install."
  npm install
)
npm run package

endlocal

exit