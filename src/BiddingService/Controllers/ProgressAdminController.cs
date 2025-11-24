using BiddingService.DTOs;
using BiddingService.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace BiddingService.Controllers
{
    [ApiController]
    [Route("api/admin/progress")]
    public class ProgressAdminController : ControllerBase
    {
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserProgress>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var users = await DB.PagedAsync<UserProgress>(page, pageSize);
            return Ok(users.Results);
        }

        [HttpGet("users/{username}")]
        public async Task<ActionResult<UserProgress>> GetUser(string username)
        {
            var user = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("users/{username}/balance")]
        public async Task<ActionResult<UserProgress>> AdjustBalance(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();
            if (user == null) return NotFound();
            if (dto.Delta.HasValue) user.FlogBalance += dto.Delta.Value;
            await user.SaveAsync();
            return Ok(user);
        }

        [HttpPost("users/{username}/xp")]
        public async Task<ActionResult<UserProgress>> AdjustXp(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();
            if (user == null) return NotFound();
            if (dto.Delta.HasValue) user.Experience += dto.Delta.Value;
            if (dto.Level.HasValue) user.Level = dto.Level.Value;
            await user.SaveAsync();
            return Ok(user);
        }

        [HttpPost("users/{username}/avatar")]
        public async Task<ActionResult<UserProgress>> SetAvatar(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();
            if (user == null) return NotFound();
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl;
                await user.SaveAsync();
            }
            return Ok(user);
        }

        [HttpPost("users/{username}/reset-cooldowns")]
        public async Task<ActionResult<UserProgress>> ResetCooldowns(string username)
        {
            var user = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();
            if (user == null) return NotFound();
            user.LastDailyReward = null;
            user.LastMysteryRewardAt = null;
            user.LastMysteryRewardCoins = null;
            user.LastMysteryRewardXp = null;
            await user.SaveAsync();
            return Ok(user);
        }
    }
}
