using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace GamificationService.Services;

public class MysteryBoxService
{
    private readonly GamificationDbContext _context;
    private readonly WalletService _walletService;
    private readonly UserGamificationService _gamificationService;
    private readonly ActivityFeedService _activityFeedService;
    private readonly Random _random;

    public MysteryBoxService(
        GamificationDbContext context,
        WalletService walletService,
        UserGamificationService gamificationService,
        ActivityFeedService activityFeedService)
    {
        _context = context;
        _walletService = walletService;
        _gamificationService = gamificationService;
        _activityFeedService = activityFeedService;
        _random = new Random();
    }

    public async Task SeedMysteryBoxesAsync()
    {
        if (await _context.Set<MysteryBox>().AnyAsync())
        {
            return; // Already seeded
        }

        var boxes = new List<MysteryBox>
        {
            new MysteryBox
            {
                Id = Guid.NewGuid(),
                BoxId = "bronze_box",
                Name = "Bronze Mystery Box",
                Tier = MysteryBoxTier.Bronze,
                Price = DemoSettings.BRONZE_BOX_PRICE,
                MinItems = 1,
                MaxItems = 2
            },
            new MysteryBox
            {
                Id = Guid.NewGuid(),
                BoxId = "silver_box",
                Name = "Silver Mystery Box",
                Tier = MysteryBoxTier.Silver,
                Price = DemoSettings.SILVER_BOX_PRICE,
                MinItems = 2,
                MaxItems = 3
            },
            new MysteryBox
            {
                Id = Guid.NewGuid(),
                BoxId = "gold_box",
                Name = "Gold Mystery Box",
                Tier = MysteryBoxTier.Gold,
                Price = DemoSettings.GOLD_BOX_PRICE,
                MinItems = 3,
                MaxItems = 5
            }
        };

        _context.Set<MysteryBox>().AddRange(boxes);
        await _context.SaveChangesAsync();
    }

    public async Task<List<MysteryBox>> GetAvailableBoxesAsync()
    {
        return await _context.Set<MysteryBox>().ToListAsync();
    }

    public async Task<MysteryBoxOpenResult> OpenBoxAsync(string userId, string boxId)
    {
        var box = await _context.Set<MysteryBox>().FirstOrDefaultAsync(b => b.BoxId == boxId);

        if (box == null)
        {
            return new MysteryBoxOpenResult { Success = false, Message = "Mystery box not found" };
        }

        // Check user has enough FLOG
        var wallet = await _walletService.GetOrCreateWalletAsync(userId);
        if (wallet.FlogBalance < box.Price)
        {
            return new MysteryBoxOpenResult
            {
                Success = false,
                Message = "Insufficient FLOG balance to open this mystery box"
            };
        }

        // Deduct price
        await _walletService.DeductFlogAsync(userId, box.Price, TransactionType.MysteryBox, $"Opened {box.Name}");

        // Generate rewards
        var rewards = GenerateRewards(box.Tier);

        // Process rewards
        decimal totalFlogRewarded = 0;
        int totalXpRewarded = 0;

        foreach (var reward in rewards)
        {
            if (reward.Type == "FLOG")
            {
                await _walletService.AddFlogAsync(userId, reward.Amount, TransactionType.MysteryBox, $"Mystery box reward: {reward.Amount} FLOG");
                totalFlogRewarded += reward.Amount;
            }
            else if (reward.Type == "XP")
            {
                await _gamificationService.AddExperienceAsync(userId, (int)reward.Amount);
                totalXpRewarded += (int)reward.Amount;
            }
        }

        // Record opening
        var opening = new MysteryBoxOpening
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MysteryBoxId = box.Id,
            FlogSpent = box.Price,
            FlogReceived = totalFlogRewarded,
            ItemsReceived = rewards.Count,
            RewardsJson = JsonSerializer.Serialize(rewards),
            OpenedAt = DateTime.UtcNow
        };

        _context.Set<MysteryBoxOpening>().Add(opening);
        await _context.SaveChangesAsync();

        // Add activity feed
        await _activityFeedService.AddMysteryBoxActivityAsync(userId, userId, box.Name, rewards.Count);

        return new MysteryBoxOpenResult
        {
            Success = true,
            Message = $"Successfully opened {box.Name}!",
            Rewards = rewards,
            TotalFlogRewarded = totalFlogRewarded,
            TotalXPRewarded = totalXpRewarded
        };
    }

    private List<MysteryBoxReward> GenerateRewards(MysteryBoxTier tier)
    {
        var rewards = new List<MysteryBoxReward>();

        var lootTable = tier switch
        {
            MysteryBoxTier.Bronze => new LootTable
            {
                FlogMin = 50,
                FlogMax = 200,
                RarityChances = new[] { 70, 25, 5, 0, 0 }, // Common, Uncommon, Rare, Epic, Legendary
                ItemCount = _random.Next(1, 3) // 1-2 items
            },
            MysteryBoxTier.Silver => new LootTable
            {
                FlogMin = 100,
                FlogMax = 500,
                RarityChances = new[] { 40, 40, 15, 5, 0 },
                ItemCount = _random.Next(2, 4) // 2-3 items
            },
            MysteryBoxTier.Gold => new LootTable
            {
                FlogMin = 200,
                FlogMax = 1000,
                RarityChances = new[] { 20, 35, 30, 12, 3 },
                ItemCount = _random.Next(3, 6) // 3-5 items
            },
            _ => throw new Exception("Invalid mystery box tier")
        };

        // Always add FLOG reward
        var flogAmount = _random.Next(lootTable.FlogMin, lootTable.FlogMax + 1);
        rewards.Add(new MysteryBoxReward
        {
            Type = "FLOG",
            Name = "FLOG Coins",
            Amount = flogAmount,
            Rarity = "Common"
        });

        // Add random items/XP
        for (int i = 0; i < lootTable.ItemCount; i++)
        {
            var rarity = GetRandomRarity(lootTable.RarityChances);

            // 50% chance of XP boost instead of item
            if (_random.Next(0, 2) == 0)
            {
                var xpAmount = rarity switch
                {
                    "Legendary" => _random.Next(500, 1000),
                    "Epic" => _random.Next(200, 500),
                    "Rare" => _random.Next(100, 200),
                    "Uncommon" => _random.Next(50, 100),
                    _ => _random.Next(25, 50)
                };

                rewards.Add(new MysteryBoxReward
                {
                    Type = "XP",
                    Name = $"{rarity} XP Boost",
                    Amount = xpAmount,
                    Rarity = rarity
                });
            }
            else
            {
                var itemName = GenerateRandomItemName(rarity);
                rewards.Add(new MysteryBoxReward
                {
                    Type = "Item",
                    Name = itemName,
                    Amount = 1,
                    Rarity = rarity
                });
            }
        }

        return rewards;
    }

    private string GetRandomRarity(int[] chances)
    {
        var roll = _random.Next(0, 100);
        var cumulative = 0;

        for (int i = 0; i < chances.Length; i++)
        {
            cumulative += chances[i];
            if (roll < cumulative)
            {
                return i switch
                {
                    0 => "Common",
                    1 => "Uncommon",
                    2 => "Rare",
                    3 => "Epic",
                    4 => "Legendary",
                    _ => "Common"
                };
            }
        }

        return "Common";
    }

    private string GenerateRandomItemName(string rarity)
    {
        var prefixes = new[] { "Ancient", "Mystic", "Enchanted", "Rare", "Legendary", "Epic", "Common", "Unusual" };
        var items = new[] { "Sword", "Shield", "Amulet", "Ring", "Potion", "Scroll", "Gem", "Artifact", "Rune" };

        var prefix = rarity == "Common" ? "" : $"{prefixes[_random.Next(prefixes.Length)]} ";
        var item = items[_random.Next(items.Length)];

        return $"{prefix}{item}";
    }
}

public class LootTable
{
    public int FlogMin { get; set; }
    public int FlogMax { get; set; }
    public int[] RarityChances { get; set; }
    public int ItemCount { get; set; }
}

public class MysteryBoxOpenResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<MysteryBoxReward> Rewards { get; set; }
    public decimal TotalFlogRewarded { get; set; }
    public int TotalXPRewarded { get; set; }
}
