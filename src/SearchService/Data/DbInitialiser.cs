using System.Text.Json;
using MongoDB.Driver;
using MongoDB.Entities;
using SearchService.Models;
using SearchService.Services;

namespace SearchService.Data;

public static class DbInitialiser
{
    public static async Task InitDb(WebApplication app)
    {
        await DB.InitAsync("SearchDb",
            MongoClientSettings.FromConnectionString(app.Configuration.GetConnectionString("MongoDbConnection")));

        await DB.Index<Item>()
            .Key(x => x.Title, KeyType.Text)
            .Key(x => x.Brand, KeyType.Text)
            .Key(x => x.Category, KeyType.Text)
            .Key(x => x.Colorway, KeyType.Text)
            .CreateAsync();

        // TTL index: auto-delete closed auctions 7 days after ClosedAt timestamp
        // Drop existing index if it exists (may have different options)
        try
        {
            await DB.Collection<Item>().Indexes.DropOneAsync("ClosedAt_TTL");
        }
        catch { /* Index doesn't exist, ignore */ }

        await DB.Index<Item>()
            .Key(x => x.ClosedAt, KeyType.Ascending)
            .Option(o =>
            {
                o.Name = "ClosedAt_TTL";
                o.ExpireAfter = TimeSpan.FromDays(7);
            })
            .CreateAsync();

        var count = await DB.CountAsync<Item>();

        using var scope = app.Services.CreateScope();

        var httpClient = scope.ServiceProvider.GetRequiredService<AuctionServiceHttpClient>();

        var items = await httpClient.GetItemsForSearchDb();

        Console.WriteLine(items.Count + " returned from auction service");

        if (items.Count > 0) await DB.SaveAsync(items);

    }
}
