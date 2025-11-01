using GameTracker.Web.Converters;
using System.Text.Json.Serialization;

namespace GameTracker.Web.Models
{
    public class Jogo
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;

        [JsonConverter(typeof(IntToStringJsonConverter))]
        public string Status { get; set; } = string.Empty;  // ✅ agora funciona mesmo se vier número

        public string Plataforma { get; set; } = string.Empty;
        public double Nota { get; set; }
    }
}
