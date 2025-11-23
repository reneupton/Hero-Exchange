namespace GamificationService.Entities;

public class Quest
{
    public Guid Id { get; set; }
    public string QuestId { get; set; } // Unique identifier for quest type
    public string Name { get; set; }
    public string Description { get; set; }
    public QuestType Type { get; set; }
    public int Target { get; set; } // Goal amount (e.g., "List 3 items")
    public int FlogReward { get; set; }
    public int XPReward { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class QuestProgress
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public Guid QuestId { get; set; }
    public Quest Quest { get; set; }
    public int Progress { get; set; } = 0;
    public bool Completed { get; set; } = false;
    public bool Claimed { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation property
    public Guid UserGamificationId { get; set; }
    public UserGamification UserGamification { get; set; }
}

public enum QuestType
{
    Daily,
    Weekly,
    Special,
    Tutorial
}
