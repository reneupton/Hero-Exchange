using System.Net.Http.Json;
using System.Text.Json;

namespace BiddingService.Services
{
    public class GamificationClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GamificationClient> _logger;

        public GamificationClient(HttpClient httpClient, ILogger<GamificationClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<bool> CheckAndReserveFlogAsync(string userId, decimal amount, string description)
        {
            try
            {
                var request = new
                {
                    amount = amount,
                    transactionType = "Bid",
                    description = description
                };

                var response = await _httpClient.PostAsJsonAsync(
                    $"api/wallet/{userId}/deduct",
                    request);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Reserved {amount} FLOG for user {userId}");
                    return true;
                }

                var error = await response.Content.ReadAsStringAsync();
                _logger.LogWarning($"Failed to reserve FLOG for user {userId}: {error}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error reserving FLOG for user {userId}");
                return false;
            }
        }

        public async Task<bool> RefundFlogAsync(string userId, decimal amount, string description)
        {
            try
            {
                var request = new
                {
                    amount = amount,
                    transactionType = "BidRefund",
                    description = description
                };

                var response = await _httpClient.PostAsJsonAsync(
                    $"api/wallet/{userId}/add",
                    request);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Refunded {amount} FLOG to user {userId}");
                    return true;
                }

                var error = await response.Content.ReadAsStringAsync();
                _logger.LogWarning($"Failed to refund FLOG for user {userId}: {error}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error refunding FLOG for user {userId}");
                return false;
            }
        }

        public async Task<decimal> GetBalanceAsync(string userId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"api/wallet/{userId}/balance");

                if (response.IsSuccessStatusCode)
                {
                    var balance = await response.Content.ReadFromJsonAsync<decimal>();
                    return balance;
                }

                _logger.LogWarning($"Failed to get balance for user {userId}");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting balance for user {userId}");
                return 0;
            }
        }
    }
}
