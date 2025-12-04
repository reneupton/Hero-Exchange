using GamificationService.DTOs;
using GamificationService.Entities;
using GamificationService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly WalletService _walletService;

    public WalletController(WalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<WalletDto>> GetWallet(string userId)
    {
        var wallet = await _walletService.GetOrCreateWalletAsync(userId);

        var dto = new WalletDto
        {
            UserId = wallet.UserId,
            FlogBalance = wallet.FlogBalance,
            FlogStaked = wallet.FlogStaked,
            TotalEarned = wallet.TotalEarned,
            TotalSpent = wallet.TotalSpent,
            FlogToGBP = DemoSettings.FLOG_TO_GBP,
            FlogToUSD = DemoSettings.FLOG_TO_USD,
            FlogToEUR = DemoSettings.FLOG_TO_EUR
        };

        return Ok(dto);
    }

    [HttpGet("{userId}/balance")]
    public async Task<ActionResult<decimal>> GetBalance(string userId)
    {
        var balance = await _walletService.GetBalanceAsync(userId);
        return Ok(balance);
    }

    [HttpGet("{userId}/transactions")]
    public async Task<ActionResult<List<TransactionDto>>> GetTransactionHistory(string userId, [FromQuery] int limit = 50)
    {
        var transactions = await _walletService.GetTransactionHistoryAsync(userId, limit);

        var dtos = transactions.Select(t => new TransactionDto
        {
            Id = t.Id,
            BuyerId = t.BuyerId,
            SellerId = t.SellerId,
            ItemId = t.ItemId,
            Amount = t.Amount,
            Fee = t.Fee,
            Type = t.Type.ToString(),
            Description = t.Description,
            CreatedAt = t.CreatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("{userId}/stake")]
    public async Task<ActionResult> StakeFlog(string userId, [FromBody] StakeFlogRequest request)
    {
        var success = await _walletService.StakeFlogAsync(userId, request.Amount);

        if (!success)
        {
            return BadRequest(new { message = "Insufficient balance to stake" });
        }

        return Ok(new { message = $"Successfully staked {request.Amount} FLOG" });
    }

    [HttpPost("{userId}/unstake")]
    public async Task<ActionResult> UnstakeFlog(string userId, [FromBody] StakeFlogRequest request)
    {
        var success = await _walletService.UnstakeFlogAsync(userId, request.Amount);

        if (!success)
        {
            return BadRequest(new { message = "Insufficient staked amount" });
        }

        return Ok(new { message = $"Successfully unstaked {request.Amount} FLOG" });
    }

    [HttpPost("{userId}/add")]
    public async Task<ActionResult> AddFlog(string userId, [FromBody] TransactionRequest request)
    {
        if (!Enum.TryParse<TransactionType>(request.TransactionType, true, out var transactionType))
        {
            return BadRequest(new { message = $"Invalid transaction type: {request.TransactionType}" });
        }

        var success = await _walletService.AddFlogAsync(userId, request.Amount, transactionType, request.Description);

        if (!success)
        {
            return BadRequest(new { message = "Failed to add FLOG" });
        }

        return Ok(new { message = $"Successfully added {request.Amount} FLOG" });
    }

    [HttpPost("{userId}/deduct")]
    public async Task<ActionResult> DeductFlog(string userId, [FromBody] TransactionRequest request)
    {
        if (!Enum.TryParse<TransactionType>(request.TransactionType, true, out var transactionType))
        {
            return BadRequest(new { message = $"Invalid transaction type: {request.TransactionType}" });
        }

        var success = await _walletService.DeductFlogAsync(userId, request.Amount, transactionType, request.Description);

        if (!success)
        {
            return BadRequest(new { message = "Insufficient FLOG balance" });
        }

        return Ok(new { message = $"Successfully deducted {request.Amount} FLOG" });
    }
}
