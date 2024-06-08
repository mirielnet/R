@echo off
echo Copyright 2024 miriel.net All Rights Reserved.
echo.

npm install

echo.
echo Installation completed.
set /p choice=Do you want to start start.bat? (y/n): 
if "%choice%"=="y" (
    start start.bat
)

echo.
echo Exiting setup...
timeout /t 3
