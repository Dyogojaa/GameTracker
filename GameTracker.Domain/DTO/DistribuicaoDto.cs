namespace GameTracker.API.DTO
{
    public class DistribuicaoDto
    {
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public decimal Percentual { get; set; }
    }
}
