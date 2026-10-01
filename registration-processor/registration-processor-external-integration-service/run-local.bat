@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM Standalone Windows cmd runner for registration-processor-external-integration-service.
REM Linux / macOS / Git Bash: use run-local.sh
REM
REM   run-local.bat init | start | smoke | stop | test | all

set "MODULE_DIR=%~dp0"
if "%MODULE_DIR:~-1%"=="\" set "MODULE_DIR=%MODULE_DIR:~0,-1%"
for %%I in ("%MODULE_DIR%\..") do set "PARENT_DIR=%%~fI"

set "LOCAL_DIR=%MODULE_DIR%\.local"
set "LOG_DIR=%LOCAL_DIR%\logs"
set "PID_DIR=%LOCAL_DIR%\pids"
set "PID_FILE=%PID_DIR%\eis.pid"
set "LOG_FILE=%LOG_DIR%\eis.log"
set "ERR_FILE=%LOG_DIR%\eis.err.log"
set "MODULE=registration-processor-external-integration-service"
set "CONTEXT=/registrationprocessor/v1/eis"
set "STARTED=Started ExternalIntegrationServiceApplication"
set "SWAGGER=%CONTEXT%/swagger-ui.html"
set "OPENAPI=%CONTEXT%/v3/api-docs"
set "EIS_POST=%CONTEXT%/registration-processor/external-integration-service/v1.0"

if not defined EIS_PORT set "EIS_PORT=8201"

set "CMD=%~1"
if "%CMD%"=="" goto :usage
if /I "%CMD%"=="-h" goto :usage
if /I "%CMD%"=="--help" goto :usage
if /I "%CMD%"=="help" goto :usage
if /I "%CMD%"=="init" goto :init
if /I "%CMD%"=="test" goto :test
if /I "%CMD%"=="start" goto :start
if /I "%CMD%"=="stop" goto :stop
if /I "%CMD%"=="smoke" goto :smoke
if /I "%CMD%"=="all" goto :all

echo error: unknown command '%CMD%'
goto :usage

:usage
echo Local registration-processor-external-integration-service ^(local profile, :8201 /registrationprocessor/v1/eis^)
echo.
echo   run-local.bat init     package this module
echo   run-local.bat start    run and wait until Spring Boot is ready
echo   run-local.bat smoke    GET health + OpenAPI
echo   run-local.bat stop
echo   run-local.bat test      Maven tests
echo   run-local.bat all      init + test + start + smoke
echo.
echo Port: %EIS_PORT% ^(override with set EIS_PORT=...^)
echo Config: src\main\resources\application-local.properties
echo Cluster: Dockerfile still uses config-server; it does not activate profile local
exit /b 1

:port_in_use
netstat -ano | findstr /R /C:":%EIS_PORT% .*LISTENING" >nul 2>&1
exit /b %ERRORLEVEL%

:pid_on_port
set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%EIS_PORT% .*LISTENING"') do set "PORT_PID=%%P"
exit /b 0

:ensure_dirs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%PID_DIR%" mkdir "%PID_DIR%"
exit /b 0

:check_prereqs
where java >nul 2>&1
if errorlevel 1 (
  echo error: java is required on PATH
  exit /b 1
)
where mvn >nul 2>&1
if errorlevel 1 (
  echo error: mvn is required on PATH
  exit /b 1
)
exit /b 0

:find_jar
set "BOOT_JAR="
for %%F in ("%MODULE_DIR%\target\%MODULE%-*.jar") do (
  set "CAND=%%~nxF"
  echo !CAND! | findstr /I /C:".original" /C:"sources" /C:"javadoc" >nul
  if errorlevel 1 (
    set "BOOT_JAR=%%~fF"
    goto :find_jar_done
  )
)
:find_jar_done
if not defined BOOT_JAR (
  echo error: no boot jar in target. Run: %~nx0 init
  exit /b 1
)
exit /b 0

:is_running
if not exist "%PID_FILE%" exit /b 1
set /p CHECK_PID=<"%PID_FILE%"
if not defined CHECK_PID exit /b 1
tasklist /FI "PID eq !CHECK_PID!" 2>nul | findstr /I "!CHECK_PID!" >nul
if errorlevel 1 exit /b 1
exit /b 0

:init
call :check_prereqs
if errorlevel 1 exit /b 1
call :stop
ping -n 3 127.0.0.1 >nul
echo ==^> packaging %MODULE% ^(skip tests^)
pushd "%PARENT_DIR%"
call mvn -pl %MODULE% clean package -DskipTests "-Dgpg.skip=true" "-Dmaven.javadoc.skip=true"
set "RC=%ERRORLEVEL%"
popd
if not "%RC%"=="0" exit /b %RC%
echo init complete
exit /b 0

:test
call :check_prereqs
if errorlevel 1 exit /b 1
echo ==^> maven tests
pushd "%PARENT_DIR%"
call mvn -pl %MODULE% test "-Dgpg.skip=true" "-Dmaven.javadoc.skip=true"
set "RC=%ERRORLEVEL%"
popd
exit /b %RC%

:print_urls
echo   health   http://127.0.0.1:%EIS_PORT%%CONTEXT%/actuator/health
echo   swagger  http://127.0.0.1:%EIS_PORT%%SWAGGER%
echo   openapi  http://127.0.0.1:%EIS_PORT%%OPENAPI%
echo   stub     POST http://127.0.0.1:%EIS_PORT%%EIS_POST%
exit /b 0

:start
echo.
echo ==^> run-local start
call :ensure_dirs
call :check_prereqs
if errorlevel 1 exit /b 1
call :is_running
if not errorlevel 1 (
  set /p OLD_PID=<"%PID_FILE%"
  echo eis already running ^(pid !OLD_PID!^) on port %EIS_PORT%
  call :print_urls
  exit /b 0
)
call :port_in_use
if not errorlevel 1 (
  call :pid_on_port
  echo eis already listening on port %EIS_PORT% ^(pid !PORT_PID!^)
  if defined PORT_PID > "%PID_FILE%" echo !PORT_PID!
  call :print_urls
  exit /b 0
)
if exist "%PID_FILE%" del /q "%PID_FILE%" >nul 2>&1
if exist "%LOG_FILE%" del /q "%LOG_FILE%" >nul 2>&1
if exist "%ERR_FILE%" del /q "%ERR_FILE%" >nul 2>&1

call :find_jar
if errorlevel 1 exit /b 1

echo ==^> starting eis from %BOOT_JAR%
echo     profile=local
echo     port=%EIS_PORT%
echo     context=%CONTEXT%
echo     properties=src\main\resources\application-local.properties

set "LAUNCH_PS1=%LOCAL_DIR%\launch-eis.ps1"
> "%LAUNCH_PS1%" echo $ErrorActionPreference = 'Stop'
>> "%LAUNCH_PS1%" echo $argList = @^('-Dspring.profiles.active=local','-Dserver.port=%EIS_PORT%','-Dspring.cloud.config.enabled=false','-jar','%BOOT_JAR%'^)
>> "%LAUNCH_PS1%" echo $p = Start-Process -FilePath 'java' -ArgumentList $argList -WorkingDirectory '%MODULE_DIR%' -RedirectStandardOutput '%LOG_FILE%' -RedirectStandardError '%ERR_FILE%' -WindowStyle Hidden -PassThru
>> "%LAUNCH_PS1%" echo Set-Content -LiteralPath '%PID_FILE%' -Value $p.Id -Encoding ascii
powershell -NoProfile -ExecutionPolicy Bypass -File "%LAUNCH_PS1%"
if errorlevel 1 (
  echo error: failed to start java process
  exit /b 1
)

echo ==^> waiting for Spring Boot startup on port %EIS_PORT% ^(up to 90s^) ...
call :wait_ready 90
if errorlevel 1 exit /b 1

if exist "%PID_FILE%" (
  set /p STARTED_PID=<"%PID_FILE%"
  echo pid !STARTED_PID!  log %LOG_FILE%
) else (
  call :pid_on_port
  if defined PORT_PID (
    > "%PID_FILE%" echo !PORT_PID!
    echo pid !PORT_PID!  log %LOG_FILE%
  ) else (
    echo warn: ready but PID for port %EIS_PORT% not resolved
  )
)
echo.
echo eis ready
echo   port     %EIS_PORT%
call :print_urls
exit /b 0

:wait_ready
set /a WAIT_MAX=%~1
if "!WAIT_MAX!"=="" set /a WAIT_MAX=90
set /a WAIT_ELAPSED=0
:wait_ready_loop
if !WAIT_ELAPSED! GEQ !WAIT_MAX! goto :wait_ready_fail

call :port_in_use
if not errorlevel 1 (
  if exist "%LOG_FILE%" (
    findstr /C:"%STARTED%" "%LOG_FILE%" >nul 2>&1
    if not errorlevel 1 exit /b 0
  )
)

if exist "%LOG_FILE%" (
  findstr /C:"APPLICATION FAILED TO START" /C:"Port %EIS_PORT% was already in use" "%LOG_FILE%" >nul 2>&1
  if not errorlevel 1 (
    echo error: startup failed. See %LOG_FILE%
    type "%LOG_FILE%"
    exit /b 1
  )
)

echo     ... still starting ^(!WAIT_ELAPSED!s / !WAIT_MAX!s^)
ping -n 3 127.0.0.1 >nul
set /a WAIT_ELAPSED+=2
goto :wait_ready_loop

:wait_ready_fail
echo error: Spring Boot did not become ready within !WAIT_MAX!s on port %EIS_PORT%
if exist "%LOG_FILE%" type "%LOG_FILE%"
exit /b 1

:stop
call :ensure_dirs
set "STOP_PID="
if exist "%PID_FILE%" set /p STOP_PID=<"%PID_FILE%"
if not defined STOP_PID (
  call :pid_on_port
  set "STOP_PID=!PORT_PID!"
)
if not defined STOP_PID (
  echo eis is not running
  exit /b 0
)
echo ==^> stopping eis ^(%STOP_PID%^) on port %EIS_PORT%
taskkill /PID %STOP_PID% /T /F >nul 2>&1
del /q "%PID_FILE%" >nul 2>&1
echo stopped.
exit /b 0

:http_ok
set "HTTP_CODE=000"
set "HTTP_URL=%~1"
set "HTTP_CODE_FILE=%LOCAL_DIR%\http-code.txt"
curl.exe -sS -o NUL -w "%%{http_code}" --connect-timeout 2 --max-time 3 "%HTTP_URL%" > "%HTTP_CODE_FILE%" 2>nul
if exist "%HTTP_CODE_FILE%" (
  for /f "usebackq delims=" %%C in ("%HTTP_CODE_FILE%") do set "HTTP_CODE=%%C"
  del /q "%HTTP_CODE_FILE%" >nul 2>&1
)
if not defined HTTP_CODE set "HTTP_CODE=000"
if "!HTTP_CODE!"=="" set "HTTP_CODE=000"
exit /b 0

:smoke
call :ensure_dirs
echo ==^> waiting for eis ^(up to 60s^)
set /a ELAPSED=0
:smoke_loop
if %ELAPSED% GEQ 60 goto :smoke_fail
if exist "%PID_FILE%" (
  call :is_running
  if errorlevel 1 (
    echo error: process exited. See %LOG_FILE%
    if exist "%LOG_FILE%" type "%LOG_FILE%"
    if exist "%ERR_FILE%" type "%ERR_FILE%"
    exit /b 1
  )
)
call :http_ok "http://127.0.0.1:%EIS_PORT%%CONTEXT%/actuator/health"
if "%HTTP_CODE%"=="200" (
  set "HEALTH_URL=http://127.0.0.1:%EIS_PORT%%CONTEXT%/actuator/health"
  goto :smoke_ok
)
call :http_ok "http://127.0.0.1:%EIS_PORT%/actuator/health"
if "%HTTP_CODE%"=="200" (
  set "HEALTH_URL=http://127.0.0.1:%EIS_PORT%/actuator/health"
  goto :smoke_ok
)
ping -n 3 127.0.0.1 >nul
set /a ELAPSED+=2
goto :smoke_loop

:smoke_ok
echo healthy  %HEALTH_URL%
call :http_ok "http://127.0.0.1:%EIS_PORT%%OPENAPI%"
echo openapi  http://127.0.0.1:%EIS_PORT%%OPENAPI%  HTTP %HTTP_CODE%
if not "%HTTP_CODE%"=="200" (
  echo error: openapi endpoint not healthy
  exit /b 1
)
echo smoke ok
exit /b 0

:smoke_fail
echo error: not healthy. See %LOG_FILE%
if exist "%LOG_FILE%" type "%LOG_FILE%"
if exist "%ERR_FILE%" type "%ERR_FILE%"
exit /b 1

:all
echo ==^> all: init + test + start + smoke
call :init
if errorlevel 1 exit /b 1
call :test
if errorlevel 1 exit /b 1
call :start
if errorlevel 1 exit /b 1
call :smoke
exit /b %ERRORLEVEL%
