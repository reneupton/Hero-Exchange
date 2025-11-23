using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Services;

public class UserGamificationService
{
    private readonly GamificationDbContext _context;

    public UserGamificationService(GamificationDbContext context)
    {
        _context = context;
    }

    public async Task<UserGamification> GetOrCreateUserGamificationAsync(string userId)
    {
        var userGamification = await _context.UserGamifications
            .Include(u => u.Achievements)
            .Include(u => u.QuestProgress)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (userGamification == null)
        {
            userGamification = new UserGamification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Level = 1,
                XP = 0,
                Title = LevelTitles.GetTitle(1),
                StreakDays = 0,
                LastLogin = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserGamifications.Add(userGamification);
            await _context.SaveChangesAsync();
        }

        return userGamification;
    }

    public async Task<LevelUpResult> AddExperienceAsync(string userId, int xpAmount)
    {
        var userGamification = await GetOrCreateUserGamificationAsync(userId);

        var oldLevel = userGamification.Level;
        userGamification.XP += xpAmount;
        userGamification.UpdatedAt = DateTime.UtcNow;

        // Check for level up
        var leveledUp = false;
        while (userGamification.Level < DemoSettings.MAX_LEVEL)
        {
            var xpForNextLevel = LevelTitles.GetXPForNextLevel(userGamification.Level);

            if (userGamification.XP >= xpForNextLevel)
            {
                userGamification.XP -= xpForNextLevel;
                userGamification.Level++;
                leveledUp = true;
            }
            else
            {
                break;
            }
        }

        // Update title if leveled up
        if (leveledUp)
        {
            userGamification.Title = LevelTitles.GetTitle(userGamification.Level);
        }

        await _context.SaveChangesAsync();

        return new LevelUpResult
        {
            LeveledUp = leveledUp,
            OldLevel = oldLevel,
            NewLevel = userGamification.Level,
            CurrentXP = userGamification.XP,
            XPForNextLevel = LevelTitles.GetXPForNextLevel(userGamification.Level),
            NewTitle = userGamification.Title
        };
    }

    public async Task<bool> UpdateLoginStreakAsync(string userId)
    {
        var userGamification = await GetOrCreateUserGamificationAsync(userId);
        var now = DateTime.UtcNow;
        var daysSinceLastLogin = (now - userGamification.LastLogin).TotalDays;

        if (daysSinceLastLogin >= 1 && daysSinceLastLogin < 2)
        {
            // Consecutive day - increment streak
            userGamification.StreakDays++;
        }
        else if (daysSinceLastLogin >= 2)
        {
            // Streak broken - reset
            userGamification.StreakDays = 1;
        }
        // If < 1 day, already logged in today, no change

        userGamification.LastLogin = now;
        userGamification.UpdatedAt = now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserStats> GetUserStatsAsync(string userId)
    {
        var userGamification = await GetOrCreateUserGamificationAsync(userId);
        var achievementCount = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .CountAsync();

        var completedQuestsCount = await _context.QuestProgress
            .Where(qp => qp.UserId == userId && qp.Completed)
            .CountAsync();

        return new UserStats
        {
            Level = userGamification.Level,
            XP = userGamification.XP,
            XPForNextLevel = LevelTitles.GetXPForNextLevel(userGamification.Level),
            Title = userGamification.Title,
            StreakDays = userGamification.StreakDays,
            AchievementCount = achievementCount,
            CompletedQuestsCount = completedQuestsCount
        };
    }

    public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(int limit = 100)
    {
        var topUsers = await _context.UserGamifications
            .OrderByDescending(u => u.Level)
            .ThenByDescending(u => u.XP)
            .Take(limit)
            .ToListAsync();

        var leaderboard = new List<LeaderboardEntry>();
        var rank = 1;

        foreach (var user in topUsers)
        {
            leaderboard.Add(new LeaderboardEntry
            {
                Rank = rank++,
                UserId = user.UserId,
                Level = user.Level,
                XP = user.XP,
                Title = user.Title
            });
        }

        return leaderboard;
    }
}

public class LevelUpResult
{
    public bool LeveledUp { get; set; }
    public int OldLevel { get; set; }
    public int NewLevel { get; set; }
    public int CurrentXP { get; set; }
    public int XPForNextLevel { get; set; }
    public string NewTitle { get; set; }
}

public class UserStats
{
    public int Level { get; set; }
    public int XP { get; set; }
    public int XPForNextLevel { get; set; }
    public string Title { get; set; }
    public int StreakDays { get; set; }
    public int AchievementCount { get; set; }
    public int CompletedQuestsCount { get; set; }
}

public class LeaderboardEntry
{
    public int Rank { get; set; }
    public string UserId { get; set; }
    public int Level { get; set; }
    public int XP { get; set; }
    public string Title { get; set; }
}
