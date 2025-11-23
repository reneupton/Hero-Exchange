using GamificationService.Data;
using GamificationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Services;

public class WalletService
{
    private readonly GamificationDbContext _context;

    public WalletService(GamificationDbContext context)
    {
        _context = context;
    }

    public async Task<UserWallet> GetOrCreateWalletAsync(string userId)
    {
        var wallet = await _context.UserWallets
            .Include(w => w.Transactions)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            wallet = new UserWallet
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FlogBalance = DemoSettings.STARTING_BALANCE,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserWallets.Add(wallet);
            await _context.SaveChangesAsync();
        }

        return wallet;
    }

    public async Task<decimal> GetBalanceAsync(string userId)
    {
        var wallet = await GetOrCreateWalletAsync(userId);
        return wallet.FlogBalance;
    }

    public async Task<bool> AddFlogAsync(string userId, decimal amount, TransactionType type, string description)
    {
        var wallet = await GetOrCreateWalletAsync(userId);

        wallet.FlogBalance += amount;
        wallet.TotalEarned += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = userId,
            SellerId = null,
            Amount = amount,
            Fee = 0,
            Type = type,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UserWalletId = wallet.Id
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeductFlogAsync(string userId, decimal amount, TransactionType type, string description)
    {
        var wallet = await GetOrCreateWalletAsync(userId);

        if (wallet.FlogBalance < amount)
        {
            return false; // Insufficient balance
        }

        wallet.FlogBalance -= amount;
        wallet.TotalSpent += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = userId,
            SellerId = null,
            Amount = -amount,
            Fee = 0,
            Type = type,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UserWalletId = wallet.Id
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<Transaction>> GetTransactionHistoryAsync(string userId, int limit = 50)
    {
        var wallet = await GetOrCreateWalletAsync(userId);

        return await _context.Transactions
            .Where(t => t.UserWalletId == wallet.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<bool> StakeFlogAsync(string userId, decimal amount)
    {
        var wallet = await GetOrCreateWalletAsync(userId);

        if (wallet.FlogBalance < amount)
        {
            return false;
        }

        wallet.FlogBalance -= amount;
        wallet.FlogStaked += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = userId,
            Amount = -amount,
            Type = TransactionType.Staking,
            Description = $"Staked {amount} FLOG",
            CreatedAt = DateTime.UtcNow,
            UserWalletId = wallet.Id
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UnstakeFlogAsync(string userId, decimal amount)
    {
        var wallet = await GetOrCreateWalletAsync(userId);

        if (wallet.FlogStaked < amount)
        {
            return false;
        }

        wallet.FlogStaked -= amount;
        wallet.FlogBalance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            BuyerId = userId,
            Amount = amount,
            Type = TransactionType.Unstaking,
            Description = $"Unstaked {amount} FLOG",
            CreatedAt = DateTime.UtcNow,
            UserWalletId = wallet.Id
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return true;
    }
}
