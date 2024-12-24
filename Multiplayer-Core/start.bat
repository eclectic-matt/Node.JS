:::: SHOW LOCAL IP
::cmd /k "ipconfig -all | find ^"IPv4 Address^""
::::REM @echo off
::set "_ipLine=ipconfig -all | find "IPv4 Address" > silent
::set "_ip=%_ipLine:~40,-10%" > silent
::ECHO %_ip%
::pause

::S:
::cd Development\Node.JS\Home Quiz
node server.js
::pause
::open "192.168.2.137:8080"