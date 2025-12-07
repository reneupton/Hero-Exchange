// Provides player progression and reward logic (gold, XP, mystery summons) for bidding and auction activity.
using BiddingService.DTOs;
using BiddingService.Models;
using MongoDB.Entities;

namespace BiddingService.Services;

/// <summary>
/// Computes user progress, balances, and rewards for bidding/auction lifecycle and daily/mystery rewards.
/// </summary>
public class ProgressService
{
    private const int StatsPerLevel = 120;
    private readonly Random rng = new();
    private readonly (string rarity, int weight)[] rarityWeights = new[]
    {
        ("Common", 65),
        ("Rare", 22),
        ("Epic", 10),
        ("Legendary", 3)
    };

    private readonly Dictionary<string, int> goldByRarity = new()
    {
        ["Common"] = 120,
        ["Rare"] = 280,
        ["Epic"] = 520,
        ["Legendary"] = 900
    };

    /// <summary>
    /// Retrieves an existing profile or initializes defaults for a new user (including starter pack when applicable).
    /// </summary>
    /// <param name="username">Unique username/ID.</param>
    /// <returns>User profile with starter data and collections.</returns>
    public async Task<UserProgress> GetOrCreateProfile(string username)
    {
        var profile = await DB.Find<UserProgress>().OneAsync(username);

        if (profile != null)
        {
            profile.OwnedHeroes ??= new List<OwnedHero>();
            profile.RecentPurchases ??= new List<string>();
            profile.RecentSales ??= new List<string>();
            profile.HeldBids ??= new List<HeldBid>();
            await EnsureStarterHeroes(profile);
            return profile;
        }

        // also try lookup by Username field for friendly-name identifiers
        profile = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();

        if (profile != null)
        {
            profile.OwnedHeroes ??= new List<OwnedHero>();
            profile.RecentPurchases ??= new List<string>();
            profile.RecentSales ??= new List<string>();
            profile.HeldBids ??= new List<HeldBid>();
            await EnsureStarterHeroes(profile);
            return profile;
        }

        profile = new UserProgress
        {
            ID = username,
            Username = username,
            AvatarUrl =
                $"https://api.dicebear.com/7.x/adventurer/png?seed={username}&backgroundType=gradientLinear&radius=40",
            GoldBalance = 1000,
            Experience = 0,
            Level = 1,
            RecentPurchases = new List<string>(),
            RecentSales = new List<string>(),
            HeldBids = new List<HeldBid>(),
            OwnedHeroes = new List<OwnedHero>()
        };

        await EnsureStarterHeroes(profile);
        await profile.SaveAsync();
        return profile;
    }

    /// <summary>
    /// Recomputes level and XP based on owned heroes' total stats (hero power).
    /// </summary>
    internal static void RefreshLevel(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var totalPower = CalculateHeroPower(profile);
        profile.Experience = totalPower;
        profile.Level = Math.Max(1, (totalPower / StatsPerLevel) + 1);
    }

    /// <summary>
    /// Calculates a gold reward based on a base amount and multiplier while enforcing a minimum.
    /// </summary>
    internal static int CalculateCoinBonus(int? amount, double multiplier, int minimum)
    {
        var raw = (amount ?? 0) * multiplier;
        return Math.Max(minimum, (int)Math.Round(raw));
    }

    internal static ProgressDto ToDto(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        profile.ClaimedAchievements ??= new List<string>();
        var experience = CalculateHeroPower(profile);
        return new ProgressDto
        {
            Username = profile.Username,
            AvatarUrl = profile.AvatarUrl,
            Level = profile.Level,
            Experience = experience,
            NextLevelAt = (profile.Level + 1) * StatsPerLevel,
            GoldBalance = profile.GoldBalance,
            TotalHeroPower = experience,
            AuctionsCreated = profile.AuctionsCreated,
            AuctionsSold = profile.AuctionsSold,
            AuctionsWon = profile.AuctionsWon,
            BidsPlaced = profile.BidsPlaced,
            LastDailyReward = profile.LastDailyReward,
            RecentPurchases = profile.RecentPurchases,
            RecentSales = profile.RecentSales,
            HeldBids = profile.HeldBids.Select(h => new HeldBidDto { AuctionId = h.AuctionId, Amount = h.Amount }).ToList(),
            LastMysteryRewardAt = profile.LastMysteryRewardAt,
            LastMysteryRewardXp = profile.LastMysteryRewardXp,
            LastMysteryRewardCoins = profile.LastMysteryRewardCoins,
            OwnedHeroes = profile.OwnedHeroes.Select(MapOwnedHero).ToList(),
            ClaimedAchievements = profile.ClaimedAchievements
        };
    }

    /// <summary>
    /// Ensures a new or existing profile has starter heroes and starter gold.
    /// - Adds 5 random common heroes if fewer than 5 exist.
    /// - Preserves legacy starter bundle for whitelisted users when empty.
    /// - Sets minimum gold to 1000.
    /// </summary>
    private async Task EnsureStarterHeroes(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();

        // Legacy starter bundle for specific users if they have no heroes.
        var starterUsers = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "test",
            "Dion Upton"
        };

        if (!profile.OwnedHeroes.Any() && starterUsers.Contains(profile.Username))
        {
            var starterChoices = new (string heroId, string rarity)[]
            {
                ("elyra", "Epic"),
                ("grum", "Legendary"),
                ("dresh", "Common"),
                ("sigrun", "Rare")
            };

            foreach (var (heroId, rarity) in starterChoices)
            {
                var variant = HeroCatalog.GetVariant(heroId, rarity);
                if (variant == null) continue;

                profile.OwnedHeroes.Add(new OwnedHero
                {
                    HeroId = variant.HeroId,
                    VariantId = variant.VariantId,
                    Name = variant.Name,
                    Discipline = variant.Discipline,
                    Rarity = variant.Rarity,
                    Strength = variant.Strength,
                    Intellect = variant.Intellect,
                    Vitality = variant.Vitality,
                    Agility = variant.Agility,
                    CardImage = variant.CardImage,
                    AcquiredAt = DateTime.UtcNow
                });
                profile.RecentPurchases ??= new List<string>();
                profile.RecentPurchases.Insert(0, variant.VariantId);
            }
        }

        // Ensure 5 common heroes minimum for everyone.
        if (profile.OwnedHeroes.Count < 5)
        {
            var missing = 5 - profile.OwnedHeroes.Count;
            var candidates = HeroCatalog.CommonHeroes();
            for (int i = 0; i < missing; i++)
            {
                var hero = candidates[rng.Next(candidates.Count)];
                profile.OwnedHeroes.Add(new OwnedHero
                {
                    HeroId = hero.HeroId,
                    VariantId = hero.VariantId,
                    Name = hero.Name,
                    Discipline = hero.Discipline,
                    Rarity = hero.Rarity,
                    Strength = hero.Strength,
                    Intellect = hero.Intellect,
                    Vitality = hero.Vitality,
                    Agility = hero.Agility,
                    CardImage = hero.CardImage,
                    AcquiredAt = DateTime.UtcNow
                });
            }
        }

        // backfill starter gold if migrated from legacy default
        if (profile.GoldBalance < 1000)
        {
            profile.GoldBalance = 1000;
        }

        RefreshLevel(profile);
        await profile.SaveAsync();
    }

    /// <summary>
    /// Awards a daily login bonus if not already claimed for the UTC day.
    /// </summary>
    public async Task<ProgressDto> TrackDailyLogin(string username)
    {
        var profile = await GetOrCreateProfile(username);

        if (profile.LastDailyReward?.Date == DateTime.UtcNow.Date)
        {
            return ToDto(profile);
        }

        profile.LastDailyReward = DateTime.UtcNow;
        profile.GoldBalance += 25;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    /// <summary>
    /// Applies bid hold logic, deducts coins for the delta, and increments bid stats.
    /// </summary>
    public async Task<ProgressDto> AwardBidAsync(string username, int amount, string auctionId)
    {
        var profile = await GetOrCreateProfile(username);

        var existingHold = profile.HeldBids.FirstOrDefault(h => h.AuctionId == auctionId);
        var priorAmount = existingHold?.Amount ?? 0;
        var delta = Math.Max(0, amount - priorAmount);
        profile.GoldBalance = Math.Max(0, profile.GoldBalance - delta);

        if (existingHold != null)
        {
            existingHold.Amount = amount;
        }
        else
        {
            profile.HeldBids.Add(new HeldBid { AuctionId = auctionId, Amount = amount });
        }

        profile.BidsPlaced += 1;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    /// <summary>
    /// Increments listing count and coins when a user creates an auction.
    /// </summary>
    public async Task<ProgressDto> AwardListingAsync(string username)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsCreated += 1;
        profile.GoldBalance += 40;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    /// <summary>
    /// Awards coins for completed sales.
    /// </summary>
    public async Task<ProgressDto> AwardSaleAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsSold += 1;
        profile.GoldBalance += CalculateCoinBonus(amount, 0.08, 60);

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    /// <summary>
    /// Awards coins for purchases and increments auctions won.
    /// </summary>
    public async Task<ProgressDto> AwardPurchaseAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsWon += 1;
        profile.GoldBalance += CalculateCoinBonus(amount, 0.05, 40);

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    /// <summary>
    /// Generic dispatcher for awarding based on action keyword.
    /// </summary>
    public Task<ProgressDto> AwardAsync(string username, string action, int? amount = null)
    {
        return action?.ToLower() switch
        {
            "bid" => AwardBidAsync(username, amount ?? 0, string.Empty),
            "list" => AwardListingAsync(username),
            "sale" => AwardSaleAsync(username, amount),
            "purchase" => AwardPurchaseAsync(username, amount),
            "daily-login" => TrackDailyLogin(username),
            _ => TrackDailyLogin(username)
        };
    }

    /// <summary>
    /// Retrieves a profile and updates XP/level before returning DTO.
    /// </summary>
    public async Task<ProgressDto> GetProfile(string username)
    {
        var profile = await GetOrCreateProfile(username);
        RefreshLevel(profile);
        await profile.SaveAsync();
        return ToDto(profile);
    }

    /// <summary>
    /// Marks an achievement as claimed for a user.
    /// </summary>
    public async Task<ProgressDto> ClaimAchievement(string username, string achievementId)
    {
        var profile = await GetOrCreateProfile(username);
        profile.ClaimedAchievements ??= new List<string>();

        if (!profile.ClaimedAchievements.Contains(achievementId, StringComparer.OrdinalIgnoreCase))
        {
            profile.ClaimedAchievements.Add(achievementId);
            await profile.SaveAsync();
        }

        return ToDto(profile);
    }

    /// <summary>
    /// Awards a hero with the specified rarity as an achievement reward.
    /// Does NOT update LastMysteryRewardAt (does not affect daily summon timer).
    /// </summary>
    public async Task<SummonResultDto> SummonAchievementReward(string username, string rarity)
    {
        var profile = await GetOrCreateProfile(username);
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var now = DateTime.UtcNow;

        // Validate rarity
        var validRarity = rarityWeights.Select(r => r.rarity).Contains(rarity) ? rarity : "Common";
        var heroVariant = HeroCatalog.GetRandomVariant(rng, validRarity);
        var gold = goldByRarity[validRarity];

        profile.GoldBalance += gold;
        var ownedHero = new OwnedHero
        {
            HeroId = heroVariant.HeroId,
            VariantId = heroVariant.VariantId,
            Name = heroVariant.Name,
            Discipline = heroVariant.Discipline,
            Rarity = heroVariant.Rarity,
            Strength = heroVariant.Strength,
            Intellect = heroVariant.Intellect,
            Vitality = heroVariant.Vitality,
            Agility = heroVariant.Agility,
            CardImage = heroVariant.CardImage,
            AcquiredAt = now
        };
        profile.OwnedHeroes.Add(ownedHero);

        profile.RecentPurchases ??= new List<string>();
        profile.RecentPurchases.Insert(0, heroVariant.VariantId);
        profile.RecentPurchases = profile.RecentPurchases.Take(50).ToList();

        // NOTE: We intentionally do NOT update LastMysteryRewardAt here
        // so achievement rewards don't affect the daily summon timer

        RefreshLevel(profile);
        await profile.SaveAsync();

        return new SummonResultDto
        {
            Profile = ToDto(profile),
            Hero = MapOwnedHero(ownedHero),
            GoldAwarded = gold,
            Rarity = validRarity
        };
    }

    /// <summary>
    /// Returns a leaderboard sorted by total hero power (then level) for the top 10.
    /// </summary>
    public async Task<List<ProgressDto>> GetLeaderboard()
    {
        var leaders = await DB.Find<UserProgress>().ExecuteAsync();
        var ordered = leaders
            .Select(p =>
            {
                RefreshLevel(p);
                return p;
            })
            .OrderByDescending(p => CalculateHeroPower(p))
            .ThenByDescending(p => p.Level)
            .Take(10)
            .ToList();

        return ordered.Select(ToDto).ToList();
    }

    /// <summary>
    /// Clears held bids for a finished auction and refunds non-winning bidders.
    /// </summary>
    public async Task SettleAuction(string auctionId, string winner)
    {
        var profiles = await DB.Find<UserProgress>()
            .Match(p => p.HeldBids.Any(h => h.AuctionId == auctionId))
            .ExecuteAsync();

        foreach (var profile in profiles)
        {
            var hold = profile.HeldBids.FirstOrDefault(h => h.AuctionId == auctionId);
            if (hold == null) continue;

            profile.HeldBids = profile.HeldBids.Where(h => h.AuctionId != auctionId).ToList();

            if (!string.Equals(profile.Username, winner, StringComparison.OrdinalIgnoreCase))
            {
                profile.GoldBalance += hold.Amount;
            }

            await profile.SaveAsync();
        }
    }

    /// <summary>
    /// Rolls a 24h-gated mystery reward: awards gold and a random hero variant based on weighted rarity.
    /// </summary>
    public async Task<SummonResultDto> OpenMystery(string username)
    {
        var profile = await GetOrCreateProfile(username);
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var now = DateTime.UtcNow;
        if (profile.LastMysteryRewardAt.HasValue && profile.LastMysteryRewardAt.Value.AddHours(24) > now)
        {
            return new SummonResultDto
            {
                Profile = ToDto(profile),
                Hero = null,
                GoldAwarded = 0,
                Rarity = string.Empty
            };
        }

        var rarity = RollRarity();
        var heroVariant = HeroCatalog.GetRandomVariant(rng, rarity);
        var gold = goldByRarity[rarity];

        profile.GoldBalance += gold;
        var ownedHero = new OwnedHero
        {
            HeroId = heroVariant.HeroId,
            VariantId = heroVariant.VariantId,
            Name = heroVariant.Name,
            Discipline = heroVariant.Discipline,
            Rarity = heroVariant.Rarity,
            Strength = heroVariant.Strength,
            Intellect = heroVariant.Intellect,
            Vitality = heroVariant.Vitality,
            Agility = heroVariant.Agility,
            CardImage = heroVariant.CardImage,
            AcquiredAt = now
        };
        profile.OwnedHeroes.Add(ownedHero);

        profile.RecentPurchases ??= new List<string>();
        profile.RecentPurchases.Insert(0, heroVariant.VariantId);
        profile.RecentPurchases = profile.RecentPurchases.Take(50).ToList();

        var powerGained = heroVariant.Strength + heroVariant.Intellect + heroVariant.Vitality + heroVariant.Agility;
        profile.LastMysteryRewardAt = now;
        profile.LastMysteryRewardXp = powerGained;
        profile.LastMysteryRewardCoins = gold;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return new SummonResultDto
        {
            Profile = ToDto(profile),
            Hero = MapOwnedHero(ownedHero),
            GoldAwarded = gold,
            Rarity = rarity
        };
    }

    private string RollRarity()
    {
        var totalWeight = rarityWeights.Sum(r => r.weight);
        var roll = rng.Next(0, totalWeight);
        var cumulative = 0;
        foreach (var (rarity, weight) in rarityWeights)
        {
            cumulative += weight;
            if (roll < cumulative)
            {
                return rarity;
            }
        }

        return "Common";
    }

    internal static int CalculateHeroPower(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        return profile.OwnedHeroes.Sum(h => h.Strength + h.Intellect + h.Vitality + h.Agility);
    }

    private static OwnedHeroDto MapOwnedHero(OwnedHero hero)
    {
        return new OwnedHeroDto
        {
            HeroId = hero.HeroId,
            VariantId = hero.VariantId,
            Name = hero.Name,
            Discipline = hero.Discipline,
            Rarity = hero.Rarity,
            Strength = hero.Strength,
            Intellect = hero.Intellect,
            Vitality = hero.Vitality,
            Agility = hero.Agility,
            CardImage = hero.CardImage ?? string.Empty,
            AcquiredAt = hero.AcquiredAt
        };
    }

}
