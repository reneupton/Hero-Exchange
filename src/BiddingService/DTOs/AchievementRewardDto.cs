namespace BiddingService.DTOs;

/// <summary>
/// Request payload for claiming an achievement hero reward with a specific rarity.
/// </summary>
public class AchievementRewardDto
{
    public string Rarity { get; set; } = "";
}
