namespace GamificationService.Entities;

public class MysteryBox
{
    public Guid Id { get; set; }
    public string BoxId { get; set; }
    public string Name { get; set; }
    public MysteryBoxTier Tier { get; set; }
    public decimal Price { get; set; }
    public int MinItems { get; set; }
    public int MaxItems { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MysteryBoxOpening
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public Guid MysteryBoxId { get; set; }
    public MysteryBox MysteryBox { get; set; }
    public decimal FlogSpent { get; set; }
    public decimal FlogReceived { get; set; }
    public int ItemsReceived { get; set; }
    public string RewardsJson { get; set; } // JSON array of rewards
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
}

public enum MysteryBoxTier
{
    Bronze,
    Silver,
    Gold
}

public class MysteryBoxReward
{
    public string Type { get; set; } // "FLOG", "Item", "XP"
    public string Name { get; set; }
    public decimal Amount { get; set; }
    public string Rarity { get; set; }
}
