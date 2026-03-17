namespace WebAPI_NET9.Configuration;

using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;


public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions options)
    {
        options.EnableAnnotations();

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please enter a valid JWT with Bearer into field",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT"
        });

        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "WebAPI_NET9.xml"));
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "Domain.xml"));

        // NOTE: No global AddSecurityRequirement here.
        // Security is applied per-endpoint via AllowAnonymousOperationFilter.
        options.OperationFilter<AllowAnonymousOperationFilter>();
    }
}