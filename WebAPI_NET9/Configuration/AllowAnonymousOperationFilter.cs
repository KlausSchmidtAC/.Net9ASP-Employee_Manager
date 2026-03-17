namespace WebAPI_NET9.Configuration;

using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

/// <summary>
/// Sets the Bearer security requirement per endpoint based on [Authorize] / [AllowAnonymous].
/// [Authorize]      → 🔒 closed lock in Swagger UI
/// [AllowAnonymous] → no lock icon in Swagger UI
/// </summary>
public class AllowAnonymousOperationFilter : IOperationFilter
{
    private static readonly OpenApiSecurityRequirement BearerRequirement = new()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check [AllowAnonymous] on method or controller class
        bool isAnonymous =
            context.MethodInfo.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any() ||
            (context.MethodInfo.DeclaringType?.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any() ?? false);

        // Check [Authorize] on method or controller class
        bool isAuthorized =
            context.MethodInfo.GetCustomAttributes(typeof(AuthorizeAttribute), true).Any() ||
            (context.MethodInfo.DeclaringType?.GetCustomAttributes(typeof(AuthorizeAttribute), true).Any() ?? false);

        operation.Security ??= new List<OpenApiSecurityRequirement>();
        operation.Security.Clear();

        if (isAuthorized && !isAnonymous)
        {
            // 🔒 Protected endpoint
            operation.Security.Add(BearerRequirement);
        }
        // else: public endpoint → Security stays empty → no lock icon
    }
}

