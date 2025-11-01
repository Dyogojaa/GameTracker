using GameTracker.API.DTO;
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

        public DashboardController(GameTrackerDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
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

                var jogosAnoAtual = jogos.Count(j => j.DataFim?.Year == anoAtual);
                var horasTotais = jogos.Sum(j => (decimal)(j.HorasJogadas ?? 0));
                var horasAnoAtual = jogos.Where(j => j.DataFim?.Year == anoAtual)
                                         .Sum(j => (decimal)(j.HorasJogadas ?? 0));

                var notaMedia = Math.Round(jogos.Where(j => j.Nota != null).Average(j => j.Nota!.Value), 2);

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
                    .Where(j => j.Status == StatusJogo.Finalizado && j.DataFim != null)
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
                    HorasTotais = horasTotais,
                    HorasAnoAtual = horasAnoAtual,
                    NotaMediaGeral = notaMedia,
                    PorPlataforma = porPlataforma,
                    PorGenero = porGenero,
                    NotaMediaPorPlataforma = notaMediaPorPlataforma,
                    UltimosJogosFinalizados = ultimosJogosFinalizados,
                    TopJogos = topJogos
                };


                // Calcula percentual de finalizados e média de horas por jogo
                var percentualFinalizados = totalJogos > 0
                    ? Math.Round((decimal)jogosFinalizados / totalJogos * 100, 2)
                    : 0;

                var horasMediaPorJogo = totalJogos > 0
                    ? Math.Round(horasTotais / totalJogos, 2)
                    : 0;

                // Atribui ao DTO
                resumo.PercentualFinalizados = percentualFinalizados;
                resumo.HorasMediaPorJogo = horasMediaPorJogo;


                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do dashboard");
                return StatusCode(500, "Erro interno ao gerar resumo do dashboard.");
            }
        }
    }
}
