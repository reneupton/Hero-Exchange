namespace BiddingService.DTOs;

/// <summary>
/// Payload for claiming an achievement by ID.
/// </summary>
public class ClaimAchievementDto
{
    public string AchievementId { get; set; } = string.Empty;
}
