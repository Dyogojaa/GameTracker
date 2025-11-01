using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Domain.DTO
{
    public class ImportErrorDto
    {
        public int Linha { get; set; }
        public string? Title { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public string? Detalhes { get; set; } // opcional: inner exception
    }
}
