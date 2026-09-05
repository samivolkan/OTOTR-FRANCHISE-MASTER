@echo off
cd /d "%~dp0"
echo OTOTR 3D ornegi http://127.0.0.1:4318/ adresinde acilacak.
start "" "http://127.0.0.1:4318/"
node tools/serve.cjs
pause
