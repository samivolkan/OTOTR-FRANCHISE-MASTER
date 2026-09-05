@echo off
cd /d "%~dp0"
echo OTOTR gercek fotograf alternatifi http://127.0.0.1:4318/real-360.html
start "" "http://127.0.0.1:4318/real-360.html"
node tools/serve.cjs
pause
