namespace GamificationService.DTOs;

public class UserGamificationDto
{
    public string UserId { get; set; }
    public int Level { get; set; }
    public int XP { get; set; }
    public int XPForNextLevel { get; set; }
    public string Title { get; set; }
    public int StreakDays { get; set; }
    public int AchievementCount { get; set; }
    public int CompletedQuestsCount { get; set; }
}

public class AddExperienceRequest
{
    public int Amount { get; set; }
}

public class LeaderboardDto
{
    public int Rank { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }
    public int Level { get; set; }
    public int XP { get; set; }
    public string Title { get; set; }
}
