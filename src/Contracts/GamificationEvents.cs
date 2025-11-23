namespace Contracts;

public class UserLeveledUp
{
    public string UserId { get; set; }
    public int OldLevel { get; set; }
    public int NewLevel { get; set; }
    public string NewTitle { get; set; }
    public DateTime LeveledUpAt { get; set; }
}

public class AchievementUnlocked
{
    public string UserId { get; set; }
    public string AchievementId { get; set; }
    public string AchievementName { get; set; }
    public string Icon { get; set; }
    public int FlogReward { get; set; }
    public int XPReward { get; set; }
    public DateTime UnlockedAt { get; set; }
}

public class QuestCompleted
{
    public string UserId { get; set; }
    public string QuestId { get; set; }
    public string QuestName { get; set; }
    public int FlogReward { get; set; }
    public int XPReward { get; set; }
    public DateTime CompletedAt { get; set; }
}

public class PurchaseCompleted
{
    public string BuyerId { get; set; }
    public string SellerId { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; }
    public decimal Amount { get; set; }
    public ItemRarity? Rarity { get; set; }
    public DateTime PurchasedAt { get; set; }
}

public class ItemListed
{
    public Guid ItemId { get; set; }
    public string SellerId { get; set; }
    public string ItemName { get; set; }
    public decimal Price { get; set; }
    public ItemRarity? Rarity { get; set; }
    public DateTime ListedAt { get; set; }
}
