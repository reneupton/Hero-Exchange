// Entry point for NotificationService: configures MassTransit consumers and SignalR hub with CORS.
using MassTransit;
using NotificationService;
using NotificationService.Consumers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMassTransit(x =>
{
    
    x.AddConsumersFromNamespaceContaining<AuctionCreatedConsumer>();
     
    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("nt", false));
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.UseMessageRetry(r =>
        {
            r.Handle<RabbitMqConnectionException>();
            r.Interval(5, TimeSpan.FromSeconds(10));
        });

        cfg.Host(builder.Configuration["RabbitMq:Host"], builder.Configuration.GetValue("RabbitMq:VirtualHost", "/"), host =>
        {
            host.Username(builder.Configuration.GetValue("RabbitMq:Username", "guest"));
            host.Password(builder.Configuration.GetValue("RabbitMq:Password", "guest"));
        });
        
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddSignalR();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", b =>
        b.WithOrigins(
                builder.Configuration["ClientApp"] ?? "http://localhost:3000",
                "http://localhost:3001",
                builder.Configuration["AdminApp"] ?? "http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

app.UseCors("CorsPolicy");
app.MapHub<NotificationHub>("/notifications");

// Presence endpoint for bot service to check active visitors
app.MapGet("/presence", () => new { connections = NotificationHub.ConnectionCount });

app.MapHealthChecks("/health").AllowAnonymous();

app.Run();

// For integration testing
public partial class Program { }
