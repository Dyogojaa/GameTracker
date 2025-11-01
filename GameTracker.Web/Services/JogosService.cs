using GameTracker.Domain.Entities;

namespace GameTracker.Web.Services
{
    public class JogosService
    {
        private readonly ApiClient _api;

        public JogosService(ApiClient api)
        {
            _api = api;
        }

        public Task<List<Jogo>?> ListarTodos() => _api.GetAsync<List<Jogo>>("jogos");
        public Task<List<Jogo>?> ListarSemHoras() => _api.GetAsync<List<Jogo>>("jogos/sem-horas");

        public Task<HttpResponseMessage> AtualizarHoras(Guid id, double horas)
            => _api.PatchAsync($"jogos/{id}", new { horasJogadas = horas });
    }
}
