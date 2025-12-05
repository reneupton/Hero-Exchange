// Entry point for GatewayService: configures YARP reverse proxy, authentication, and CORS for client/admin apps.
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Logging;
using Microsoft.Extensions.Primitives;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
.LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var clientApp = builder.Configuration["ClientApp"];
var adminApp = builder.Configuration["AdminApp"];
var allowedOrigins = new List<string>();
if (!string.IsNullOrWhiteSpace(clientApp))
{
    allowedOrigins.Add(clientApp);
}
if (!string.IsNullOrWhiteSpace(adminApp))
{
    allowedOrigins.Add(adminApp);
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["IdentityServiceUrl"];
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters.ValidateAudience = false;
    options.TokenValidationParameters.ValidateIssuer = false;
    options.TokenValidationParameters.NameClaimType = "username";
});

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(b => {
        b.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
    options.AddPolicy("customPolicy", b => {
        b.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
    options.AddPolicy("adminPolicy", b => {
        b.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("proxy-auth", policy => policy.RequireAuthenticatedUser());
});

IdentityModelEventSource.ShowPII = true;


var app = builder.Build();

app.UseCors();

// Admin token guard for /admin routes (skip OPTIONS for CORS preflight)
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/admin", StringComparison.OrdinalIgnoreCase) &&
        !HttpMethods.IsOptions(context.Request.Method))
    {
        var configured = builder.Configuration["AdminToken"];
        if (string.IsNullOrEmpty(configured) ||
            !context.Request.Headers.TryGetValue("X-Admin-Token", out StringValues provided) ||
            !provided.Any(p => string.Equals(p, configured, StringComparison.Ordinal)))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Admin token missing or invalid");
            return;
        }
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();

app.Run();
