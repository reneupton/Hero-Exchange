// Admin-only endpoints for inspecting and mutating user progress, balances, avatars, cooldowns, and inventories.
#nullable enable

using BiddingService.DTOs;
using BiddingService.Models;
using BiddingService.Services;
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

        /// <summary>
        /// Creates the admin controller for progress operations.
        /// </summary>
        /// <param name="publishEndpoint">Bus publisher for progress-related events.</param>
        public ProgressAdminController(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        /// <summary>
        /// Finds a user by ID or username field.
        /// </summary>
        private async Task<UserProgress?> FindUser(string identifier)
        {
            // try by ID
            var byId = await DB.Find<UserProgress>().OneAsync(identifier);
            if (byId != null) return byId;

            // fallback by username field
            return await DB.Find<UserProgress>()
                .Match(u => u.Username == identifier)
                .ExecuteFirstAsync();
        }

        [HttpGet("users")]
        /// <summary>
        /// Lists users with paging.
        /// </summary>
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
        /// <summary>
        /// Fetches a single user by id/username.
        /// </summary>
        public async Task<ActionResult<UserProgress>> GetUser(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("users/{username}/balance")]
        /// <summary>
        /// Adjusts coin balance and publishes an adjustment event.
        /// </summary>
        public async Task<ActionResult<UserProgress>> AdjustBalance(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
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
        /// <summary>
        /// Adjusts XP/Level and publishes an adjustment event.
        /// </summary>
        public async Task<ActionResult<UserProgress>> AdjustXp(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
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
        /// <summary>
        /// Sets avatar URL and emits an avatar updated event.
        /// </summary>
        public async Task<ActionResult<UserProgress>> SetAvatar(string username, [FromBody] AdminAdjustDto dto)
        {
            var user = await FindUser(username);
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
        /// <summary>
        /// Resets daily/mystery cooldowns for a user.
        /// </summary>
        public async Task<ActionResult<UserProgress>> ResetCooldowns(string username)
        {
            var user = await FindUser(username);
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

        [HttpGet("users/{username}/heroes")]
        /// <summary>
        /// Lists all heroes owned by the user.
        /// </summary>
        public async Task<ActionResult<List<OwnedHero>>> GetHeroes(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            user.OwnedHeroes ??= new List<OwnedHero>();
            return Ok(user.OwnedHeroes);
        }

        [HttpPost("users/{username}/heroes")]
        /// <summary>
        /// Adds a hero variant to the user's inventory.
        /// </summary>
        public async Task<ActionResult> AddHero(string username, [FromBody] AdminHeroRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.HeroId) || string.IsNullOrWhiteSpace(request.Rarity))
            {
                return BadRequest(new { message = "heroId and rarity are required" });
            }

            var user = await FindUser(username);
            if (user == null) return NotFound();

            var variant = HeroCatalog.GetVariant(request.HeroId, request.Rarity);
            if (variant == null) return BadRequest(new { message = "Unknown heroId or rarity" });

            user.OwnedHeroes ??= new List<OwnedHero>();
            user.OwnedHeroes.Add(new OwnedHero
            {
                HeroId = variant.HeroId,
                VariantId = variant.VariantId,
                Name = variant.Name,
                Discipline = variant.Discipline,
                Rarity = variant.Rarity,
                Strength = variant.Strength,
                Intellect = variant.Intellect,
                Vitality = variant.Vitality,
                Agility = variant.Agility,
                CardImage = variant.CardImage,
                AcquiredAt = DateTime.UtcNow
            });

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }

        [HttpDelete("users/{username}/heroes/{variantId}")]
        /// <summary>
        /// Removes a hero variant from the user's inventory.
        /// </summary>
        public async Task<ActionResult> RemoveHero(string username, string variantId)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();
            if (string.IsNullOrWhiteSpace(variantId)) return BadRequest(new { message = "variantId required" });

            user.OwnedHeroes ??= new List<OwnedHero>();
            var before = user.OwnedHeroes.Count;
            user.OwnedHeroes = user.OwnedHeroes.Where(h => !h.VariantId.Equals(variantId, StringComparison.OrdinalIgnoreCase)).ToList();

            if (user.OwnedHeroes.Count == before) return NotFound(new { message = "hero not found on user" });

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }

        [HttpPost("migrate-avatars")]
        /// <summary>
        /// One-time helper to migrate legacy dicebear avatar URLs.
        /// </summary>
        public async Task<ActionResult> MigrateAvatars()
        {
            var users = await DB.Find<UserProgress>().ExecuteAsync();
            var updated = 0;

            foreach (var user in users)
            {
                if (string.IsNullOrEmpty(user.AvatarUrl)) continue;
                if (!user.AvatarUrl.Contains("dicebear.com")) continue;
                if (!user.AvatarUrl.Contains("/thumbs/")) continue;

                // Convert thumbs -> adventurer
                user.AvatarUrl = user.AvatarUrl.Replace("/thumbs/", "/adventurer/");
                await user.SaveAsync();
                updated++;
            }

            return Ok(new { message = $"Migrated {updated} user avatars from thumbs to adventurer style" });
        }

        [HttpPost("users/{username}/starter-pack")]
        /// <summary>
        /// Grants a fixed starter pack if not already owned.
        /// </summary>
        public async Task<ActionResult<List<OwnedHero>>> GrantStarterPack(string username)
        {
            var user = await FindUser(username);
            if (user == null) return NotFound();

            user.OwnedHeroes ??= new List<OwnedHero>();

            var pack = new (string heroId, string rarity)[]
            {
                ("elyra", "Epic"),
                ("grum", "Legendary"),
                ("dresh", "Common"),
                ("sigrun", "Rare")
            };

            foreach (var (heroId, rarity) in pack)
            {
                var variant = HeroCatalog.GetVariant(heroId, rarity);
                if (variant == null) continue;
                if (user.OwnedHeroes.Any(h => h.VariantId.Equals(variant.VariantId, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                user.OwnedHeroes.Add(new OwnedHero
                {
                    HeroId = variant.HeroId,
                    VariantId = variant.VariantId,
                    Name = variant.Name,
                    Discipline = variant.Discipline,
                    Rarity = variant.Rarity,
                    Strength = variant.Strength,
                    Intellect = variant.Intellect,
                    Vitality = variant.Vitality,
                    Agility = variant.Agility,
                    CardImage = variant.CardImage,
                    AcquiredAt = DateTime.UtcNow
                });
                user.RecentPurchases ??= new List<string>();
                user.RecentPurchases.Insert(0, variant.VariantId);
            }

            await user.SaveAsync();
            return Ok(user.OwnedHeroes);
        }
    }
}
