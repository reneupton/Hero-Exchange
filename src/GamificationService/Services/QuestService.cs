using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Services;

public class QuestService
{
    private readonly GamificationDbContext _context;
    private readonly WalletService _walletService;
    private readonly UserGamificationService _gamificationService;

    public QuestService(
        GamificationDbContext context,
        WalletService walletService,
        UserGamificationService gamificationService)
    {
        _context = context;
        _walletService = walletService;
        _gamificationService = gamificationService;
    }

    public async Task<List<Quest>> GetDailyQuestsAsync()
    {
        var today = DateTime.UtcNow.Date;

        var existingQuests = await _context.Quests
            .Where(q => q.Type == QuestType.Daily && q.IsActive)
            .Where(q => q.CreatedAt.Date == today)
            .ToListAsync();

        if (existingQuests.Any())
        {
            return existingQuests;
        }

        // Generate new daily quests
        var dailyQuests = GenerateDailyQuests();

        _context.Quests.AddRange(dailyQuests);
        await _context.SaveChangesAsync();

        return dailyQuests;
    }

    private List<Quest> GenerateDailyQuests()
    {
        return new List<Quest>
        {
            new Quest
            {
                Id = Guid.NewGuid(),
                QuestId = $"daily_login_{DateTime.UtcNow:yyyyMMdd}",
                Name = "Daily Login",
                Description = "Login to claim your daily bonus",
                Type = QuestType.Daily,
                Target = 1,
                FlogReward = 50,
                XPReward = 10,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Quest
            {
                Id = Guid.NewGuid(),
                QuestId = $"list_items_{DateTime.UtcNow:yyyyMMdd}",
                Name = "Market Maker",
                Description = "List 3 items for sale",
                Type = QuestType.Daily,
                Target = 3,
                FlogReward = 100,
                XPReward = 50,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Quest
            {
                Id = Guid.NewGuid(),
                QuestId = $"make_purchase_{DateTime.UtcNow:yyyyMMdd}",
                Name = "Smart Shopper",
                Description = "Purchase any item",
                Type = QuestType.Daily,
                Target = 1,
                FlogReward = 75,
                XPReward = 35,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Quest
            {
                Id = Guid.NewGuid(),
                QuestId = $"social_actions_{DateTime.UtcNow:yyyyMMdd}",
                Name = "Social Butterfly",
                Description = "Like and comment on 5 items",
                Type = QuestType.Daily,
                Target = 5,
                FlogReward = 50,
                XPReward = 25,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };
    }

    public async Task<List<QuestProgress>> GetUserQuestProgressAsync(string userId)
    {
        var userGamification = await _gamificationService.GetOrCreateUserGamificationAsync(userId);
        var today = DateTime.UtcNow.Date;

        var dailyQuests = await GetDailyQuestsAsync();

        var questProgress = new List<QuestProgress>();

        foreach (var quest in dailyQuests)
        {
            var progress = await _context.QuestProgress
                .Include(qp => qp.Quest)
                .FirstOrDefaultAsync(qp => qp.UserId == userId && qp.QuestId == quest.Id);

            if (progress == null)
            {
                progress = new QuestProgress
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    QuestId = quest.Id,
                    Quest = quest,
                    Progress = 0,
                    Completed = false,
                    Claimed = false,
                    UpdatedAt = DateTime.UtcNow,
                    UserGamificationId = userGamification.Id
                };

                _context.QuestProgress.Add(progress);
                await _context.SaveChangesAsync();
            }

            questProgress.Add(progress);
        }

        return questProgress;
    }

    public async Task<bool> UpdateQuestProgressAsync(string userId, string questType, int incrementAmount = 1)
    {
        var userGamification = await _gamificationService.GetOrCreateUserGamificationAsync(userId);
        var today = DateTime.UtcNow.Date;

        var quest = await _context.Quests
            .FirstOrDefaultAsync(q => q.QuestId.Contains(questType) && q.CreatedAt.Date == today);

        if (quest == null) return false;

        var progress = await _context.QuestProgress
            .FirstOrDefaultAsync(qp => qp.UserId == userId && qp.QuestId == quest.Id);

        if (progress == null)
        {
            progress = new QuestProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                QuestId = quest.Id,
                Progress = 0,
                Completed = false,
                Claimed = false,
                UpdatedAt = DateTime.UtcNow,
                UserGamificationId = userGamification.Id
            };

            _context.QuestProgress.Add(progress);
        }

        if (!progress.Completed)
        {
            progress.Progress += incrementAmount;

            if (progress.Progress >= quest.Target)
            {
                progress.Progress = quest.Target;
                progress.Completed = true;
                progress.CompletedAt = DateTime.UtcNow;
            }

            progress.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<QuestRewardResult> ClaimQuestRewardAsync(string userId, Guid questProgressId)
    {
        var progress = await _context.QuestProgress
            .Include(qp => qp.Quest)
            .FirstOrDefaultAsync(qp => qp.Id == questProgressId && qp.UserId == userId);

        if (progress == null)
        {
            return new QuestRewardResult { Success = false, Message = "Quest not found" };
        }

        if (!progress.Completed)
        {
            return new QuestRewardResult { Success = false, Message = "Quest not completed yet" };
        }

        if (progress.Claimed)
        {
            return new QuestRewardResult { Success = false, Message = "Reward already claimed" };
        }

        // Award FLOG
        await _walletService.AddFlogAsync(
            userId,
            progress.Quest.FlogReward,
            TransactionType.QuestReward,
            $"Quest reward: {progress.Quest.Name}");

        // Award XP
        var levelUpResult = await _gamificationService.AddExperienceAsync(userId, progress.Quest.XPReward);

        progress.Claimed = true;
        progress.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new QuestRewardResult
        {
            Success = true,
            Message = "Quest reward claimed!",
            FlogRewarded = progress.Quest.FlogReward,
            XPRewarded = progress.Quest.XPReward,
            LeveledUp = levelUpResult.LeveledUp,
            NewLevel = levelUpResult.NewLevel
        };
    }
}

public class QuestRewardResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public int FlogRewarded { get; set; }
    public int XPRewarded { get; set; }
    public bool LeveledUp { get; set; }
    public int NewLevel { get; set; }
}
