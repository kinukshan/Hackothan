using InventoryManagement.Api.Data;
using InventoryManagement.Api.Middlewares;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuration: read connection string from appsettings or environment variable (ConnectionStrings__DefaultConnection)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    // Fallback to environment variable if not present in configuration
    connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                       ?? "Host=localhost;Database=inventory_db;Username=postgres;Password=postgres";
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core with Npgsql
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS - allow frontend dev server. Add deployed frontend URL to the allowed list later.
var frontendDevUrl = "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDevPolicy", policy =>
    {
        policy.WithOrigins(frontendDevUrl)
              .AllowAnyHeader()
              .AllowAnyMethod();
        // TODO: add deployed frontend origin (e.g. https://app.example.com) when ready
    });
});

var app = builder.Build();

// Use global exception handling middleware
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendDevPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();