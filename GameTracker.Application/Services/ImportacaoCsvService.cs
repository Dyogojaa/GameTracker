using CsvHelper;
using CsvHelper.Configuration;
using GameTracker.Domain;
using GameTracker.Domain.DTO;
using GameTracker.Domain.Entities;
using GameTracker.Infra.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

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

            // lê o cabeçalho (se existir) e prepara para iteração
            await csv.ReadAsync();
            if (config.HasHeaderRecord)
                csv.ReadHeader();

            int linha = 1; // número da linha (1 = cabeçalho)
            while (await csv.ReadAsync())
            {
                linha++;
                if (ct.IsCancellationRequested) break;

                JogoCsvDto? r = null;
                try
                {
                    // obtém o registro mapeado
                    r = csv.GetRecord<JogoCsvDto>();

                    // valida básica
                    if (r == null || string.IsNullOrWhiteSpace(r.Title))
                    {
                        result.Ignorados++;
                        result.Erros.Add(new ImportErrorDto { Linha = linha, Title = r?.Title, Mensagem = "Title vazio" });
                        continue;
                    }

                    var titulo = r.Title.Trim();
                    var plataforma = string.IsNullOrWhiteSpace(r.Platform) ? "Desconhecida" : r.Platform.Trim();

                    if (titulo.Length > 200) titulo = titulo.Substring(0, 200);
                    if (plataforma.Length > 50) plataforma = plataforma.Substring(0, 50);

                    // evita duplicidade simples
                    var existe = await _context.Jogos.AnyAsync(j => j.Titulo == titulo && j.Plataforma == plataforma, ct);
                    if (existe)
                    {
                        result.Ignorados++;
                        continue;
                    }

                    // cria entidade
                    var jogo = new Jogo
                    {
                        Titulo = titulo,
                        Plataforma = plataforma,
                        Comentarios = string.IsNullOrWhiteSpace(r.ReviewNotes)
                            ? (string.IsNullOrWhiteSpace(r.Storefront) ? null : $"Origem: {r.Storefront}")
                            : r.ReviewNotes
                    };

                    // Nota
                    jogo.Nota = ParseDecimalNullable(r.Review);
                    if (jogo.Nota > 10) jogo.Nota = Math.Round(jogo.Nota.Value / 10, 2);

                    // Status
                    jogo.Status = (!string.IsNullOrWhiteSpace(r.Completed) && r.Completed.Trim().Equals("X", StringComparison.OrdinalIgnoreCase))
                        ? StatusJogo.Finalizado
                        : (!string.IsNullOrWhiteSpace(r.Backlog) && r.Backlog.Trim().Equals("X", StringComparison.OrdinalIgnoreCase)
                            ? StatusJogo.Backlog
                            : StatusJogo.Jogando);

                    // HorasJogadas (mantendo sua lógica)
                    var horas = ConverterHoras(r.MainStory)
                                + ConverterHoras(r.MainExtras)
                                + ConverterHoras(r.Completionist);
                    jogo.HorasJogadas = Convert.ToDouble(horas);

                    // === EXTRAÇÃO DE DataFim (Completion Date) — campo 13 (índice 12) ===
                    // usamos csv.Context.Parser.Record para acessar o array de campos da linha atual
                    var campos = csv.Context.Parser.Record; // string[] com cada coluna já separada
                    DateTime? dataFim = null;
                    if (campos != null && campos.Length > 12)
                    {
                        var raw = campos[12]?.Trim() ?? string.Empty;
                        dataFim = ParseDateNullable(raw);
                    }

                    if (dataFim.HasValue)
                    {
                        jogo.DataFim = dataFim.Value;
                    }
                    else if (jogo.Status == StatusJogo.Finalizado)
                    {
                        // se estiver marcado como finalizado e não veio data, marca agora
                        jogo.DataFim = DateTime.Now;
                    }

                    // salva
                    _context.Jogos.Add(jogo);
                    try
                    {
                        await _context.SaveChangesAsync(ct);
                        result.Inseridos++;
                    }
                    catch (DbUpdateException dbEx)
                    {
                        var inner = dbEx.InnerException?.Message ?? dbEx.Message;
                        _logger.LogError(dbEx, "Erro ao salvar jogo linha {Linha} - {Title} - {Inner}", linha, titulo, inner);
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

            result.TotalLidos = result.Inseridos + result.Ignorados + result.Erros.Count;
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

        // Helper: tenta parsear várias formas de data/time comuns do CSV
        private DateTime? ParseDateNullable(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;

            // limpeza básica: remove aspas e "--"
            raw = raw.Trim().Trim('"').Trim();
            if (string.IsNullOrEmpty(raw) || raw == "--") return null;

            // tenta parse flexível: data ou data+hora
            if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt))
                return dt;

            if (DateTime.TryParse(raw, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out dt))
                return dt;

            // formatos explícitos comuns: "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss"
            string[] formatos = { "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-ddTHH:mm:ss", "MM/dd/yyyy", "MM/dd/yyyy HH:mm:ss" };
            if (DateTime.TryParseExact(raw, formatos, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out dt))
                return dt;

            return null;
        }


    }
}
