$sourceDir = "d:\desktop\tophomedesigners\wardrobe"
$destDir = "d:\desktop\tophomedesigners\kitchen\img"

# Ensure destination exists
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# Copy logo
Copy-Item -LiteralPath "$sourceDir\img\logo.jpg" -Destination "$destDir\logo.jpg" -Force
Write-Host "Copied logo.jpg"

# Copy kitchen images from wardrobe root
$images = @(
    @{src = "WhatsApp Image 2025-10-06 at 09.32.07_3910530d.jpg"; dst = "kitchen1.jpg"},
    @{src = "WhatsApp Image 2025-10-06 at 09.32.08_25a93f5f.jpg"; dst = "kitchen2.jpg"},
    @{src = "WhatsApp Image 2025-10-06 at 09.32.08_644914aa.jpg"; dst = "kitchen3.jpg"},
    @{src = "WhatsApp Image 2025-10-06 at 09.32.08_abc4c97f.jpg"; dst = "kitchen4.jpg"}
)

foreach ($img in $images) {
    $srcPath = Join-Path $sourceDir $img.src
    $dstPath = Join-Path $destDir $img.dst
    Copy-Item -LiteralPath $srcPath -Destination $dstPath -Force
    Write-Host "Copied $($img.src) -> $($img.dst)"
}

# List results
Write-Host "`nFinal contents of kitchen/img:"
Get-ChildItem $destDir | Select-Object Name, @{Name="Size";Expression={"{0:N0}" -f $_.Length}}