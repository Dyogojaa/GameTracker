# =============================================
# 🚀 Start-GameTracker.ps1
# Script para subir API e Web do GameTracker
# Autor: Dyogo
# =============================================

# Caminho base do projeto
$projectPath = "E:\.Net\GameTracker"

# URLs de acesso
$apiUrl = "http://localhost:5012/swagger"
$webUrl = "http://localhost:3000"

Write-Host "`n==============================="
Write-Host "🎮 Iniciando GameTracker..."
Write-Host "===============================`n"

# Ir para o diretório do projeto
Set-Location $projectPath

# 1️⃣ Parar containers antigos
Write-Host "🛑 Parando containers antigos..."
docker compose down

# 2️⃣ Rebuild das imagens (sem cache)
Write-Host "`n🔧 Recriando containers (build sem cache)..."
docker compose build --no-cache

# 3️⃣ Subir containers em background
Write-Host "`n🚀 Subindo containers (API + Web)..."
docker compose up -d

# 4️⃣ Aguardar alguns segundos para inicializar
Write-Host "`n⏳ Aguardando inicialização da API..."
Start-Sleep -Seconds 10

# 5️⃣ Verificar status dos containers
Write-Host "`n📦 Containers ativos:"
docker ps | findstr gametracker

# 6️⃣ Testar API e Web
Write-Host "`n🌐 Testando API e Web..."
try {
    $apiResponse = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API respondendo em: $apiUrl"
} catch {
    Write-Host "⚠️  A API ainda não respondeu. Verifique logs com: docker logs -f gametracker-api"
}

try {
    $webResponse = Invoke-WebRequest -Uri $webUrl -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Web respondendo em: $webUrl"
} catch {
    Write-Host "⚠️  O site ainda não respondeu. Verifique logs com: docker logs -f gametracker-web"
}

# 7️⃣ Abrir automaticamente no navegador padrão
Write-Host "`n🌍 Abrindo navegador..."
Start-Process $apiUrl
Start-Process $webUrl

Write-Host "`n✅ GameTracker iniciado com sucesso!"
Write-Host "👉 API: $apiUrl"
Write-Host "👉 WEB: $webUrl"
Write-Host "`nPara parar tudo: docker compose down"
