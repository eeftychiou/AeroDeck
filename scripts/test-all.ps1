Write-Host "Running AeroDeck Master Test Suite..." -ForegroundColor Cyan
node scripts/test-runner.js $args
if ($LASTEXITCODE -ne 0) {
    Write-Error "Test suite execution failed."
    exit 1
}
