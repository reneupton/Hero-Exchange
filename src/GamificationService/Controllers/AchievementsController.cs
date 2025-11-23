using GamificationService.DTOs;
using GamificationService.Services;
using Microsoft.AspNetCore.Mvc;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AchievementsController : ControllerBase
{
    private readonly AchievementService _achievementService;

    public AchievementsController(AchievementService achievementService)
    {
        _achievementService = achievementService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AchievementDto>>> GetAllAchievements()
    {
        var achievements = await _achievementService.GetAllAchievementsAsync();

        var dtos = achievements.Select(a => new AchievementDto
        {
            Id = a.Id,
            AchievementId = a.AchievementId,
            Name = a.Name,
            Description = a.Description,
            Icon = a.Icon,
            XPReward = a.XPReward,
            FlogReward = a.FlogReward,
            Category = a.Category.ToString(),
            Rarity = a.Rarity.ToString()
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<List<UserAchievementDto>>> GetUserAchievements(string userId)
    {
        var userAchievements = await _achievementService.GetUserAchievementsAsync(userId);

        var dtos = userAchievements.Select(ua => new UserAchievementDto
        {
            Achievement = new AchievementDto
            {
                Id = ua.Achievement.Id,
                AchievementId = ua.Achievement.AchievementId,
                Name = ua.Achievement.Name,
                Description = ua.Achievement.Description,
                Icon = ua.Achievement.Icon,
                XPReward = ua.Achievement.XPReward,
                FlogReward = ua.Achievement.FlogReward,
                Category = ua.Achievement.Category.ToString(),
                Rarity = ua.Achievement.Rarity.ToString()
            },
            UnlockedAt = ua.UnlockedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("{userId}/unlock")]
    public async Task<ActionResult> UnlockAchievement(string userId, [FromBody] UnlockAchievementRequest request)
    {
        var result = await _achievementService.UnlockAchievementAsync(userId, request.AchievementId);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new
        {
            message = result.Message,
            achievement = new AchievementDto
            {
                Id = result.Achievement.Id,
                AchievementId = result.Achievement.AchievementId,
                Name = result.Achievement.Name,
                Description = result.Achievement.Description,
                Icon = result.Achievement.Icon,
                XPReward = result.Achievement.XPReward,
                FlogReward = result.Achievement.FlogReward,
                Category = result.Achievement.Category.ToString(),
                Rarity = result.Achievement.Rarity.ToString()
            },
            flogRewarded = result.FlogRewarded,
            xpRewarded = result.XPRewarded,
            leveledUp = result.LeveledUp,
            newLevel = result.NewLevel
        });
    }

    [HttpPost("seed")]
    public async Task<ActionResult> SeedAchievements()
    {
        await _achievementService.SeedAchievementsAsync();
        return Ok(new { message = "Achievements seeded successfully" });
    }
}
