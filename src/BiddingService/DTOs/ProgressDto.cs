// DTOs describing user progress, balances, holds, and hero ownership sent to clients.
namespace BiddingService.DTOs
{
    /// <summary>
    /// Snapshot of a user's progression, balances, stats, and owned heroes.
    /// </summary>
    public class ProgressDto
    {
        /// <summary>
        /// Username of the player.
        /// </summary>
        public string Username { get; set; }
        /// <summary>
        /// Avatar image URL.
        /// </summary>
        public string AvatarUrl { get; set; }
        /// <summary>
        /// Current level.
        /// </summary>
        public int Level { get; set; }
        /// <summary>
        /// Total experience earned.
        /// </summary>
        public int Experience { get; set; }
        /// <summary>
        /// XP required for next level.
        /// </summary>
        public int NextLevelAt { get; set; }
        /// <summary>
        /// Gold balance (legacy name flogBalance kept for backwards compatibility).
        /// </summary>
        [System.Text.Json.Serialization.JsonPropertyName("flogBalance")]
        public int FlogBalance { get; set; }

        /// <summary>
        /// Gold balance alias for new clients (admin UI can read goldBalance).
        /// </summary>
        [System.Text.Json.Serialization.JsonPropertyName("goldBalance")]
        public int GoldBalance => FlogBalance;
        public int TotalHeroPower { get; set; }
        public int AuctionsCreated { get; set; }
        public int AuctionsSold { get; set; }
    public int AuctionsWon { get; set; }
    public int BidsPlaced { get; set; }
    public DateTime? LastDailyReward { get; set; }
    public List<string> RecentPurchases { get; set; }
    public List<string> RecentSales { get; set; }
    public List<HeldBidDto> HeldBids { get; set; }
    public DateTime? LastMysteryRewardAt { get; set; }
    public int? LastMysteryRewardXp { get; set; }
    public int? LastMysteryRewardCoins { get; set; }
    public List<OwnedHeroDto> OwnedHeroes { get; set; } = new();
    public List<string> ClaimedAchievements { get; set; } = new();
}

    /// <summary>
    /// Represents an active bid hold against a specific auction.
    /// </summary>
    public class HeldBidDto
    {
        public string AuctionId { get; set; }
        public int Amount { get; set; }
    }
}
