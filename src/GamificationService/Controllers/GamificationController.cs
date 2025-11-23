using GamificationService.DTOs;
using GamificationService.Services;
using Microsoft.AspNetCore.Mvc;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamificationController : ControllerBase
{
    private readonly UserGamificationService _gamificationService;

    public GamificationController(UserGamificationService gamificationService)
    {
        _gamificationService = gamificationService;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserGamificationDto>> GetUserGamification(string userId)
    {
        var stats = await _gamificationService.GetUserStatsAsync(userId);

        var dto = new UserGamificationDto
        {
            UserId = userId,
            Level = stats.Level,
            XP = stats.XP,
            XPForNextLevel = stats.XPForNextLevel,
            Title = stats.Title,
            StreakDays = stats.StreakDays,
            AchievementCount = stats.AchievementCount,
            CompletedQuestsCount = stats.CompletedQuestsCount
        };

        return Ok(dto);
    }

    [HttpPost("{userId}/xp")]
    public async Task<ActionResult> AddExperience(string userId, [FromBody] AddExperienceRequest request)
    {
        var result = await _gamificationService.AddExperienceAsync(userId, request.Amount);

        return Ok(new
        {
            leveledUp = result.LeveledUp,
            oldLevel = result.OldLevel,
            newLevel = result.NewLevel,
            currentXP = result.CurrentXP,
            xpForNextLevel = result.XPForNextLevel,
            newTitle = result.NewTitle
        });
    }

    [HttpPost("{userId}/login")]
    public async Task<ActionResult> UpdateLoginStreak(string userId)
    {
        await _gamificationService.UpdateLoginStreakAsync(userId);
        return Ok(new { message = "Login streak updated" });
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<List<LeaderboardDto>>> GetLeaderboard([FromQuery] int limit = 100)
    {
        var leaderboard = await _gamificationService.GetLeaderboardAsync(limit);

        var dtos = leaderboard.Select(entry => new LeaderboardDto
        {
            Rank = entry.Rank,
            UserId = entry.UserId,
            Username = entry.UserId, // TODO: Fetch actual username
            Level = entry.Level,
            XP = entry.XP,
            Title = entry.Title
        }).ToList();

        return Ok(dtos);
    }
}
