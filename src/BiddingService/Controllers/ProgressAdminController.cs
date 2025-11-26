using BiddingService.DTOs;
using BiddingService.Models;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace BiddingService.Controllers
{
    [ApiController]
    [Route("api/admin/progress")]
    public class ProgressAdminController : ControllerBase
    {
        private readonly IPublishEndpoint _publishEndpoint;

        public ProgressAdminController(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserProgress>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var skip = Math.Max(0, (page - 1) * pageSize);
            var users = await DB.Find<UserProgress>()
                .Skip(skip)
                .Limit(pageSize)
                .ExecuteAsync();
            return Ok(users);
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
            await _publishEndpoint.Publish(new Contracts.UserProgressAdjusted
            {
                Username = username,
                BalanceDelta = dto.Delta,
                UpdatedBy = "admin"
            });
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
            await _publishEndpoint.Publish(new Contracts.UserProgressAdjusted
            {
                Username = username,
                XpDelta = dto.Delta,
                Level = dto.Level,
                UpdatedBy = "admin"
            });
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
                await _publishEndpoint.Publish(new Contracts.UserAvatarUpdated
                {
                    Username = username,
                    AvatarUrl = dto.AvatarUrl,
                    UpdatedBy = "admin"
                });
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
            await _publishEndpoint.Publish(new Contracts.UserCooldownReset
            {
                Username = username,
                UpdatedBy = "admin"
            });
            return Ok(user);
        }
    }
}
