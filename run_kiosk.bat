@echo off
title Kiosk Backend Server
:: 1. Navigate to your project folder
cd /d "C:\Users\sanch\OneDrive\Documents\Documents_Personal\INCO\Digital_Era\PO_MAN_website_input"

:: 2. Run the python script
python backend/app.py

:: 3. Keep the window open if it crashes so you can see why
pause