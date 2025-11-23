using GamificationService.DTOs;
using GamificationService.Services;
using Microsoft.AspNetCore.Mvc;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestsController : ControllerBase
{
    private readonly QuestService _questService;

    public QuestsController(QuestService questService)
    {
        _questService = questService;
    }

    [HttpGet("daily")]
    public async Task<ActionResult<List<QuestDto>>> GetDailyQuests()
    {
        var quests = await _questService.GetDailyQuestsAsync();

        var dtos = quests.Select(q => new QuestDto
        {
            Id = q.Id,
            Name = q.Name,
            Description = q.Description,
            Type = q.Type.ToString(),
            Target = q.Target,
            FlogReward = q.FlogReward,
            XPReward = q.XPReward
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{userId}/progress")]
    public async Task<ActionResult<List<QuestProgressDto>>> GetUserQuestProgress(string userId)
    {
        var questProgress = await _questService.GetUserQuestProgressAsync(userId);

        var dtos = questProgress.Select(qp => new QuestProgressDto
        {
            Id = qp.Id,
            Quest = new QuestDto
            {
                Id = qp.Quest.Id,
                Name = qp.Quest.Name,
                Description = qp.Quest.Description,
                Type = qp.Quest.Type.ToString(),
                Target = qp.Quest.Target,
                FlogReward = qp.Quest.FlogReward,
                XPReward = qp.Quest.XPReward
            },
            Progress = qp.Progress,
            Target = qp.Quest.Target,
            Completed = qp.Completed,
            Claimed = qp.Claimed,
            CompletedAt = qp.CompletedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("{userId}/progress")]
    public async Task<ActionResult> UpdateQuestProgress(string userId, [FromBody] UpdateQuestProgressRequest request)
    {
        var success = await _questService.UpdateQuestProgressAsync(userId, request.QuestType, request.IncrementAmount);

        if (!success)
        {
            return BadRequest(new { message = "Failed to update quest progress" });
        }

        return Ok(new { message = "Quest progress updated" });
    }

    [HttpPost("{userId}/claim")]
    public async Task<ActionResult> ClaimQuestReward(string userId, [FromBody] ClaimQuestRewardRequest request)
    {
        var result = await _questService.ClaimQuestRewardAsync(userId, request.QuestProgressId);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new
        {
            message = result.Message,
            flogRewarded = result.FlogRewarded,
            xpRewarded = result.XPRewarded,
            leveledUp = result.LeveledUp,
            newLevel = result.NewLevel
        });
    }
}
