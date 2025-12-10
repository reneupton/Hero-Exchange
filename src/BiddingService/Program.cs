using BiddingService;
using BiddingService.Consumers;
using BiddingService.Services;
using MassTransit;
using MongoDB.Driver;
using MongoDB.Entities;
using Polly;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddAuthorization();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<AuctionCreatedConsumer>();
     
    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("bids", false));
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

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["IdentityServiceUrl"];
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters.ValidateAudience = false;
    options.TokenValidationParameters.NameClaimType = "username";
});

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddHostedService<CheckAuctionFinished>();
builder.Services.AddScoped<GrpcAuctionClient>();

// Add GamificationClient with HttpClient
builder.Services.AddHttpClient<GamificationClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["GamificationServiceUrl"] ?? "http://localhost:7005");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await Policy.Handle<TimeoutException>()
        .WaitAndRetryAsync(5, retryAttempt => TimeSpan.FromSeconds(10))
        .ExecuteAndCaptureAsync(async () => {
            var connectionString = builder.Configuration.GetConnectionString("BidDbConnection");
            var settings = MongoClientSettings.FromConnectionString(connectionString);

            // Aggressive connection pool settings for Railway Serverless compatibility
            // Close idle connections after 60 seconds to allow service to sleep
            settings.MaxConnectionIdleTime = TimeSpan.FromSeconds(60);
            settings.MinConnectionPoolSize = 0; // Allow pool to shrink to 0
            settings.MaxConnectionPoolSize = 10; // Limit max connections

            await DB.InitAsync("BidDb", settings);
        });

// TTL index: auto-delete bids older than 30 days
// Drop existing index if it exists (may have different options)
try
{
    await DB.Collection<BiddingService.Models.Bid>().Indexes.DropOneAsync("BidTime_TTL");
}
catch { /* Index doesn't exist, ignore */ }

await DB.Index<BiddingService.Models.Bid>()
    .Key(x => x.BidTime, KeyType.Ascending)
    .Option(o =>
    {
        o.Name = "BidTime_TTL";
        o.ExpireAfter = TimeSpan.FromDays(30);
    })
    .CreateAsync();

await SeedProgressData.SeedAsync();

app.MapHealthChecks("/health").AllowAnonymous();

app.Run();
