using System.Net.Http.Json;

public class ApiClient
{
    private readonly HttpClient _http;

    public ApiClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        return await _http.GetFromJsonAsync<T>(endpoint);
    }

    public async Task<HttpResponseMessage> PatchAsync<T>(string endpoint, T data)
    {
        var response = await _http.PatchAsJsonAsync(endpoint, data);
        return response;
    }

    public async Task<HttpResponseMessage> PostAsync<T>(string endpoint, T data)
    {
        var response = await _http.PostAsJsonAsync(endpoint, data);
        return response;
    }

    public async Task<HttpResponseMessage> DeleteAsync(string endpoint)
    {
        return await _http.DeleteAsync(endpoint);
    }
}
