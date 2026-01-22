using WebAPI_NET9;
using WebAPI_NET9.Configuration;
using WebAPI_NET9.HealthChecks;
using Application;
using Data.Repositories; 
using Data.SQL_DB;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.Extensions.Options; 
using OpenTelemetry.Logs;
using OpenTelemetry.Exporter;
using System.Net;
using OpenTelemetry.Resources;


var builder = WebApplication.CreateBuilder(args);

// ✅ EARLY CONFIGURATION VALIDATION - Fail fast on startup errors
using var loggerFactory = LoggerFactory.Create(logging => logging.AddConsole());
var startupLogger = loggerFactory.CreateLogger("Startup");

try
{
    ConfigurationValidator.ValidateConfiguration(builder.Configuration, startupLogger);
}
catch (InvalidOperationException)
{
    // Configuration validation failed - application will exit
    startupLogger.LogCritical("❌ Application startup aborted due to configuration errors");
    Environment.Exit(1); // Exit with error code
}

// Kestrel Server Configuration for multiple endpoints (HTTP + HTTPS)
//  Configuaration via appsettings.{...}.json and environment variables
/** Development: HTTP + HTTPS
    Production: HTTPS only 

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    if (builder.Environment.IsDevelopment())
    {
        serverOptions.Listen(IPAddress.Any, 5100); // HTTP - Development
        serverOptions.Listen(IPAddress.Any, 5101, listenOptions =>
        {
            listenOptions.UseHttps(); // HTTPS - Development  
        });
    }
    else
    {
        // Production: Nur HTTPS
        serverOptions.Listen(IPAddress.Any, 443, listenOptions =>
        {
            listenOptions.UseHttps(); // Production HTTPS auf Standard-Port
        });
    }
});
**/ 

var jwtConfig = builder.Configuration.GetSection("JWTSettings");
Console.WriteLine("Hello from .NET 9 Web Employee API!");


builder.Logging.ClearProviders();

// OTLP Exporter instead of Console-Logging
builder.Logging.AddOpenTelemetry(options =>
{
    options.SetResourceBuilder(ResourceBuilder.CreateEmpty().AddService("WebAPI_NET9_EmployeeService").AddAttributes(new Dictionary<string, object>
    {
        ["deployment.environment"] = "development",
        ["service.version"] = "1.0.0"
    }));

    options.IncludeScopes = true;
    options.IncludeFormattedMessage = true;

    options.AddOtlpExporter(
    exporter =>
    {
        exporter.Endpoint = new Uri("http://localhost:5099/ingest/otlp/v1/logs");
        exporter.Protocol = OtlpExportProtocol.HttpProtobuf;
        exporter.Headers = "";
    });
}); 

Console.WriteLine("Hello from OpenTelemetry logging setup!");


builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment(); // HTTPS only in Production

     var secretKey = builder.Environment.IsDevelopment()
        ? jwtConfig["SecretKey"] // Development: from appsettings.Development.json
        : Environment.GetEnvironmentVariable("JWT_SECRET_KEY"); // Production: from Environment Variable
    
    if (string.IsNullOrEmpty(secretKey))
    {
        throw new InvalidOperationException($"JWT SecretKey is required. Environment: {builder.Environment.EnvironmentName}");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = jwtConfig["Issuer"],
        ValidAudience = jwtConfig["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)), // Null-safe signature for JWT tokens
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});


/**     Admin Auth without application-side policy. Only specified via claim attribute in controllers

builder.Services.AddAuthorization(options =>cd
{
    options.AddPolicy(Domain.Constants.IdentityData.Policies.AdminOnly, policy =>
        policy.RequireClaim(Domain.Constants.IdentityData.Claims.AdminRole, "true")); // alternative: (Domain.Constants.IdentityData.Claims.Role, Domain.Constants.IdentityData.Claims.AdminRole) 
});
**/

builder.Services.AddControllers();

// Environment-basierte CORS-Konfiguration
var corsOrigins = builder.Environment.IsDevelopment() 
    ? new[] { // HTTP Development Origins
        "http://localhost:8080", 
        "http://127.0.0.1:8080", 
        "http://localhost:3000",
        "http://localhost:5173",    // Vite dev server
        // HTTPS Development Origins
        "https://localhost:8080", 
        "https://127.0.0.1:8080", 
        "https://localhost:3000",
        "https://localhost:5173" }    // Vite HTTPS dev server 
    : new[] { "https://yourdomain.com", "https://www.yourdomain.com" };  // HTTPS in Production!

builder.Services.AddCors(options =>
{
    options.AddPolicy("WebPolicy", policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()              // GET, POST, PATCH, DELETE
              .AllowAnyHeader()              // Content-Type, Authorization, etc.
              .AllowCredentials());          // for JWT Authentication
});


builder.Services.AddOpenApi("WebAPI");
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger, JWT Token Service for Swagger-OPEN API configured as Singleton (only used at startup)
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();


// Configure JSON Serializer Options
builder.Services.ConfigureHttpJsonOptions(options =>    
{
   options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default); 
});

// Register Dependency Injection Services as Singleton (for the entire application)

builder.Services.AddSingleton<IEmployeeService, EmployeeService>();
builder.Services.AddSingleton<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddSingleton<IConnectionFactory, SqlConnectionFactory>();

// Register Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: new[] { "db", "sql" })
    .AddCheck<ApplicationHealthCheck>("application", tags: new[] { "app", "system" });

// Register Database Initializer with configuration values from appsettings.json
var dbConfig = builder.Configuration.GetSection("Database");
builder.Services.AddSingleton<IDatabaseInitializer>(provider =>
    new SqlServerDatabaseInitializer(
        provider.GetRequiredService<ILogger<SqlServerDatabaseInitializer>>(),
        dbConfig["ServerIP"] ?? "localhost",
        dbConfig["DatabaseName"] ?? "Mitarbeiter", 
        dbConfig["Port"] ?? "3306",
        dbConfig["Username"] ?? "root",
        dbConfig["Password"] ?? ""
    )
);

var app = builder.Build();


// Middleware Area

// CORS Middleware - Before Authentication/Authorization!
app.UseCors("WebPolicy");


if (app.Environment.IsDevelopment())
{   
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Production: HTTPS Enforcement
    app.UseHttpsRedirection();
    // app.UseHsts();  // HTTP Strict Transport Security
}


// In Production: 
// app.UseHttpsRedirection();


app.UseAuthentication(); // IMPORTANT: Order matters! Authentication first, then Authorization
app.UseAuthorization();    // RequiresClaimAttribute.OnAuthorizationAsync is called during this step

// Health Checks Endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        var response = new
        {
            Status = report.Status.ToString(),
            TotalDuration = report.TotalDuration.TotalMilliseconds,
            Checks = report.Entries.Select(entry => new
            {
                Name = entry.Key,
                Status = entry.Value.Status.ToString(),
                Duration = entry.Value.Duration.TotalMilliseconds,
                Description = entry.Value.Description,
                Data = entry.Value.Data,
                Exception = entry.Value.Exception?.Message,
                Tags = entry.Value.Tags
            }).ToArray()
        };

        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        }));
    }
});

app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db")
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("app")
});

app.MapControllers();

app.Run();




