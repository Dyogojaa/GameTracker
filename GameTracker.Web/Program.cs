using Blazorise;
using Blazorise.Bootstrap5;
using Blazorise.Icons.FontAwesome;
using GameTracker.Web.Components;
using GameTracker.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddRazorComponents()
    .AddInteractiveServerComponents();

// 🧠 Aqui registramos o HttpClient base da API

var apiUrl = builder.Configuration["ApiBaseUrl"];

builder.Services.AddHttpClient<ApiClient>(client =>
{
    client.BaseAddress = new Uri(apiUrl!);
});



builder.Services
    .AddBlazorise(options => { options.Immediate = true; })
    .AddBootstrap5Providers()
    .AddFontAwesomeIcons();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAntiforgery();

app.MapRazorComponents<App>()
   .AddInteractiveServerRenderMode();

app.Run();
