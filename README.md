# 🎮 GameTracker

**GameTracker** é uma aplicação fullstack para gerenciar e acompanhar seu progresso em jogos — incluindo horas jogadas, conquistas, status (zerado, platinado etc.) e estatísticas no dashboard.

---

## 🚀 Tecnologias Utilizadas

### 🧠 Backend (.NET 8)
- ASP.NET Core Web API  
- Entity Framework Core  
- SQL Server  
- Arquitetura em camadas (API, Domain, Application, Infra)  
- Swagger (documentação automática)

### 🌐 Frontend (React)
- Vite + React 18  
- Axios (integração API)  
- TailwindCSS / ShadCN UI  
- Nginx (servidor de produção)

### 🐳 Docker
- Compose para orquestração  
- Containers independentes para API e Web  
- Suporte a banco SQL local (fora do Docker)

---

## 📁 Estrutura do Projeto

```bash
E:\.Net\GameTracker
├── GameTracker.API/            # API .NET 8
│   ├── Controllers/
│   ├── Domain/
│   ├── Application/
│   ├── Infra/
│   └── Dockerfile
│
├── GameTracker.React/          # Front-end React (Vite + Nginx)
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml          # Orquestra API + Web
├── Start-GameTracker.ps1       # Script PowerShell para subir tudo
└── README.md


⚙️ Configuração

1️⃣ Pré-requisitos

.NET 8 SDK
Node.js 20+
Docker Desktop
SQL Server instalado localmente (porta 1433)


🔗 Connection String

Server=192.168.15.9,1433;
Database=GameTrackerDb;
User Id=sa;
Password=Base123#@;
TrustServerCertificate=True;


🐳 Rodando com Docker

.\Start-GameTracker.ps1

➡️ O script irá:

Parar containers antigos
Rebuildar imagens (api e web)
Subir containers
Abrir o navegador automaticamente

Depois de tudo:
API → http://localhost:5012/swagger
Front → http://localhost:3000

Para parar os containers:
docker compose down

🧱 Rodando localmente (sem Docker)

cd GameTracker.API
dotnet run

Swagger: https://localhost:7158/swagger

Web

cd GameTracker.React
npm install
npm run dev

Acesse: http://localhost:5173


🧠 Variáveis de Ambiente (.env)

📄 GameTracker.React/.env

VITE_API_BASE_URL=http://192.168.15.9:5012/api


📊 Dashboard

O sistema inclui um painel de estatísticas mostrando:

Total de jogos cadastrados
Quantos foram finalizados
Quantos foram platinados
Total de horas jogadas


🔐 CORS e Comunicação

A API libera chamadas do front (React) com:

policy.WithOrigins("http://localhost:3000", "http://192.168.15.9:3000")
      .AllowAnyHeader()
      .AllowAnyMethod();


🔐 CORS e Comunicação

A API libera chamadas do front (React) com:

policy.WithOrigins("http://localhost:3000", "http://192.168.15.9:3000")
      .AllowAnyHeader()
      .AllowAnyMethod();      


💬 Autor
Dyogo JAA
💻 Projeto pessoal de estudo e acompanhamento de jogos.
🕹️ Desenvolvido com amor por código e games ❤️


⭐ Licença
Este projeto é distribuído sob a licença MIT.
Sinta-se livre para clonar, estudar e aprimorar.
