using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Domain.Entities
{
   public class Jogo
    {
        public Guid Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Plataforma { get; set; } = string.Empty;
        public string Genero { get; set; } = string.Empty;
        public StatusJogo Status { get; set; } = StatusJogo.Backlog;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public double? HorasJogadas { get; set; }
        public decimal? Nota { get; set; }
        public string? Comentarios { get; set; }

        public Guid? UsuarioId { get; set; }
    }
}
