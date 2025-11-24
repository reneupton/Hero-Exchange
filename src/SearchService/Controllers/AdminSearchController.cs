using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;
using SearchService.Models;
using SearchService.Services;

namespace SearchService.Controllers;

[ApiController]
[Route("api/admin/search")]
public class AdminSearchController : ControllerBase
{
    private readonly AuctionServiceHttpClient _auctionClient;

    public AdminSearchController(AuctionServiceHttpClient auctionClient)
    {
        _auctionClient = auctionClient;
    }

    [HttpPost("reindex")]
    public async Task<ActionResult> Reindex()
    {
        await DB.DeleteAsync<Item>(_ => true);
        var items = await _auctionClient.GetItemsForSearchDb();
        if (items.Count > 0) await DB.SaveAsync(items);
        return Ok(new { indexed = items.Count });
    }
}
