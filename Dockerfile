# ─────────────────────────────────────────
# STAGE 1: BUILD
# SDK-Image zum Kompilieren (~800MB, wird nicht ins finale Image übernommen)
# ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Nur .csproj-Dateien zuerst kopieren → Docker-Cache-Optimierung:
# NuGet-Packages werden nur neu heruntergeladen wenn sich .csproj ändert
COPY WebAPI_Net9ASP.sln .
COPY WebAPI_NET9/WebAPI_NET9.csproj       WebAPI_NET9/
COPY Application/Application.csproj       Application/
COPY Data/Data.csproj                     Data/
COPY Domain/Domain.csproj                 Domain/

RUN dotnet restore WebAPI_NET9/WebAPI_NET9.csproj

# Gesamten Quellcode kopieren und als Release publishen
COPY . .
RUN dotnet publish WebAPI_NET9/WebAPI_NET9.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ─────────────────────────────────────────
# STAGE 2: RUNTIME
# Nur ASP.NET Runtime (~220MB) - kein SDK nötig
# ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# curl installieren für Healthcheck (wget fehlt im aspnet:9.0-Image)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Security: Container läuft nicht als root
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Nur das fertige Publish-Artefakt aus Stage 1 übernehmen
COPY --from=build /app/publish .

# Port dokumentieren (tatsächliches Binding kommt in docker-compose.yml)
EXPOSE 5100

ENTRYPOINT ["dotnet", "WebAPI_NET9.dll"]
