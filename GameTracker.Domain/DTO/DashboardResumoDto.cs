using GameTracker.Domain.DTO;

namespace GameTracker.API.DTO
{
    public class DashboardResumoDto
    {
        
        public int TotalJogos { get; set; }
        public int JogosAnoAtual { get; set; }
        public int JogosFinalizados { get; set; }
        public int JogosBacklog { get; set; }
        public int JogosJogando { get; set; }

        public decimal HorasTotais { get; set; }
        public decimal HorasAnoAtual { get; set; }
        public decimal NotaMediaGeral { get; set; }

        public decimal PercentualFinalizados { get; set; }
        public decimal HorasMediaPorJogo { get; set; }


        public List<DistribuicaoDto> PorPlataforma { get; set; } = new();
        public List<DistribuicaoDto> PorGenero { get; set; } = new();
        public List<DistribuicaoDto> NotaMediaPorPlataforma { get; set; } = new();

        public List<JogoResumoDto> UltimosJogosFinalizados { get; set; } = new();
        public List<JogoResumoDto> TopJogos { get; set; } = new();


        
    }
}
