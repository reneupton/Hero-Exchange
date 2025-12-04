using Contracts;
using GamificationService.Entities;
using GamificationService.Services;
using MassTransit;

namespace GamificationService.Consumers
{
    public class AuctionFinishedConsumer : IConsumer<AuctionFinished>
    {
        private readonly WalletService _walletService;
        private readonly AchievementService _achievementService;
        private readonly ActivityFeedService _activityFeedService;
        private readonly ILogger<AuctionFinishedConsumer> _logger;

        public AuctionFinishedConsumer(
            WalletService walletService,
            AchievementService achievementService,
            ActivityFeedService activityFeedService,
            ILogger<AuctionFinishedConsumer> logger)
        {
            _walletService = walletService;
            _achievementService = achievementService;
            _activityFeedService = activityFeedService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<AuctionFinished> context)
        {
            _logger.LogInformation($"Processing AuctionFinished event for auction {context.Message.AuctionId}");

            try
            {
                if (context.Message.ItemSold && context.Message.Amount.HasValue)
                {
                    // Transfer FLOG from winner to seller (FLOG was already reserved when bid was placed)
                    await _walletService.AddFlogAsync(
                        context.Message.Seller,
                        context.Message.Amount.Value,
                        TransactionType.Sale,
                        $"Sold item in auction {context.Message.AuctionId}");

                    // Add activity for seller
                    await _activityFeedService.AddActivityAsync(
                        ActivityType.Purchase,
                        context.Message.Seller,
                        context.Message.Seller,
                        $"Sold an item for {context.Message.Amount.Value} FLOG",
                        "💰");

                    // Add activity for winner
                    await _activityFeedService.AddActivityAsync(
                        ActivityType.Purchase,
                        context.Message.Winner,
                        context.Message.Winner,
                        $"Won auction for {context.Message.Amount.Value} FLOG",
                        "🏆");

                    // Check and award achievements
                    await _achievementService.CheckAndUnlockAchievementsAsync(context.Message.Winner);

                    _logger.LogInformation($"Auction {context.Message.AuctionId} completed successfully. Winner: {context.Message.Winner}, Amount: {context.Message.Amount.Value}");
                }
                else
                {
                    // Auction ended without sale - refund highest bidder if exists
                    if (!string.IsNullOrEmpty(context.Message.Winner) && context.Message.Amount.HasValue)
                    {
                        await _walletService.AddFlogAsync(
                            context.Message.Winner,
                            context.Message.Amount.Value,
                            TransactionType.BidRefund,
                            $"Refund for auction {context.Message.AuctionId} - reserve not met");

                        await _activityFeedService.AddActivityAsync(
                            ActivityType.Listing,
                            context.Message.Winner,
                            context.Message.Winner,
                            $"Refunded {context.Message.Amount.Value} FLOG - reserve not met",
                            "💸");

                        _logger.LogInformation($"Auction {context.Message.AuctionId} ended without sale. Refunded {context.Message.Amount.Value} to {context.Message.Winner}");
                    }
                    else
                    {
                        _logger.LogInformation($"Auction {context.Message.AuctionId} ended with no bids");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing AuctionFinished event for auction {context.Message.AuctionId}");
                throw; // Re-throw to let MassTransit handle retry logic
            }
        }
    }
}
