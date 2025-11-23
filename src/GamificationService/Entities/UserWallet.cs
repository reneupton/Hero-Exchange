namespace GamificationService.Entities;

public class UserWallet
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public decimal FlogBalance { get; set; } = 1000m; // Starting balance
    public decimal FlogStaked { get; set; } = 0m;
    public decimal TotalEarned { get; set; } = 0m;
    public decimal TotalSpent { get; set; } = 0m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public List<Transaction> Transactions { get; set; } = new();
}
