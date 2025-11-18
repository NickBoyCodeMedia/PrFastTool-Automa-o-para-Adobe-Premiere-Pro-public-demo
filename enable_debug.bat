@echo off
echo Habilitando debug mode para CEP...

reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v LogLevel /t REG_SZ /d 6 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v LogLevel /t REG_SZ /d 6 /f

echo Debug mode habilitado. Reinicie o Premiere Pro.
pause
