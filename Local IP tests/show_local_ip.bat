@echo off
for /f "tokens=1 delims=:" %%j in ('ping %computername% -4 -n 1 ^| findstr Reply') do (
    set localip=%%j
)
echo Local IP is: %localip:~11%
set timer=%date% %time%
echo %timer% >> IPlog.txt
echo %localip:~11% >> IPlog.txt
echo. >> IPlog.txt

pause