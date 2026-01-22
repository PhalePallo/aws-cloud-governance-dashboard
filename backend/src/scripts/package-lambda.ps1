$ErrorActionPreference = "Stop"

# Move to repo root regardless of where the script is run from
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
Set-Location $repoRoot

Write-Host "Repo root: $repoRoot"

Write-Host "Building Lambda..."
node build.cjs

Write-Host "Packaging Lambda..."
if (Test-Path "lambda.zip") { Remove-Item "lambda.zip" -Force }

if (!(Test-Path "lambda-dist\index.js")) {
  throw "Build output not found: lambda-dist\index.js. Check build.cjs entry/output paths."
}

Push-Location "lambda-dist"
Compress-Archive -Path * -DestinationPath "..\lambda.zip" -Force
Pop-Location

Write-Host "Done. Created lambda.zip with index.js at root."
