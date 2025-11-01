using System.Text.Json;
using System.Text.Json.Serialization;

namespace GameTracker.Web.Converters
{
    public class IntToStringJsonConverter : JsonConverter<string>
    {
        public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Se vier número, converte para string
            if (reader.TokenType == JsonTokenType.Number)
                return reader.GetInt32().ToString();

            // Se vier texto, lê normalmente
            if (reader.TokenType == JsonTokenType.String)
                return reader.GetString() ?? string.Empty;

            // Valor inesperado
            return string.Empty;
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value);
        }
    }
}
