// Public search endpoints for querying auctions with filters, sort, and paging against MongoDB search index.
using SearchService.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;
using SearchService.RequestHelpers;

namespace SearchService
{
    [ApiController]
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        /// <summary>
        /// Searches auctions by text, sort order, filter, and paging.
        /// </summary>
        /// <param name="searchParams">Search, filter, and paging parameters.</param>
        /// <returns>Paged results with total counts.</returns>
        [HttpGet]
        public async Task<ActionResult<List<Item>>> SearchItems([FromQuery]SearchParams searchParams) {
            var query = DB.PagedSearch<Item, Item>();
            
            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                query.Match(Search.Full, searchParams.SearchTerm).SortByTextScore();
            }

            query = searchParams.OrderBy switch
            {
                "title" => query.Sort(x => x.Ascending(a => a.Title)).Sort(x => x.Ascending(a => a.Brand)),
                "new" => query.Sort(x => x.Descending(a => a.CreatedAt)),
                _ => query.Sort(x => x.Ascending(a => a.AuctionEnd))
            };

            query = searchParams.FilterBy switch
            {
                "finished" => query.Match(x => x.AuctionEnd < DateTime.UtcNow),
                "endingSoon" => query.Match(x =>
                    x.AuctionEnd < DateTime.UtcNow.AddHours(6) && x.AuctionEnd > DateTime.UtcNow),
                _ => query.Match(x => x.AuctionEnd > DateTime.UtcNow)
            };

            if (!string.IsNullOrEmpty(searchParams.Seller))
            {
                query.Match(x => x.Seller == searchParams.Seller);
            }
            
            if (!string.IsNullOrEmpty(searchParams.Winner))
            {
                query.Match(x => x.Winner == searchParams.Winner);
            }
            
            query.PageNumber(searchParams.PageNumber);
            query.PageSize(searchParams.PageSize);

            var result = await query.ExecuteAsync();

            return Ok(new
            {
                results = result.Results,
                pageCount = result.PageCount,
                totalCount = result.TotalCount
            });
        }

        /// <summary>
        /// Returns average sale prices grouped by hero name and rarity (Category).
        /// Only includes sold auctions (SoldAmount > 0).
        /// </summary>
        [HttpGet("hero-prices")]
        public async Task<ActionResult<Dictionary<string, HeroPriceStats>>> GetHeroPrices()
        {
            var soldItems = await DB.Find<Item>()
                .Match(x => x.SoldAmount > 0 && x.Condition == "Hero")
                .ExecuteAsync();

            var grouped = soldItems
                .GroupBy(x => new { x.Title, Rarity = x.Category })
                .Select(g => new
                {
                    // Extract base hero name (remove the " #XX" suffix)
                    HeroName = ExtractHeroName(g.Key.Title),
                    g.Key.Rarity,
                    AvgPrice = (int)Math.Round(g.Average(x => x.SoldAmount)),
                    SaleCount = g.Count(),
                    MinPrice = g.Min(x => x.SoldAmount),
                    MaxPrice = g.Max(x => x.SoldAmount)
                })
                .GroupBy(x => x.HeroName)
                .ToDictionary(
                    g => g.Key,
                    g => new HeroPriceStats
                    {
                        HeroName = g.Key,
                        RarityPrices = g.ToDictionary(
                            r => r.Rarity,
                            r => new RarityPriceInfo
                            {
                                AvgPrice = r.AvgPrice,
                                SaleCount = r.SaleCount,
                                MinPrice = r.MinPrice,
                                MaxPrice = r.MaxPrice
                            }
                        )
                    }
                );

            return Ok(grouped);
        }

        private static string ExtractHeroName(string title)
        {
            // Titles are like "Veyla the Shadow Lich #01", extract the base name
            var hashIndex = title.LastIndexOf(" #");
            return hashIndex > 0 ? title[..hashIndex] : title;
        }
    }

    public class HeroPriceStats
    {
        public string HeroName { get; set; } = "";
        public Dictionary<string, RarityPriceInfo> RarityPrices { get; set; } = new();
    }

    public class RarityPriceInfo
    {
        public int AvgPrice { get; set; }
        public int SaleCount { get; set; }
        public int MinPrice { get; set; }
        public int MaxPrice { get; set; }
    }
}
