using GameTracker.Application.Services;
using GameTracker.Domain;
using GameTracker.Domain.Entities;
using GameTracker.Infra.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace GameTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JogosController : ControllerBase
{
    private readonly GameTrackerDbContext _context;
    private readonly ILogger<JogosController> _logger;

    public JogosController(GameTrackerDbContext context, ILogger<JogosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retorna todos os jogos cadastrados (com filtro opcional por status ou título)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ObterTodos([FromQuery] string? status = null, [FromQuery] string? titulo = null)
    {
        try
        {
            IQueryable<Jogo> query = _context.Jogos.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse(status, true, out StatusJogo statusEnum))
                query = query.Where(j => j.Status == statusEnum);

            if (!string.IsNullOrWhiteSpace(titulo))
                query = query.Where(j => EF.Functions.Like(j.Titulo, $"%{titulo}%"));

            var jogos = await query.OrderBy(j => j.Titulo).ToListAsync();

            return Ok(jogos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter lista de jogos");
            return StatusCode(500, "Erro interno ao buscar os jogos.");
        }
    }

    /// <summary>
    /// Retorna um jogo pelo seu ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        try
        {
            var jogo = await _context.Jogos.FindAsync(id);
            if (jogo == null)
                return NotFound($"Jogo com ID {id} não encontrado.");

            return Ok(jogo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar jogo por ID");
            return StatusCode(500, "Erro interno ao buscar o jogo.");
        }
    }

    /// <summary>
    /// Cadastra um novo jogo
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] Jogo jogo)
    {
        if (jogo == null)
            return BadRequest("Os dados do jogo são obrigatórios.");

        if (string.IsNullOrWhiteSpace(jogo.Titulo))
            return BadRequest("O campo 'Título' é obrigatório.");

        try
        {
            jogo.Id = Guid.NewGuid();
            jogo.DataInicio ??= DateTime.UtcNow;

            _context.Jogos.Add(jogo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Novo jogo cadastrado: {Titulo}", jogo.Titulo);

            return CreatedAtAction(nameof(ObterPorId), new { id = jogo.Id }, jogo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cadastrar jogo");
            return StatusCode(500, "Erro interno ao cadastrar o jogo.");
        }
    }

    /// <summary>
    /// Atualiza completamente um jogo existente
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] Jogo jogoAtualizado)
    {
        if (jogoAtualizado == null || id != jogoAtualizado.Id)
            return BadRequest("Dados inválidos para atualização.");

        try
        {
            var jogoExistente = await _context.Jogos.FindAsync(id);
            if (jogoExistente == null)
                return NotFound($"Jogo com ID {id} não encontrado.");

            // Atualiza campos relevantes
            jogoExistente.Titulo = jogoAtualizado.Titulo;
            jogoExistente.Plataforma = jogoAtualizado.Plataforma;
            jogoExistente.Genero = jogoAtualizado.Genero;
            jogoExistente.Status = jogoAtualizado.Status;
            jogoExistente.DataInicio = jogoAtualizado.DataInicio;
            jogoExistente.DataFim = jogoAtualizado.DataFim;
            jogoExistente.HorasJogadas = jogoAtualizado.HorasJogadas;
            jogoExistente.Nota = jogoAtualizado.Nota;
            jogoExistente.Comentarios = jogoAtualizado.Comentarios;

            _context.Jogos.Update(jogoExistente);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Jogo atualizado: {Titulo}", jogoExistente.Titulo);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar jogo");
            return StatusCode(500, "Erro interno ao atualizar o jogo.");
        }
    }

    /// <summary>
    /// Exclui um jogo pelo ID
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id)
    {
        try
        {
            var jogo = await _context.Jogos.FindAsync(id);
            if (jogo == null)
                return NotFound($"Jogo com ID {id} não encontrado.");

            _context.Jogos.Remove(jogo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Jogo excluído: {Titulo}", jogo.Titulo);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir jogo");
            return StatusCode(500, "Erro interno ao excluir o jogo.");
        }
    }

    /// <summary>
    /// Atualiza parcialmente um jogo (nota, horas, dataFim, comentários, status)
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> AtualizarParcial(Guid id, [FromBody] JsonElement atualizacao)
    {
        try
        {
            var jogo = await _context.Jogos.FindAsync(id);
            if (jogo == null)
                return NotFound($"Jogo com ID {id} não encontrado.");

            // Atualiza campos dinamicamente
            if (atualizacao.TryGetProperty("nota", out var notaProp))
            {
                if (notaProp.ValueKind == JsonValueKind.Number && notaProp.TryGetDecimal(out var nota))
                    jogo.Nota = nota;
            }

            if (atualizacao.TryGetProperty("horasJogadas", out var horasProp))
            {
                if (horasProp.ValueKind == JsonValueKind.Number && horasProp.TryGetDouble(out var horas))
                    jogo.HorasJogadas = horas;
            }

            if (atualizacao.TryGetProperty("dataFim", out var dataFimProp))
            {
                if (dataFimProp.ValueKind == JsonValueKind.String &&
                    DateTime.TryParse(dataFimProp.GetString(), out var dataFim))
                    jogo.DataFim = dataFim;
            }

            if (atualizacao.TryGetProperty("comentarios", out var comentariosProp))
                jogo.Comentarios = comentariosProp.GetString();

            if (atualizacao.TryGetProperty("status", out var statusProp))
            {
                if (statusProp.ValueKind == JsonValueKind.String &&
                    Enum.TryParse<StatusJogo>(statusProp.GetString(), true, out var statusEnum))
                    jogo.Status = statusEnum;
                else if (statusProp.ValueKind == JsonValueKind.Number &&
                    Enum.TryParse<StatusJogo>(statusProp.GetInt32().ToString(), out statusEnum))
                    jogo.Status = statusEnum;
            }

            // Define DataFim automaticamente se finalizado
            if (jogo.Status == StatusJogo.Finalizado && jogo.DataFim == null)
                jogo.DataFim = DateTime.Now;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Jogo {Id} atualizado parcialmente.", id);
            return Ok(jogo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar parcialmente o jogo {Id}", id);
            return StatusCode(500, "Erro interno ao atualizar parcialmente o jogo.");
        }
    }

    /// <summary>
    /// Retorna todos os jogos sem horas registradas
    /// </summary>
    [HttpGet("sem-horas")]
    public async Task<IActionResult> ObterSemHoras()
    {
        try
        {
            var jogosSemHoras = await _context.Jogos
                .AsNoTracking()
                .Where(j => j.HorasJogadas == null || j.HorasJogadas == 0)
                .OrderBy(j => j.Titulo)
                .Select(j => new
                {
                    j.Id,
                    j.Titulo,
                    j.Plataforma,
                    j.Status,
                    j.Nota,
                    j.HorasJogadas
                })
                .ToListAsync();

            return Ok(jogosSemHoras);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar jogos sem horas");
            return StatusCode(500, "Erro interno ao buscar jogos sem horas.");
        }
    }


    /// <summary>
    /// Busca a capa do jogo na RAWG e grava no banco de dados
    /// </summary>
    [HttpPost("{id:guid}/buscar-capa")]
    public async Task<IActionResult> BuscarESalvarCapa(
        Guid id,
        [FromServices] DashboardService dashboardService)
    {
        try
        {
            var jogo = await _context.Jogos.FindAsync(id);
            if (jogo == null)
                return NotFound($"Jogo com ID {id} não encontrado.");

            // Evita sobrescrever capa existente
            if (!string.IsNullOrWhiteSpace(jogo.CapaUrl))
                return BadRequest("Este jogo já possui uma capa cadastrada.");

            var capaUrl = await dashboardService.BuscarCapaRawgAsync(jogo.Titulo);

            if (string.IsNullOrWhiteSpace(capaUrl))
                return NotFound("Não foi possível encontrar a capa para este jogo.");

            jogo.CapaUrl = capaUrl;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Capa gravada com sucesso para o jogo {Titulo}", jogo.Titulo);

            return Ok(new
            {
                jogo.Id,
                jogo.Titulo,
                jogo.CapaUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar/gravar capa para o jogo {Id}", id);
            return StatusCode(500, "Erro interno ao buscar a capa do jogo.");
        }
    }

}
