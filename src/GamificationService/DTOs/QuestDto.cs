namespace GamificationService.DTOs;

public class QuestDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Type { get; set; }
    public int Target { get; set; }
    public int FlogReward { get; set; }
    public int XPReward { get; set; }
}

public class QuestProgressDto
{
    public Guid Id { get; set; }
    public QuestDto Quest { get; set; }
    public int Progress { get; set; }
    public int Target { get; set; }
    public bool Completed { get; set; }
    public bool Claimed { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class UpdateQuestProgressRequest
{
    public string QuestType { get; set; }
    public int IncrementAmount { get; set; } = 1;
}

public class ClaimQuestRewardRequest
{
    public Guid QuestProgressId { get; set; }
}
