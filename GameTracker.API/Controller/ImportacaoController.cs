using GameTracker.Application.Services;
using GameTracker.Domain.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GameTracker.API.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportacaoController : ControllerBase
    {
        private readonly ImportacaoCsvService _importacaoCsvService;
        private readonly ILogger<ImportacaoController> _logger;

        public ImportacaoController(ImportacaoCsvService importacaoCsvService, ILogger<ImportacaoController> logger)
        {
            _importacaoCsvService = importacaoCsvService;
            _logger = logger;
        }

        [HttpPost("csv")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportarCsv([FromForm] ImportacaoArquivoDto dto, CancellationToken ct)
        {
            if (dto.Arquivo == null || dto.Arquivo.Length == 0)
                return BadRequest("Nenhum arquivo CSV foi enviado.");

            try
            {
                using var stream = dto.Arquivo.OpenReadStream();
                var result = await _importacaoCsvService.ImportarJogosAsync(stream, ct);

                _logger.LogInformation("Importação CSV concluída: {NomeArquivo}. Lidos={TotalLidos} Inseridos={Inseridos} Ignorados={Ignorados}",
                    dto.Arquivo.FileName, result.TotalLidos, result.Inseridos, result.Ignorados);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao importar o arquivo CSV: {NomeArquivo}", dto.Arquivo?.FileName);
#if DEBUG
                // Em desenvolvimento, retornar detalhes para facilitar debug
                return StatusCode(500, new { Mensagem = "Erro interno ao importar o arquivo", Detalhe = ex.Message });
#else
                return StatusCode(500, "Erro interno ao importar o arquivo.");
#endif
            }
        }
    }
}
