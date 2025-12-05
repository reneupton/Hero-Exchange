// Exposes player progress endpoints (profile, awards, leaderboard, mystery box, achievements) for authenticated users.
using BiddingService.DTOs;
using BiddingService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BiddingService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly ProgressService progressService;

    /// <summary>
    /// Creates a controller for retrieving and updating the authenticated user's progression.
    /// </summary>
    /// <param name="progressService">Domain service handling progression logic.</param>
    public ProgressController(ProgressService progressService)
    {
        this.progressService = progressService;
    }

    [Authorize]
    [HttpGet("me")]
    /// <summary>
    /// Gets the current user's progression snapshot.
    /// </summary>
    /// <returns>Progress DTO for the authenticated user.</returns>
    public async Task<ActionResult<ProgressDto>> GetMine()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.GetProfile(username);
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("award")]
    /// <summary>
    /// Awards progress for a specific action (bid/list/sale/purchase/daily-login).
    /// </summary>
    /// <param name="award">Action and amount payload.</param>
    /// <returns>Updated progress DTO.</returns>
    public async Task<ActionResult<ProgressDto>> Award(AwardRequestDto award)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.AwardAsync(username, award.Action, award.Amount);
        return Ok(profile);
    }

    [HttpGet("leaderboard")]
    /// <summary>
    /// Returns the top users by hero power/level.
    /// </summary>
    public async Task<ActionResult<List<ProgressDto>>> GetLeaderboard()
    {
        var leaderboard = await progressService.GetLeaderboard();
        return Ok(leaderboard);
    }

    [Authorize]
    [HttpPost("mystery")]
    /// <summary>
    /// Opens the daily/24h-gated mystery reward for the current user.
    /// </summary>
    public async Task<ActionResult<SummonResultDto>> OpenMystery()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

        var profile = await progressService.OpenMystery(username);
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("claim-achievement")]
    /// <summary>
    /// Marks an achievement as claimed for the current user.
    /// </summary>
    /// <param name="request">Achievement claim payload.</param>
    /// <returns>Updated progress DTO.</returns>
    public async Task<ActionResult<ProgressDto>> ClaimAchievement([FromBody] ClaimAchievementDto request)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();
        if (string.IsNullOrWhiteSpace(request?.AchievementId)) return BadRequest("achievementId is required");

        var profile = await progressService.ClaimAchievement(username, request.AchievementId);
        return Ok(profile);
    }
}
