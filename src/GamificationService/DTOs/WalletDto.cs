namespace GamificationService.DTOs;

public class WalletDto
{
    public string UserId { get; set; }
    public decimal FlogBalance { get; set; }
    public decimal FlogStaked { get; set; }
    public decimal TotalEarned { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal FlogToGBP { get; set; }
    public decimal FlogToUSD { get; set; }
    public decimal FlogToEUR { get; set; }
}

public class TransactionDto
{
    public Guid Id { get; set; }
    public string BuyerId { get; set; }
    public string SellerId { get; set; }
    public Guid? ItemId { get; set; }
    public decimal Amount { get; set; }
    public decimal Fee { get; set; }
    public string Type { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AddFlogRequest
{
    public decimal Amount { get; set; }
    public string Description { get; set; }
}

public class StakeFlogRequest
{
    public decimal Amount { get; set; }
}
