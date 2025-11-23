using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Services;

public class TransactionService
{
    private readonly GamificationDbContext _context;
    private readonly WalletService _walletService;
    private readonly UserGamificationService _gamificationService;

    public TransactionService(
        GamificationDbContext context,
        WalletService walletService,
        UserGamificationService gamificationService)
    {
        _context = context;
        _walletService = walletService;
        _gamificationService = gamificationService;
    }

    public async Task<TransactionResult> ProcessPurchaseAsync(
        string buyerId,
        string sellerId,
        Guid itemId,
        decimal amount,
        string itemName)
    {
        // Check buyer has enough FLOG
        var buyerWallet = await _walletService.GetOrCreateWalletAsync(buyerId);

        if (buyerWallet.FlogBalance < amount)
        {
            return new TransactionResult
            {
                Success = false,
                Message = "Insufficient FLOG balance! Complete quests to earn more."
            };
        }

        // Calculate marketplace fee
        var fee = amount * DemoSettings.MARKETPLACE_FEE_PERCENTAGE;
        var sellerReceives = amount - fee;

        // Deduct from buyer
        buyerWallet.FlogBalance -= amount;
        buyerWallet.TotalSpent += amount;
        buyerWallet.UpdatedAt = DateTime.UtcNow;

        // Add to seller
        var sellerWallet = await _walletService.GetOrCreateWalletAsync(sellerId);
        sellerWallet.FlogBalance += sellerReceives;
        sellerWallet.TotalEarned += sellerReceives;
        sellerWallet.UpdatedAt = DateTime.UtcNow;

        // Create transaction records
        var buyerTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = buyerId,
            SellerId = sellerId,
            ItemId = itemId,
            Amount = -amount,
            Fee = fee,
            Type = TransactionType.Purchase,
            Description = $"Purchased {itemName}",
            CreatedAt = DateTime.UtcNow,
            UserWalletId = buyerWallet.Id
        };

        var sellerTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = buyerId,
            SellerId = sellerId,
            ItemId = itemId,
            Amount = sellerReceives,
            Fee = fee,
            Type = TransactionType.Sale,
            Description = $"Sold {itemName}",
            CreatedAt = DateTime.UtcNow,
            UserWalletId = sellerWallet.Id
        };

        _context.Transactions.Add(buyerTransaction);
        _context.Transactions.Add(sellerTransaction);

        // Award XP to both parties
        await _gamificationService.AddExperienceAsync(buyerId, (int)DemoSettings.PURCHASE_XP_REWARD);
        await _gamificationService.AddExperienceAsync(sellerId, (int)DemoSettings.SALE_XP_REWARD);

        await _context.SaveChangesAsync();

        return new TransactionResult
        {
            Success = true,
            Message = "Purchase successful!",
            Transaction = buyerTransaction,
            BuyerNewBalance = buyerWallet.FlogBalance,
            SellerNewBalance = sellerWallet.FlogBalance
        };
    }

    public async Task<bool> ProcessListingRewardAsync(string userId, string itemName)
    {
        await _walletService.AddFlogAsync(
            userId,
            DemoSettings.LISTING_REWARD,
            TransactionType.Sale,
            $"Reward for listing {itemName}");

        return true;
    }

    public async Task<bool> ProcessDailyBonusAsync(string userId)
    {
        await _walletService.AddFlogAsync(
            userId,
            DemoSettings.DAILY_LOGIN_BONUS,
            TransactionType.DailyBonus,
            "Daily login bonus");

        return true;
    }
}

public class TransactionResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public Transaction Transaction { get; set; }
    public decimal BuyerNewBalance { get; set; }
    public decimal SellerNewBalance { get; set; }
}
