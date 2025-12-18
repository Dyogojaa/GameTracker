using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Domain.DTO
{
    public class JogoResumoDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string Plataforma { get; set; } = string.Empty;
        public string? Genero { get; set; }
        public decimal? Nota { get; set; }
        public decimal? HorasJogadas { get; set; }
        public DateTime? DataFim { get; set; }

        public string? CapaUrl { get; set; } // Adicionado o Link da Capa
    }
}
