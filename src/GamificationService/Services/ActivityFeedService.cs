using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace GamificationService.Services;

public class ActivityFeedService
{
    private readonly GamificationDbContext _context;

    public ActivityFeedService(GamificationDbContext context)
    {
        _context = context;
    }

    public async Task AddActivityAsync(
        ActivityType type,
        string userId,
        string username,
        string message,
        object metadata = null)
    {
        var activity = new ActivityFeed
        {
            Id = Guid.NewGuid(),
            Type = type,
            UserId = userId,
            Username = username,
            Message = message,
            Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.ActivityFeeds.Add(activity);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ActivityFeed>> GetRecentActivityAsync(int limit = 50)
    {
        return await _context.ActivityFeeds
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<ActivityFeed>> GetUserActivityAsync(string userId, int limit = 50)
    {
        return await _context.ActivityFeeds
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task AddPurchaseActivityAsync(string buyerId, string buyerName, string itemName, decimal amount)
    {
        await AddActivityAsync(
            ActivityType.Purchase,
            buyerId,
            buyerName,
            $"{buyerName} just bought {itemName} for {amount} FLOG!",
            new { ItemName = itemName, Amount = amount });
    }

    public async Task AddListingActivityAsync(string sellerId, string sellerName, string itemName, decimal price)
    {
        await AddActivityAsync(
            ActivityType.Listing,
            sellerId,
            sellerName,
            $"{sellerName} listed {itemName} for {price} FLOG",
            new { ItemName = itemName, Price = price });
    }

    public async Task AddAchievementActivityAsync(string userId, string username, string achievementName, string icon)
    {
        await AddActivityAsync(
            ActivityType.Achievement,
            userId,
            username,
            $"{username} unlocked achievement: {icon} {achievementName}!",
            new { AchievementName = achievementName, Icon = icon });
    }

    public async Task AddLevelUpActivityAsync(string userId, string username, int newLevel, string title)
    {
        await AddActivityAsync(
            ActivityType.LevelUp,
            userId,
            username,
            $"{username} reached level {newLevel} - {title}!",
            new { NewLevel = newLevel, Title = title });
    }

    public async Task AddQuestCompleteActivityAsync(string userId, string username, string questName)
    {
        await AddActivityAsync(
            ActivityType.QuestComplete,
            userId,
            username,
            $"{username} completed quest: {questName}",
            new { QuestName = questName });
    }

    public async Task AddMysteryBoxActivityAsync(string userId, string username, string boxType, int itemCount)
    {
        await AddActivityAsync(
            ActivityType.MysteryBox,
            userId,
            username,
            $"{username} opened a {boxType} mystery box and got {itemCount} items!",
            new { BoxType = boxType, ItemCount = itemCount });
    }

    public async Task CleanupOldActivitiesAsync(int daysToKeep = 7)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);

        var oldActivities = await _context.ActivityFeeds
            .Where(a => a.CreatedAt < cutoffDate)
            .ToListAsync();

        _context.ActivityFeeds.RemoveRange(oldActivities);
        await _context.SaveChangesAsync();
    }
}
