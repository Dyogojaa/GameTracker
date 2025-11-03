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
    public class DashboardService
    {
        private readonly GameTrackerDbContext _db;

        public DashboardService(GameTrackerDbContext db)
        {
            _db = db;
        }

        // 📈 Novo método para evolução mensal
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

            // 👇 Aqui sim fazemos a formatação, já fora do SQL
            return dados
                .Select(g => new EvolucaoJogosDto
                {
                    Mes = $"{g.Year:D4}-{g.Month:D2}",
                    Quantidade = g.Quantidade
                })
                .ToList();
        }


    }
}
