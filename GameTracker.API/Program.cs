using GameTracker.Application.Services;
using GameTracker.Infra.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// =================== Serviços ===================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Banco de dados
builder.Services.AddDbContext<GameTrackerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ CORS global
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddScoped<ImportacaoCsvService>();
builder.Services.AddScoped<DashboardService>();

// =================== Configuração de Kestrel ===================
// Detecta se está rodando dentro de um container (variável padrão do Docker)
var isRunningInContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

builder.WebHost.ConfigureKestrel(options =>
{
    if (isRunningInContainer)
    {
        // 🚀 Ambiente Docker — apenas HTTP
        options.ListenAnyIP(5012);
    }
    else
    {
        // 💻 Ambiente local — HTTP + HTTPS
        options.ListenAnyIP(5012); // HTTP
        options.ListenAnyIP(7158, listenOptions => listenOptions.UseHttps()); // HTTPS local
    }
});

var app = builder.Build();

// =================== Pipeline ===================
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GameTracker.API v1");
        c.RoutePrefix = "swagger";
    });
}


app.UseRouting();

// ✅ Aplique o CORS aqui (antes de Authorization)
app.UseCors("AllowAll");

// ⚠️ Removido o UseHttpsRedirection (evita erro no Docker)
app.UseAuthorization();

app.MapControllers();

// ✅ Logs de inicialização para debug
Console.WriteLine($"🌐 Ambiente: {(isRunningInContainer ? "Docker (HTTP apenas)" : "Local (HTTP/HTTPS)")}");
Console.WriteLine($"📡 Endpoints: {string.Join(", ", app.Urls)}");

app.Run();
