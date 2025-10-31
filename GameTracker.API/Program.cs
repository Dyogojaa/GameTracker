using GameTracker.Application.Services;
using GameTracker.Infra.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// =================== Serviços ===================

// Adiciona suporte a controllers (para usar Controllers tradicionais)
builder.Services.AddControllers();

// Adiciona suporte ao Swagger com UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura o EF Core
builder.Services.AddDbContext<GameTrackerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS (para o futuro, quando integrar com o dashboard web)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddScoped<ImportacaoCsvService>();

var app = builder.Build();

// =================== Pipeline ===================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Mapeia controllers
app.MapControllers();

app.Run();
