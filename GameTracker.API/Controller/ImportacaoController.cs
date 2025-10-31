using GameTracker.Application.Services;
using GameTracker.Domain.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GameTracker.API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportacaoController : ControllerBase
    {
        private readonly ImportacaoCsvService _importacaoCsvService;
        private readonly ILogger<ImportacaoController> _logger;

        public ImportacaoController(ImportacaoCsvService importacaoCsvService, ILogger<ImportacaoController> logger)
        {
            _importacaoCsvService = importacaoCsvService;
            _logger = logger;
        }

        /// <summary>
        /// Importa um arquivo CSV de jogos (HowLongToBeat) para o banco de dados.
        /// </summary>
        [HttpPost("csv")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportarCsv([FromForm] ImportacaoArquivoDto dto)
        {
            if (dto.Arquivo == null || dto.Arquivo.Length == 0)
                return BadRequest("Nenhum arquivo CSV foi enviado.");

            try
            {
                using var stream = dto.Arquivo.OpenReadStream();
                await _importacaoCsvService.ImportarJogosAsync(stream);

                _logger.LogInformation("Importação CSV concluída: {NomeArquivo}", dto.Arquivo.FileName);

                return Ok(new
                {
                    Mensagem = "Importação concluída com sucesso!",
                    Arquivo = dto.Arquivo.FileName,
                    TamanhoKb = (dto.Arquivo.Length / 1024.0).ToString("N1") + " KB"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao importar o arquivo CSV: {NomeArquivo}", dto.Arquivo.FileName);
                return StatusCode(500, $"Erro interno ao importar o arquivo: {ex.Message}");
            }
        }
    }
}
