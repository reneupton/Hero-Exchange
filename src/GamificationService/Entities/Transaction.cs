namespace GamificationService.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public string BuyerId { get; set; }
    public string SellerId { get; set; }
    public Guid? ItemId { get; set; }
    public decimal Amount { get; set; }
    public decimal Fee { get; set; } // Marketplace fee (5%)
    public TransactionType Type { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Guid UserWalletId { get; set; }
    public UserWallet UserWallet { get; set; }
}

public enum TransactionType
{
    Purchase,
    Sale,
    QuestReward,
    AchievementReward,
    DailyBonus,
    MysteryBox,
    Staking,
    Unstaking,
    AdReward
}
