using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameTracker.Domain.DTO
{
    public class EvolucaoJogosDto
    {
        public string Mes { get; set; } = string.Empty;  // formato AAAA-MM
        public int Quantidade { get; set; }

    }
}
