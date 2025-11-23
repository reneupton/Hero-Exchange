using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Services;

public class AchievementService
{
    private readonly GamificationDbContext _context;
    private readonly WalletService _walletService;
    private readonly UserGamificationService _gamificationService;

    public AchievementService(
        GamificationDbContext context,
        WalletService walletService,
        UserGamificationService gamificationService)
    {
        _context = context;
        _walletService = walletService;
        _gamificationService = gamificationService;
    }

    public async Task SeedAchievementsAsync()
    {
        if (await _context.Achievements.AnyAsync())
        {
            return; // Already seeded
        }

        var achievements = GetDefaultAchievements();
        _context.Achievements.AddRange(achievements);
        await _context.SaveChangesAsync();
    }

    private List<Achievement> GetDefaultAchievements()
    {
        return new List<Achievement>
        {
            // Trading achievements
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "first_sale",
                Name = "First Sale!",
                Description = "Complete your first sale",
                Icon = "🎉",
                XPReward = 100,
                FlogReward = 200,
                Category = AchievementCategory.Trading,
                Rarity = AchievementRarity.Common,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "first_purchase",
                Name = "First Purchase",
                Description = "Make your first purchase",
                Icon = "🛒",
                XPReward = 50,
                FlogReward = 100,
                Category = AchievementCategory.Trading,
                Rarity = AchievementRarity.Common,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "speed_trader",
                Name = "Speed Trader",
                Description = "Complete 5 transactions in one day",
                Icon = "⚡",
                XPReward = 250,
                FlogReward = 500,
                Category = AchievementCategory.Trading,
                Rarity = AchievementRarity.Rare,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "trading_tycoon",
                Name = "Trading Tycoon",
                Description = "Complete 100 total transactions",
                Icon = "💼",
                XPReward = 1000,
                FlogReward = 2000,
                Category = AchievementCategory.Trading,
                Rarity = AchievementRarity.Epic,
                CreatedAt = DateTime.UtcNow
            },

            // Collection achievements
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "rare_collector",
                Name = "Rare Collector",
                Description = "Own 3 rare or better items",
                Icon = "💎",
                XPReward = 500,
                FlogReward = 1000,
                Category = AchievementCategory.Collection,
                Rarity = AchievementRarity.Rare,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "legendary_hunter",
                Name = "Legendary Hunter",
                Description = "Obtain a legendary item",
                Icon = "🏆",
                XPReward = 2000,
                FlogReward = 5000,
                Category = AchievementCategory.Collection,
                Rarity = AchievementRarity.Legendary,
                CreatedAt = DateTime.UtcNow
            },

            // Milestone achievements
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "level_10",
                Name = "Experienced Trader",
                Description = "Reach level 10",
                Icon = "⭐",
                XPReward = 500,
                FlogReward = 1000,
                Category = AchievementCategory.Milestone,
                Rarity = AchievementRarity.Rare,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "level_25",
                Name = "Master Merchant",
                Description = "Reach level 25",
                Icon = "👑",
                XPReward = 1500,
                FlogReward = 3000,
                Category = AchievementCategory.Milestone,
                Rarity = AchievementRarity.Epic,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "level_50",
                Name = "Trading Legend",
                Description = "Reach maximum level 50",
                Icon = "🌟",
                XPReward = 5000,
                FlogReward = 10000,
                Category = AchievementCategory.Milestone,
                Rarity = AchievementRarity.Legendary,
                CreatedAt = DateTime.UtcNow
            },

            // Social achievements
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "social_butterfly",
                Name = "Social Butterfly",
                Description = "Like and comment on 50 items",
                Icon = "🦋",
                XPReward = 300,
                FlogReward = 600,
                Category = AchievementCategory.Social,
                Rarity = AchievementRarity.Rare,
                CreatedAt = DateTime.UtcNow
            },

            // Special achievements
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "mystery_master",
                Name = "Mystery Master",
                Description = "Open 10 mystery boxes",
                Icon = "🎁",
                XPReward = 750,
                FlogReward = 1500,
                Category = AchievementCategory.Special,
                Rarity = AchievementRarity.Epic,
                CreatedAt = DateTime.UtcNow
            },
            new Achievement
            {
                Id = Guid.NewGuid(),
                AchievementId = "streak_warrior",
                Name = "Streak Warrior",
                Description = "Maintain a 7-day login streak",
                Icon = "🔥",
                XPReward = 500,
                FlogReward = 1000,
                Category = AchievementCategory.Special,
                Rarity = AchievementRarity.Rare,
                CreatedAt = DateTime.UtcNow
            }
        };
    }

    public async Task<List<Achievement>> GetAllAchievementsAsync()
    {
        return await _context.Achievements.ToListAsync();
    }

    public async Task<List<UserAchievement>> GetUserAchievementsAsync(string userId)
    {
        return await _context.UserAchievements
            .Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == userId)
            .OrderByDescending(ua => ua.UnlockedAt)
            .ToListAsync();
    }

    public async Task<AchievementUnlockResult> UnlockAchievementAsync(string userId, string achievementId)
    {
        var userGamification = await _gamificationService.GetOrCreateUserGamificationAsync(userId);

        var achievement = await _context.Achievements
            .FirstOrDefaultAsync(a => a.AchievementId == achievementId);

        if (achievement == null)
        {
            return new AchievementUnlockResult { Success = false, Message = "Achievement not found" };
        }

        // Check if already unlocked
        var existing = await _context.UserAchievements
            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievement.Id);

        if (existing != null)
        {
            return new AchievementUnlockResult { Success = false, Message = "Achievement already unlocked" };
        }

        // Unlock achievement
        var userAchievement = new UserAchievement
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AchievementId = achievement.Id,
            UnlockedAt = DateTime.UtcNow,
            UserGamificationId = userGamification.Id
        };

        _context.UserAchievements.Add(userAchievement);

        // Award FLOG
        await _walletService.AddFlogAsync(
            userId,
            achievement.FlogReward,
            TransactionType.AchievementReward,
            $"Achievement unlocked: {achievement.Name}");

        // Award XP
        var levelUpResult = await _gamificationService.AddExperienceAsync(userId, achievement.XPReward);

        await _context.SaveChangesAsync();

        return new AchievementUnlockResult
        {
            Success = true,
            Message = $"Achievement unlocked: {achievement.Name}!",
            Achievement = achievement,
            FlogRewarded = achievement.FlogReward,
            XPRewarded = achievement.XPReward,
            LeveledUp = levelUpResult.LeveledUp,
            NewLevel = levelUpResult.NewLevel
        };
    }

    public async Task CheckAndUnlockAchievementsAsync(string userId)
    {
        // This method will check various conditions and unlock achievements automatically
        // Can be called after significant events (purchases, sales, level ups, etc.)

        var userGamification = await _gamificationService.GetOrCreateUserGamificationAsync(userId);
        var wallet = await _context.UserWallets.FirstOrDefaultAsync(w => w.UserId == userId);

        // Check level achievements
        if (userGamification.Level >= 10)
        {
            await UnlockAchievementAsync(userId, "level_10");
        }
        if (userGamification.Level >= 25)
        {
            await UnlockAchievementAsync(userId, "level_25");
        }
        if (userGamification.Level >= 50)
        {
            await UnlockAchievementAsync(userId, "level_50");
        }

        // Check streak achievements
        if (userGamification.StreakDays >= 7)
        {
            await UnlockAchievementAsync(userId, "streak_warrior");
        }

        // Additional checks can be added here
    }
}

public class AchievementUnlockResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public Achievement Achievement { get; set; }
    public int FlogRewarded { get; set; }
    public int XPRewarded { get; set; }
    public bool LeveledUp { get; set; }
    public int NewLevel { get; set; }
}
