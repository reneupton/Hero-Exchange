using GamificationService.DTOs;
using GamificationService.Services;
using Microsoft.AspNetCore.Mvc;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityFeedController : ControllerBase
{
    private readonly ActivityFeedService _activityFeedService;

    public ActivityFeedController(ActivityFeedService activityFeedService)
    {
        _activityFeedService = activityFeedService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActivityFeedDto>>> GetRecentActivity([FromQuery] int limit = 50)
    {
        var activities = await _activityFeedService.GetRecentActivityAsync(limit);

        var dtos = activities.Select(a => new ActivityFeedDto
        {
            Id = a.Id,
            Type = a.Type.ToString(),
            UserId = a.UserId,
            Username = a.Username,
            Message = a.Message,
            Metadata = a.Metadata,
            CreatedAt = a.CreatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<List<ActivityFeedDto>>> GetUserActivity(string userId, [FromQuery] int limit = 50)
    {
        var activities = await _activityFeedService.GetUserActivityAsync(userId, limit);

        var dtos = activities.Select(a => new ActivityFeedDto
        {
            Id = a.Id,
            Type = a.Type.ToString(),
            UserId = a.UserId,
            Username = a.Username,
            Message = a.Message,
            Metadata = a.Metadata,
            CreatedAt = a.CreatedAt
        }).ToList();

        return Ok(dtos);
    }
}
