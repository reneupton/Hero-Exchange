namespace GamificationService.Entities;

public class ActivityFeed
{
    public Guid Id { get; set; }
    public ActivityType Type { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }
    public string Message { get; set; }
    public string Metadata { get; set; } // JSON data for additional info
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ActivityType
{
    Purchase,
    Listing,
    Achievement,
    LevelUp,
    QuestComplete,
    MysteryBox
}
