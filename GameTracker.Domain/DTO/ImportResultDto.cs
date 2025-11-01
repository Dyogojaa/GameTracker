using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Domain.DTO
{
    public class ImportResultDto
    {
        public int TotalLidos { get; set; }
        public int Inseridos { get; set; }
        public int Ignorados { get; set; }
        public List<ImportErrorDto> Erros { get; set; } = new();
    }
}
