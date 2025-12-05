using FluentAssertions;
using IdentityService;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace IdentityService.Tests;

/// <summary>
/// Verifies IdentityServer client configuration composition.
/// </summary>
public class ConfigTests
{
    [Fact]
    public void NextAppClient_IncludesPrimaryAndAdditionalRedirectUris()
    {
        // Arrange
        var settings = new Dictionary<string, string?>
        {
            ["ClientApp"] = "https://hero-exchange.live",
            ["AdditionalRedirectUris"] = "http://localhost:3000"
        };
        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings!)
            .Build();

        // Act
        var clients = Config.Clients(config).ToList();
        var nextApp = clients.Single(c => c.ClientId == "nextapp");

        // Assert
        nextApp.RedirectUris.Should().Contain("https://hero-exchange.live/api/auth/callback/id-server");
        nextApp.RedirectUris.Should().Contain("http://localhost:3000/api/auth/callback/id-server");
    }
}
