namespace GamificationService.DTOs;

public class AchievementDto
{
    public Guid Id { get; set; }
    public string AchievementId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; }
    public int XPReward { get; set; }
    public int FlogReward { get; set; }
    public string Category { get; set; }
    public string Rarity { get; set; }
}

public class UserAchievementDto
{
    public AchievementDto Achievement { get; set; }
    public DateTime UnlockedAt { get; set; }
}

public class UnlockAchievementRequest
{
    public string AchievementId { get; set; }
}
