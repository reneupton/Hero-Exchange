namespace GamificationService.Entities;

public class UserGamification
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public int Level { get; set; } = 1;
    public int XP { get; set; } = 0;
    public string Title { get; set; } = "Novice Trader";
    public int StreakDays { get; set; } = 0;
    public DateTime LastLogin { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public List<UserAchievement> Achievements { get; set; } = new();
    public List<QuestProgress> QuestProgress { get; set; } = new();
}

public static class LevelTitles
{
    public static string GetTitle(int level)
    {
        return level switch
        {
            >= 50 => "Trading Legend",
            >= 40 => "Master Merchant",
            >= 30 => "Expert Trader",
            >= 20 => "Skilled Dealer",
            >= 10 => "Experienced Seller",
            >= 5 => "Apprentice Trader",
            _ => "Novice Trader"
        };
    }

    public static int GetXPForNextLevel(int currentLevel)
    {
        // Progressive XP requirements
        return 100 + (currentLevel * 50);
    }
}
