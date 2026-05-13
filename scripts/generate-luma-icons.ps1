Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "buildResources"
$pngPath = Join-Path $outDir "icon.png"
$icoPath = Join-Path $outDir "icon.ico"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$size = 256
$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$panel = New-RoundedPath 20 20 216 216 54
$gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  [System.Drawing.RectangleF]::new(20, 20, 216, 216),
  [System.Drawing.Color]::FromArgb(255, 249, 239, 224),
  [System.Drawing.Color]::FromArgb(255, 149, 135, 200),
  [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$blend = New-Object System.Drawing.Drawing2D.ColorBlend
$blend.Positions = [single[]](0, 0.4, 0.74, 1)
$blend.Colors = [System.Drawing.Color[]](
  [System.Drawing.Color]::FromArgb(255, 249, 239, 224),
  [System.Drawing.Color]::FromArgb(255, 198, 90, 67),
  [System.Drawing.Color]::FromArgb(255, 139, 191, 164),
  [System.Drawing.Color]::FromArgb(255, 149, 135, 200)
)
$gradient.InterpolationColors = $blend
$graphics.FillPath($gradient, $panel)

$border = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(184, 255, 255, 255)), 4
$graphics.DrawPath($border, $panel)

$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(242, 255, 255, 255))
$softWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 255, 255, 255))
$faintWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(142, 255, 255, 255))

$wingA = New-Object System.Drawing.Drawing2D.GraphicsPath
$wingA.AddPolygon([System.Drawing.PointF[]](
  [System.Drawing.PointF]::new(82, 120),
  [System.Drawing.PointF]::new(112, 86),
  [System.Drawing.PointF]::new(176, 64),
  [System.Drawing.PointF]::new(128, 112),
  [System.Drawing.PointF]::new(109, 156)
))
$wingA.CloseFigure()
$graphics.FillPath($white, $wingA)

$wingB = New-Object System.Drawing.Drawing2D.GraphicsPath
$wingB.AddPolygon([System.Drawing.PointF[]](
  [System.Drawing.PointF]::new(118, 84),
  [System.Drawing.PointF]::new(142, 126),
  [System.Drawing.PointF]::new(158, 194),
  [System.Drawing.PointF]::new(120, 148),
  [System.Drawing.PointF]::new(92, 124)
))
$wingB.CloseFigure()
$graphics.FillPath($softWhite, $wingB)

$wingC = New-Object System.Drawing.Drawing2D.GraphicsPath
$wingC.AddPolygon([System.Drawing.PointF[]](
  [System.Drawing.PointF]::new(74, 170),
  [System.Drawing.PointF]::new(124, 154),
  [System.Drawing.PointF]::new(180, 126),
  [System.Drawing.PointF]::new(134, 178),
  [System.Drawing.PointF]::new(78, 198)
))
$wingC.CloseFigure()
$graphics.FillPath($faintWhite, $wingC)

$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.File]::Create($icoPath)
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]1)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]32)
$writer.Write([UInt32]$pngBytes.Length)
$writer.Write([UInt32]22)
$writer.Write($pngBytes)
$writer.Close()
$stream.Close()

$graphics.Dispose()
$bitmap.Dispose()
$gradient.Dispose()
$border.Dispose()
$white.Dispose()
$softWhite.Dispose()
$faintWhite.Dispose()
