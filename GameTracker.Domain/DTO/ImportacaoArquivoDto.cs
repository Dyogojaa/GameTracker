using Microsoft.AspNetCore.Http;

namespace GameTracker.Domain.DTO
{
    public class ImportacaoArquivoDto
    {
        public IFormFile Arquivo { get; set; } = null!;
    }
}
