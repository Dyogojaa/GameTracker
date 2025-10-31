using GameTracker.API.DTO;
using GameTracker.Domain;
using GameTracker.Domain.Entities;
using GameTracker.Infra.Persistence;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly GameTrackerDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(GameTrackerDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retorna estatísticas gerais do sistema de jogos.
        /// </summary>
        [HttpGet("resumo")]
        [ProducesResponseType(typeof(DashboardResumoDto), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<DashboardResumoDto>> GetResumo()
        {
            try
            {
                if (!await _context.Jogos.AnyAsync())
                    return Ok(new DashboardResumoDto()); // Retorna DTO vazio

                var totalJogos = await _context.Jogos.CountAsync();
                var finalizados = await _context.Jogos.CountAsync(j => j.Status == StatusJogo.Finalizado);
                var platinados = await _context.Jogos.CountAsync(j => j.Status == StatusJogo.Platinado);
                var horasTotais = await _context.Jogos.SumAsync(j => j.HorasJogadas ?? 0);
                var notaMedia = await _context.Jogos.AverageAsync(j => j.Nota ?? 0);

                var porGenero = await _context.Jogos
                    .GroupBy(j => j.Genero)
                    .Select(g => new DistribuicaoDto
                    {
                        Nome = g.Key,
                        Quantidade = g.Count()
                    })
                    .ToListAsync();

                var porPlataforma = await _context.Jogos
                    .GroupBy(j => j.Plataforma)
                    .Select(p => new DistribuicaoDto
                    {
                        Nome = p.Key,
                        Quantidade = p.Count()
                    })
                    .ToListAsync();

                var resumo = new DashboardResumoDto
                {
                    TotalJogos = totalJogos,
                    Finalizados = finalizados,
                    Platinados = platinados,
                    HorasTotais = horasTotais,
                    NotaMedia = Math.Round(notaMedia, 2),
                    PorGenero = porGenero,
                    PorPlataforma = porPlataforma
                };

                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do dashboard");
                return StatusCode(500, "Erro interno ao gerar estatísticas.");
            }
        }
    }
}
