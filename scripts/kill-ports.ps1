$killed = @()
foreach ($line in (netstat -ano | Select-String 'LISTENING' | Select-String ':4042')) {
    $parts = $line.ToString().Trim() -split '\s+'
    $procId = $parts[-1]
    if ($procId -ne '0' -and $killed -notcontains $procId) {
        $killed += $procId
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "killed pid $procId"
        } catch {}
    }
}
if ($killed.Count -eq 0) { Write-Host 'port 4042 clear' }
