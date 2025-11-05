# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas os arquivos de projeto primeiro (para melhor cache)
COPY GameTracker.API/GameTracker.API.csproj GameTracker.API/
COPY GameTracker.Application/GameTracker.Application.csproj GameTracker.Application/
COPY GameTracker.Domain/GameTracker.Domain.csproj GameTracker.Domain/
COPY GameTracker.Infra/GameTracker.Infra.csproj GameTracker.Infra/
COPY GameTracker.sln ./

# Restaura dependências
RUN dotnet restore GameTracker.sln

# Copia tudo
COPY . .

# Publica em modo Release
RUN dotnet publish GameTracker.API/GameTracker.API.csproj -c Release -o /app/publish

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5012
EXPOSE 5012

ENTRYPOINT ["dotnet", "GameTracker.API.dll"]
