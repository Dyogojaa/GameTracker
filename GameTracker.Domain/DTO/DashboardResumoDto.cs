namespace GameTracker.API.DTO
{
    public class DashboardResumoDto
    {
        public int TotalJogos { get; set; }
        public int Finalizados { get; set; }
        public int Platinados { get; set; }
        public double HorasTotais { get; set; }
        public decimal NotaMedia { get; set; }
        public List<DistribuicaoDto> PorGenero { get; set; } = new();
        public List<DistribuicaoDto> PorPlataforma { get; set; } = new();
    }
}
