using CsvHelper;
using CsvHelper.Configuration;
using GameTracker.Domain;
using GameTracker.Domain.DTO;
using GameTracker.Domain.Entities;
using GameTracker.Infra.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text;

namespace GameTracker.Application.Services
{
    public class ImportacaoCsvService
    {
        private readonly GameTrackerDbContext _context;
        private readonly ILogger<ImportacaoCsvService> _logger;

        public ImportacaoCsvService(GameTrackerDbContext context, ILogger<ImportacaoCsvService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ImportResultDto> ImportarJogosAsync(Stream csvStream, CancellationToken ct = default)
        {
            var result = new ImportResultDto();

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ",",
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null,
                HeaderValidated = null,
                PrepareHeaderForMatch = args => args.Header?.Trim() ?? string.Empty
            };

            using var reader = new StreamReader(csvStream, Encoding.UTF8);
            using var csv = new CsvReader(reader, config);

            // opcional: registrar ClassMap para tolerância de nomes de colunas
            var registros = csv.GetRecords<JogoCsvDto>().ToList();

            result.TotalLidos = registros.Count;
            var linha = 1; // considera 1 = cabeçalho, mas você pode ajustar para número real
            foreach (var r in registros)
            {
                linha++;
                if (ct.IsCancellationRequested) break;

                try
                {
                    // validações básicas
                    if (string.IsNullOrWhiteSpace(r.Title))
                    {
                        result.Ignorados++;
                        result.Erros.Add(new ImportErrorDto { Linha = linha, Title = r.Title, Mensagem = "Title vazio" });
                        continue;
                    }

                    var titulo = r.Title.Trim();
                    var plataforma = string.IsNullOrWhiteSpace(r.Platform) ? "Desconhecida" : r.Platform.Trim();

                    // valida comprimento (exemplo)
                    if (titulo.Length > 200)
                        titulo = titulo.Substring(0, 200);

                    if (plataforma.Length > 50)
                        plataforma = plataforma.Substring(0, 50);

                    // evita duplicidade simples (pode ser melhorado)
                    var existe = await _context.Jogos.AnyAsync(j => j.Titulo == titulo && j.Plataforma == plataforma, ct);
                    if (existe)
                    {
                        result.Ignorados++;
                        continue;
                    }

                    // mapear para entidade com validação de tipos e ranges
                    var jogo = new Jogo
                    {
                        Titulo = titulo,
                        Plataforma = plataforma,
                        Comentarios = string.IsNullOrWhiteSpace(r.ReviewNotes) ? (string.IsNullOrWhiteSpace(r.Storefront) ? null : $"Origem: {r.Storefront}") : r.ReviewNotes
                    };

                    // Nota
                    jogo.Nota = ParseDecimalNullable(r.Review);

                    // converte notas 0–100 para 0–10 se necessário
                    if (jogo.Nota > 10)
                        jogo.Nota = Math.Round(jogo.Nota.Value / 10, 2);

                    // Status
                    jogo.Status = (!string.IsNullOrWhiteSpace(r.Completed) && r.Completed.Trim().Equals("X", StringComparison.OrdinalIgnoreCase))
                        ? StatusJogo.Finalizado
                        : (!string.IsNullOrWhiteSpace(r.Backlog) && r.Backlog.Trim().Equals("X", StringComparison.OrdinalIgnoreCase)
                            ? StatusJogo.Backlog
                            : StatusJogo.Jogando);

                    // DataFim
                    if (jogo.Status == StatusJogo.Finalizado && jogo.DataFim == null)
                        jogo.DataFim = DateTime.Now;

                    // HorasJogadas
                    var horas = ConverterHoras(r.MainStory)
                                + ConverterHoras(r.MainExtras)
                                + ConverterHoras(r.Completionist);

                    jogo.HorasJogadas = Convert.ToDouble(horas); // ajuste se sua propriedade for decimal?



                    // adiciona e salva em batch pequeno (por registro para isolar erros)
                    _context.Jogos.Add(jogo);
                    try
                    {
                        await _context.SaveChangesAsync(ct);
                        result.Inseridos++;
                    }
                    catch (DbUpdateException dbEx)
                    {
                        // pega inner exception para diagnostico
                        var inner = dbEx.InnerException?.Message ?? dbEx.Message;
                        _logger.LogError(dbEx, "Erro ao salvar jogo linha {Linha} - {Title} - {Inner}", linha, titulo, inner);

                        // opcional: remover entidade do ChangeTracker para não interferir nos próximos
                        _context.Entry(jogo).State = EntityState.Detached;

                        result.Erros.Add(new ImportErrorDto
                        {
                            Linha = linha,
                            Title = titulo,
                            Mensagem = "Erro ao salvar registro no banco",
                            Detalhes = inner
                        });
                        result.Ignorados++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro inesperado processando linha {Linha}", linha);
                    result.Erros.Add(new ImportErrorDto
                    {
                        Linha = linha,
                        Title = r?.Title,
                        Mensagem = "Erro ao processar registro",
                        Detalhes = ex.Message
                    });
                    result.Ignorados++;
                }
            }

            return result;
        }

        // helpers (copie as implementações já testadas)
        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var result))
                return result;
            if (DateTime.TryParseExact(value, "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                return result;
            return null;
        }

        private static decimal ConverterHoras(string? valor)
        {
            if (string.IsNullOrWhiteSpace(valor)) return 0m;
            var v = valor.Replace("Hours", "", StringComparison.OrdinalIgnoreCase)
                         .Replace("Hour", "", StringComparison.OrdinalIgnoreCase)
                         .Replace("½", ".5")
                         .Replace("–", "-")
                         .Trim();

            if (v.Equals("Varies", StringComparison.OrdinalIgnoreCase) || v.Equals("N/A", StringComparison.OrdinalIgnoreCase))
                return 0m;

            if (v.Contains('-'))
            {
                var parts = v.Split('-', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 &&
                    decimal.TryParse(parts[0].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var a) &&
                    decimal.TryParse(parts[1].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var b))
                {
                    return Math.Round((a + b) / 2m, 2);
                }
            }

            if (decimal.TryParse(v, NumberStyles.Any, CultureInfo.InvariantCulture, out var horas))
                return horas;

            return 0m;
        }

        private static decimal? ParseDecimalNullable(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            s = s.Trim().Replace(",", ".", StringComparison.OrdinalIgnoreCase);
            if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                return d;
            return null;
        }
    }
}
