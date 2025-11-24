using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Logging;
using Microsoft.Extensions.Primitives;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
.LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

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
    options.AddPolicy("customPolicy", b => {
        b.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins(builder.Configuration["ClientApp"]);
    });
    options.AddPolicy("adminPolicy", b => {
        b.AllowAnyHeader().AllowAnyMethod().WithOrigins(builder.Configuration["AdminApp"] ?? "http://localhost:4200");
    });
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("proxy-auth", policy => policy.RequireAuthenticatedUser());
});

IdentityModelEventSource.ShowPII = true;


var app = builder.Build();

// Admin token guard for /admin routes
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/admin", StringComparison.OrdinalIgnoreCase))
    {
        var configured = builder.Configuration["AdminToken"];
        if (string.IsNullOrEmpty(configured) ||
            !context.Request.Headers.TryGetValue("X-Admin-Token", out StringValues provided) ||
            !StringValues.Equals(configured, provided, StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Admin token missing or invalid");
            return;
        }
    }

    await next();
});

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();

app.Run();
