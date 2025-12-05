using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace GatewayService.Tests;

/// <summary>
/// Verifies the admin token guard blocks requests without X-Admin-Token.
/// </summary>
public class AdminGuardTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AdminGuardTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                // Minimal reverse proxy config to satisfy YARP; requests will be short-circuited by admin middleware.
                var settings = new Dictionary<string, string?>
                {
                    ["AdminToken"] = "secret",
                    ["ReverseProxy:Routes:all:ClusterId"] = "dummy",
                    ["ReverseProxy:Routes:all:Match:Path"] = "/{**catch-all}",
                    ["ReverseProxy:Clusters:dummy:Destinations:d1:Address"] = "http://localhost"
                };
                config.AddInMemoryCollection(settings!);
            });
        });
    }

    [Fact]
    public async Task AdminRoute_ShouldReturn401_WhenTokenMissing()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        var response = await client.GetAsync("/admin/test");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
