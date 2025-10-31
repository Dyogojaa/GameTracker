using CsvHelper;
using CsvHelper.Configuration;
using GameTracker.Domain;
using GameTracker.Domain.DTO;
using GameTracker.Domain.Entities;
using GameTracker.Infra.Persistence; // ajuste se seu DbContext estiver em outro namespace
using System.Globalization;
using System.Text;

namespace GameTracker.Application.Services
{
    public class ImportacaoCsvService
    {
        private readonly GameTrackerDbContext _context;

        public ImportacaoCsvService(GameTrackerDbContext context)
        {
            _context = context;
        }

        public async Task ImportarJogosAsync(Stream csvStream)
        {
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

            var registros = csv.GetRecords<JogoCsvDto>().ToList();

            foreach (var r in registros)
            {
                if (string.IsNullOrWhiteSpace(r.Title))
                    continue;

                var titulo = r.Title!.Trim();
                var plataforma = string.IsNullOrWhiteSpace(r.Platform) ? "Desconhecida" : r.Platform.Trim();

                // evita duplicidade simples: mesmo título + mesma plataforma
                var existe = _context.Jogos.Any(j => j.Titulo == titulo && j.Plataforma == plataforma);
                if (existe)
                    continue;

                var jogo = new Jogo
                {
                    Titulo = titulo,
                    Plataforma = plataforma,
                    Genero = null,
                    Comentarios = string.IsNullOrWhiteSpace(r.ReviewNotes) ? (string.IsNullOrWhiteSpace(r.Storefront) ? null : $"Origem: {r.Storefront}") : r.ReviewNotes
                };

                // Nota (string -> decimal?)
                jogo.Nota = ParseDecimalNullable(r.Review);

                // Status (enum)
                if (!string.IsNullOrWhiteSpace(r.Completed) && r.Completed.Trim().Equals("X", StringComparison.OrdinalIgnoreCase))
                    jogo.Status = StatusJogo.Finalizado;
                else if (!string.IsNullOrWhiteSpace(r.Backlog) && r.Backlog.Trim().Equals("X", StringComparison.OrdinalIgnoreCase))
                    jogo.Status = StatusJogo.Backlog;
                else
                    jogo.Status = StatusJogo.Jogando;

                // DataFim/CompletionDate
                jogo.DataFim = ParseDate(r.CompletionDate);

                // HorasJogadas (converter para double ou decimal conforme sua entidade)
                var horasDecimal = ConverterHoras(r.MainStory ?? r.MainExtras ?? r.Completionist);
                // supondo HorasJogadas seja double? (se for decimal?, altere abaixo)
                jogo.HorasJogadas = Convert.ToDouble(horasDecimal);

                _context.Jogos.Add(jogo);
            }

            await _context.SaveChangesAsync();
        }

        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt))
                return dt;

            // tenta formatos comuns (ex.: "2025-08-27 20:13:51")
            var formatos = new[] {
                "yyyy-MM-dd HH:mm:ss",
                "yyyy-MM-dd",
                "MM/dd/yyyy",
                "dd/MM/yyyy",
            };

            foreach (var fmt in formatos)
            {
                if (DateTime.TryParseExact(value, fmt, CultureInfo.InvariantCulture, DateTimeStyles.None, out dt))
                    return dt;
            }

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

            // se for "Varies" ou similar, retorna 0
            if (v.Equals("Varies", StringComparison.OrdinalIgnoreCase) ||
                v.Equals("N/A", StringComparison.OrdinalIgnoreCase))
                return 0m;

            // range "1-2" -> média
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
