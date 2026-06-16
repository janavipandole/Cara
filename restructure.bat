@echo off

rem Create directories
mkdir src
mkdir src\pages
mkdir src\styles

rem Copy JavaScript and CSS files
copy "app.js" "src\main.js"
copy "cart.css" "src\styles\cart.css"
copy "style.css" "src\styles\global.css"

rem Move and update HTML files
for %%f in (*.html) do (
  echo Processing %%f
  powershell -Command "(Get-Content '%%f') -replace 'src=\"app.js\"','src=\"../main.js\"' -replace 'src=\"cart.css\"','src=\"../styles/cart.css\"' -replace 'src=\"style.css\"','src=\"../styles/global.css\"' | Set-Content 'src\pages\%%~nxf'"
)
