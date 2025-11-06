# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os arquivos de projeto (.csproj) de todas as camadas
COPY ../GameTracker.API/GameTracker.API.csproj GameTracker.API/
COPY ../GameTracker.Application/GameTracker.Application.csproj GameTracker.Application/
COPY ../GameTracker.Domain/GameTracker.Domain.csproj GameTracker.Domain/
COPY ../GameTracker.Infra/GameTracker.Infra.csproj GameTracker.Infra/
COPY ../GameTracker.sln ./

# Restaura dependências
RUN dotnet restore GameTracker.API/GameTracker.API.csproj

# Copia o restante do código
COPY ../ ./

# Compila e publica
WORKDIR /src/GameTracker.API
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Escuta na porta 5012
EXPOSE 5012
ENV ASPNETCORE_URLS=http://0.0.0.0:5012

ENTRYPOINT ["dotnet", "GameTracker.API.dll"]
