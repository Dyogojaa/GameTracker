using GameTracker.API.DTO;
using GameTracker.Application.Services;
using GameTracker.Domain;
using GameTracker.Domain.DTO;
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
        private readonly DashboardService _dashboardService;

        public DashboardController(GameTrackerDbContext context, ILogger<DashboardController> logger, DashboardService dashboardService)
        {
            _context = context;
            _logger = logger;
            _dashboardService = dashboardService;
        }

        [HttpGet("resumo")]
        public async Task<ActionResult<DashboardResumoDto>> GetResumo([FromQuery] int? ano)
        {
            try
            {
                var anoFiltro = ano ?? DateTime.Now.Year;

                var inicioAno = new DateTime(anoFiltro, 1, 1);
                var fimAno = inicioAno.AddYears(1);

                // 🔹 Somente jogos do ano filtrado
                var jogos = await _context.Jogos
                    .AsNoTracking()
                    .Where(j => j.DataFim.HasValue &&
                                j.DataFim.Value >= inicioAno &&
                                j.DataFim.Value < fimAno)
                    .ToListAsync();

                if (!jogos.Any())
                    return Ok(new DashboardResumoDto());

                // ============================
                // 📊 CONTADORES (ANO)
                // ============================

                var totalJogos = jogos.Count;
                var jogosFinalizados = jogos.Count(j => j.Status == StatusJogo.Finalizado);
                var jogosBacklog = jogos.Count(j => j.Status == StatusJogo.Backlog);
                var jogosJogando = jogos.Count(j => j.Status == StatusJogo.Jogando);
                var jogosPlatinados = jogos.Count(j => j.Status == StatusJogo.Platinado);

                var horasTotais = jogos.Sum(j => (decimal)(j.HorasJogadas ?? 0));

                var notaMedia = jogos.Any(j => j.Nota != null)
                    ? Math.Round(jogos.Where(j => j.Nota != null)
                                      .Average(j => j.Nota!.Value), 2)
                    : 0;

                // ============================
                // 📊 DISTRIBUIÇÕES (ANO)
                // ============================

                var porPlataforma = jogos
                    .GroupBy(j => j.Plataforma)
                    .Select(g => new DistribuicaoDto
                    {
                        Nome = g.Key,
                        Valor = g.Count(),
                        Percentual = Math.Round((decimal)g.Count() / totalJogos * 100, 2)
                    })
                    .OrderByDescending(p => p.Valor)
                    .ToList();

                var porGenero = jogos
                    .Where(j => !string.IsNullOrEmpty(j.Genero))
                    .GroupBy(j => j.Genero!)
                    .Select(g => new DistribuicaoDto
                    {
                        Nome = g.Key,
                        Valor = g.Count(),
                        Percentual = Math.Round((decimal)g.Count() / totalJogos * 100, 2)
                    })
                    .OrderByDescending(g => g.Valor)
                    .Take(5)
                    .ToList();

                var notaMediaPorPlataforma = jogos
                    .Where(j => j.Nota != null)
                    .GroupBy(j => j.Plataforma)
                    .Select(g => new DistribuicaoDto
                    {
                        Nome = g.Key,
                        Valor = Math.Round(g.Average(x => x.Nota!.Value), 2),
                        Percentual = 0
                    })
                    .ToList();

                // ============================
                // 🏆 TOP / ÚLTIMOS (ANO)
                // ============================

                var ultimosJogosFinalizados = jogos
                    .Where(j => j.Status == StatusJogo.Finalizado ||
                                j.Status == StatusJogo.Platinado)
                    .OrderByDescending(j => j.DataFim)
                    .Take(5)
                    .Select(j => new JogoResumoDto
                    {
                        Titulo = j.Titulo,
                        Plataforma = j.Plataforma,
                        Genero = j.Genero,
                        Nota = j.Nota,
                        HorasJogadas = (decimal?)j.HorasJogadas,
                        DataFim = j.DataFim,
                        CapaUrl = j.CapaUrl // ✅ LINHA CRÍTICA
                    })
                    .ToList();

                var topJogos = jogos
                    .Where(j => j.Nota != null)
                    .OrderByDescending(j => j.Nota)
                    .ThenByDescending(j => j.DataFim)
                    .Take(5)
                    .Select(j => new JogoResumoDto
                    {
                        Titulo = j.Titulo,
                        Plataforma = j.Plataforma,
                        Genero = j.Genero,
                        Nota = j.Nota,
                        HorasJogadas = (decimal?)j.HorasJogadas,
                        DataFim = j.DataFim,
                        CapaUrl = j.CapaUrl // ✅ LINHA CRÍTICA
                    })
                    .ToList();

                // ============================
                // 📦 DTO FINAL
                // ============================

                var resumo = new DashboardResumoDto
                {
                    TotalJogos = totalJogos,
                    JogosAnoAtual = totalJogos,
                    JogosFinalizados = jogosFinalizados,
                    JogosBacklog = jogosBacklog,
                    JogosJogando = jogosJogando,
                    JogosPlatinados = jogosPlatinados,
                    HorasTotais = horasTotais,
                    HorasAnoAtual = horasTotais,
                    NotaMediaGeral = notaMedia,
                    PorPlataforma = porPlataforma,
                    PorGenero = porGenero,
                    NotaMediaPorPlataforma = notaMediaPorPlataforma,
                    UltimosJogosFinalizados = ultimosJogosFinalizados,
                    TopJogos = topJogos
                };

                resumo.PercentualFinalizados = totalJogos > 0
                    ? Math.Round((decimal)jogosFinalizados / totalJogos * 100, 2)
                    : 0;

                resumo.HorasMediaPorJogo = totalJogos > 0
                    ? Math.Round(horasTotais / totalJogos, 2)
                    : 0;

                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do dashboard");
                return StatusCode(500, "Erro interno ao gerar resumo do dashboard.");
            }
        }




        [HttpGet("evolucao")]
        public async Task<IActionResult> GetEvolucao()
        {
            var evolucao = await _dashboardService.ObterEvolucaoMensalAsync();
            return Ok(evolucao);
        }

        [HttpGet("testar-capa")]
        public async Task<IActionResult> TestarCapa([FromQuery] string titulo)
        {
            var capa = await _dashboardService.BuscarCapaRawgAsync(titulo);
            return Ok(new { titulo, capa });
        }
    }
}
