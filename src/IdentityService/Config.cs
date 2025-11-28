using Duende.IdentityServer.Models;

namespace IdentityService;

public static class Config
{
    private static ICollection<string> GetRedirectUris(IConfiguration config)
    {
        var uris = new List<string>();

        // Primary ClientApp from config (production or docker)
        var clientApp = config["ClientApp"];
        if (!string.IsNullOrEmpty(clientApp))
        {
            uris.Add(clientApp + "/api/auth/callback/id-server");
        }

        // Additional redirect URIs for local development
        var additionalUris = config["AdditionalRedirectUris"];
        if (!string.IsNullOrEmpty(additionalUris))
        {
            foreach (var uri in additionalUris.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                uris.Add(uri.Trim() + "/api/auth/callback/id-server");
            }
        }

        // Default localhost URIs for development
        if (!uris.Any(u => u.Contains("localhost:3000")))
            uris.Add("http://localhost:3000/api/auth/callback/id-server");
        if (!uris.Any(u => u.Contains("localhost:3001")))
            uris.Add("http://localhost:3001/api/auth/callback/id-server");

        return uris;
    }

    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new ApiScope[]
        {
            new ApiScope("auctionApp", "Auction App Full Access"),
        };

    public static IEnumerable<Client> Clients(IConfiguration config) =>
        new Client[]
        {
            new Client{
                ClientId = "postman",
                ClientName = "Postman",
                AllowedScopes = {"openid", "profile", "auctionApp"},
                RedirectUris = {"https://www.getpostman.com/oauth2/callback"},
                ClientSecrets = new[] {new Secret("NotASecret".Sha256())},
                AllowedGrantTypes = {GrantType.ResourceOwnerPassword}
            },
            new Client{
                ClientId = "pybot",
                ClientName = "PyBot",
                AllowedScopes = {"openid", "profile", "auctionApp"},
                RedirectUris = {""},
                ClientSecrets = new[] {new Secret("NotASecret".Sha256())},
                AllowedGrantTypes = {GrantType.ResourceOwnerPassword}
            },
            new Client{
                ClientId = "nextapp",
                ClientName = "nextapp",
                ClientSecrets = {new Secret(config["ClientSecret"].Sha256())},
                AllowedGrantTypes = GrantTypes.CodeAndClientCredentials,
                RequirePkce = false,
                RedirectUris = GetRedirectUris(config),
                AllowOfflineAccess = true,
                AllowedScopes = {"openid", "profile", "auctionApp"},
                AccessTokenLifetime = 3600*24*30,
                AlwaysIncludeUserClaimsInIdToken = true
            }

        };
}
