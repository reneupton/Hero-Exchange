// Admin endpoints for reindexing search data from the auction service.
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

    /// <summary>
    /// Creates an admin controller for managing search index.
    /// </summary>
    /// <param name="auctionClient">HTTP client for pulling auction data to index.</param>
    public AdminSearchController(AuctionServiceHttpClient auctionClient)
    {
        _auctionClient = auctionClient;
    }

    [HttpPost("reindex")]
    /// <summary>
    /// Clears the index and reimports items from the auction service.
    /// </summary>
    public async Task<ActionResult> Reindex()
    {
        await DB.DeleteAsync<Item>(_ => true);
        var items = await _auctionClient.GetItemsForSearchDb();
        if (items.Count > 0) await DB.SaveAsync(items);
        return Ok(new { indexed = items.Count });
    }
}
