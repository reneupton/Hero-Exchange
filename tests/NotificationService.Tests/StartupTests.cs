using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace NotificationService.Tests;

/// <summary>
/// Verifies the hub endpoint is protected by CORS and the app can start with configured origins.
/// </summary>
public class StartupTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public StartupTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                var settings = new Dictionary<string, string?>
                {
                    ["ClientApp"] = "http://localhost:3000",
                    ["AdminApp"] = "http://localhost:4200",
                    ["RabbitMq:Host"] = "localhost",
                    ["Logging:EventLog:LogLevel:Default"] = "None"
                };
                config.AddInMemoryCollection(settings!);
            });
        });
    }

    [Fact]
    public async Task Hub_ShouldSendCorsHeaders_ForAllowedOrigin()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var request = new HttpRequestMessage(HttpMethod.Options, "/notifications");
        request.Headers.Add("Origin", "http://localhost:3000");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        var response = await client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        response.Headers.TryGetValues("Access-Control-Allow-Origin", out var origins).Should().BeTrue();
        origins!.Should().Contain("http://localhost:3000");
    }
}
