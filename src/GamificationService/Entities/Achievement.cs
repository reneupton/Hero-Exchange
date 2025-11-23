namespace GamificationService.Entities;

public class Achievement
{
    public Guid Id { get; set; }
    public string AchievementId { get; set; } // Unique identifier
    public string Name { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; } // Emoji or icon identifier
    public int XPReward { get; set; }
    public int FlogReward { get; set; }
    public AchievementCategory Category { get; set; }
    public AchievementRarity Rarity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UserAchievement
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public Guid AchievementId { get; set; }
    public Achievement Achievement { get; set; }
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Guid UserGamificationId { get; set; }
    public UserGamification UserGamification { get; set; }
}

public enum AchievementCategory
{
    Trading,
    Social,
    Collection,
    Milestone,
    Special
}

public enum AchievementRarity
{
    Common,
    Rare,
    Epic,
    Legendary
}
