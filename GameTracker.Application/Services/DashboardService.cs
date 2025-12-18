using GameTracker.Domain.DTO;
using GameTracker.Infra.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Application.Services
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using System.Net.Http;
    using System.Text.Json;

    public class DashboardService
    {
        private readonly GameTrackerDbContext _db;
        private readonly IConfiguration _config;

        public DashboardService(GameTrackerDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // 📈 Evolução mensal (já existente)
        public async Task<List<EvolucaoJogosDto>> ObterEvolucaoMensalAsync()
        {
            var dados = await _db.Jogos
                .Where(j => j.DataFim != null)
                .GroupBy(j => new { j.DataFim.Value.Year, j.DataFim.Value.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Quantidade = g.Count()
                })
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Month)
                .ToListAsync();

            return dados
                .Select(g => new EvolucaoJogosDto
                {
                    Mes = $"{g.Year:D4}-{g.Month:D2}",
                    Quantidade = g.Quantidade
                })
                .ToList();
        }

        // 🎮 NOVO — Buscar capa do jogo na RAWG
        public async Task<string?> BuscarCapaRawgAsync(string titulo)
        {
            var apiKey = _config["Rawg:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("API Key da RAWG não configurada.");

            var url =
                $"https://api.rawg.io/api/games" +
                $"?search={Uri.EscapeDataString(titulo)}" +
                $"&page_size=1" +
                $"&key={apiKey}";

            using var http = new HttpClient();
            var response = await http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("results", out var results))
                return null;

            if (results.GetArrayLength() == 0)
                return null;

            if (!results[0].TryGetProperty("background_image", out var image))
                return null;

            return image.GetString();
        }
    }

}
