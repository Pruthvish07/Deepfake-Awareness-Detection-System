@echo off
title Deepfake Awareness and Detection System
color 0B
echo =====================================================================
echo    DEEPFAKE AWARENESS & DETECTION SYSTEM - ENTERPRISE PROTOTYPE
echo    Contributors: Akash U, Aryan H V, Libin P Chacko, Pruthvish B Shetty
echo =====================================================================
echo.
echo Launching Local Autonomous Forensics Server...
cd /d "D:\deepfake-defense-system"

start http://127.0.0.1:8000

"C:\Users\pruthvish\AppData\Local\Python\bin\python.exe" server.py
pause
