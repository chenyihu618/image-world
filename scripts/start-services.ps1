# start-services.ps1 - 启动 PostgreSQL + MinIO
Write-Host "Starting PostgreSQL..."
$pgBin = "D:\Program Files\PostgreSQL\16\bin"
& "$pgBin\pg_ctl.exe" -D "D:\data\postgresql" -l "D:\data\postgresql\pg.log" start

Write-Host "Starting MinIO..."
$env:MINIO_ROOT_USER = "minioadmin"
$env:MINIO_ROOT_PASSWORD = "minioadmin"
$proc = Get-Process -Name "minio" -ErrorAction SilentlyContinue
if (-not $proc) {
  Start-Process -WindowStyle Hidden -FilePath "D:\Program Files\MinIO\minio.exe" -ArgumentList "server", "D:\data\minio", "--console-address", ":9001"
}

Write-Host "Services started!"
Write-Host "PostgreSQL: localhost:5432"
Write-Host "MinIO API:  http://localhost:9000"
Write-Host "MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
Write-Host "App: python scripts/start-app.py or npm run dev"