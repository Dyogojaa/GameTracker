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
        public async Task<ActionResult<DashboardResumoDto>> GetResumo()
        {
            try
            {
                var anoAtual = DateTime.Now.Year;
                var jogos = await _context.Jogos.AsNoTracking().ToListAsync();

                if (jogos.Count == 0)
                    return Ok(new DashboardResumoDto());

                var totalJogos = jogos.Count;
                var jogosFinalizados = jogos.Count(j => j.Status == StatusJogo.Finalizado);
                var jogosBacklog = jogos.Count(j => j.Status == StatusJogo.Backlog);
                var jogosJogando = jogos.Count(j => j.Status == StatusJogo.Jogando);

                // 👇 Novo: jogos platinados
                var jogosPlatinados = jogos.Count(j => j.Status == StatusJogo.Platinado);

                var jogosAnoAtual = jogos.Count(j => j.DataFim?.Year == anoAtual);
                var horasTotais = jogos.Sum(j => (decimal)(j.HorasJogadas ?? 0));
                var horasAnoAtual = jogos.Where(j => j.DataFim?.Year == anoAtual)
                                         .Sum(j => (decimal)(j.HorasJogadas ?? 0));

                var notaMedia = jogos.Any(j => j.Nota != null)
                    ? Math.Round(jogos.Where(j => j.Nota != null).Average(j => j.Nota!.Value), 2)
                    : 0;

                var porPlataforma = jogos.GroupBy(j => j.Plataforma)
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

                var ultimosJogosFinalizados = jogos
                    .Where(j => (j.Status == StatusJogo.Finalizado || j.Status == StatusJogo.Platinado) && j.DataFim != null)
                    .OrderByDescending(j => j.DataFim)
                    .Take(5)
                    .Select(j => new JogoResumoDto
                    {
                        Titulo = j.Titulo,
                        Plataforma = j.Plataforma,
                        Genero = j.Genero,
                        Nota = j.Nota,
                        HorasJogadas = (decimal?)j.HorasJogadas,
                        DataFim = j.DataFim
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
                        DataFim = j.DataFim
                    })
                    .ToList();

                var resumo = new DashboardResumoDto
                {
                    TotalJogos = totalJogos,
                    JogosAnoAtual = jogosAnoAtual,
                    JogosFinalizados = jogosFinalizados,
                    JogosBacklog = jogosBacklog,
                    JogosJogando = jogosJogando,
                    JogosPlatinados = jogosPlatinados, // 👈 novo campo aqui
                    HorasTotais = horasTotais,
                    HorasAnoAtual = horasAnoAtual,
                    NotaMediaGeral = notaMedia,
                    PorPlataforma = porPlataforma,
                    PorGenero = porGenero,
                    NotaMediaPorPlataforma = notaMediaPorPlataforma,
                    UltimosJogosFinalizados = ultimosJogosFinalizados,
                    TopJogos = topJogos
                };

                // Calcula percentual e média
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
    }
}
