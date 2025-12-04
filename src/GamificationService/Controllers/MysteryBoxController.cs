using Microsoft.AspNetCore.Mvc;
using GamificationService.Services;

namespace GamificationService.Controllers;

[ApiController]
[Route("api/mysteryboxes")]
public class MysteryBoxController : ControllerBase
{
    private readonly MysteryBoxService _mysteryBoxService;

    public MysteryBoxController(MysteryBoxService mysteryBoxService)
    {
        _mysteryBoxService = mysteryBoxService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMysteryBoxes()
    {
        var boxes = await _mysteryBoxService.GetAllMysteryBoxesAsync();
        return Ok(boxes);
    }

    [HttpPost("{userId}/open")]
    public async Task<IActionResult> OpenMysteryBox(string userId, [FromBody] OpenMysteryBoxRequest request)
    {
        try
        {
            var result = await _mysteryBoxService.OpenMysteryBoxAsync(userId, request.BoxId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{userId}/history")]
    public async Task<IActionResult> GetUserMysteryBoxHistory(string userId, [FromQuery] int limit = 20)
    {
        var history = await _mysteryBoxService.GetUserMysteryBoxHistoryAsync(userId, limit);
        return Ok(history);
    }
}

public class OpenMysteryBoxRequest
{
    public string BoxId { get; set; }
}
