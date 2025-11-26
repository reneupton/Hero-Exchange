using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Controllers
{
    [ApiController]
    [Route("api/admin/auctions")]
    public class AdminAuctionsController : ControllerBase
    {
        private readonly AuctionDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPublishEndpoint _publishEndpoint;

        public AdminAuctionsController(AuctionDbContext context, IMapper mapper, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _mapper = mapper;
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuctionDto>>> GetAuctions([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string status = null)
        {
            var query = _context.Auctions.Include(a => a.Item).AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Status>(status, true, out var s))
            {
                query = query.Where(a => a.Status == s);
            }

            var skip = Math.Max(0, (page - 1) * pageSize);
            var data = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ProjectTo<AuctionDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AuctionDto>> GetAuction(Guid id)
        {
            var auction = await _context.Auctions.Include(a => a.Item)
                .ProjectTo<AuctionDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (auction == null) return NotFound();
            return auction;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AuctionDto>> UpdateAuction(Guid id, [FromBody] UpdateAuctionAdminDto dto)
        {
            var auction = await _context.Auctions.Include(a => a.Item).FirstOrDefaultAsync(a => a.Id == id);
            if (auction == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Title)) auction.Item.Title = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Brand)) auction.Item.Brand = dto.Brand;
            if (!string.IsNullOrWhiteSpace(dto.Category)) auction.Item.Category = dto.Category;
            if (!string.IsNullOrWhiteSpace(dto.Variant)) auction.Item.Variant = dto.Variant;
            if (!string.IsNullOrWhiteSpace(dto.Condition)) auction.Item.Condition = dto.Condition;
            if (!string.IsNullOrWhiteSpace(dto.Colorway)) auction.Item.Colorway = dto.Colorway;
            if (dto.ReleaseYear.HasValue) auction.Item.ReleaseYear = dto.ReleaseYear.Value;
            if (!string.IsNullOrWhiteSpace(dto.Specs)) auction.Item.Specs = dto.Specs;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) auction.Item.ImageUrl = dto.ImageUrl;
            if (dto.ReservePrice.HasValue) auction.ReservePrice = dto.ReservePrice.Value;
            if (dto.AuctionEnd.HasValue) auction.AuctionEnd = dto.AuctionEnd.Value;
            var statusChanged = false;
            if (dto.Status.HasValue && auction.Status != dto.Status.Value)
            {
                auction.Status = dto.Status.Value;
                statusChanged = true;
            }

            await _context.SaveChangesAsync();

            var result = _mapper.Map<AuctionDto>(auction);
            if (statusChanged)
            {
                await _publishEndpoint.Publish(new Contracts.AuctionStatusChanged
                {
                    AuctionId = auction.Id.ToString(),
                    Status = auction.Status.ToString(),
                    ChangedBy = "admin"
                });
            }
            return Ok(result);
        }

        [HttpPost("{id}/finish")]
        public async Task<ActionResult> FinishAuction(Guid id)
        {
            var auction = await _context.Auctions.FirstOrDefaultAsync(a => a.Id == id);
            if (auction == null) return NotFound();
            auction.Status = Status.Finished;
            await _context.SaveChangesAsync();
            await _publishEndpoint.Publish(new Contracts.AuctionStatusChanged
            {
                AuctionId = auction.Id.ToString(),
                Status = auction.Status.ToString(),
                ChangedBy = "admin"
            });
            return NoContent();
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelAuction(Guid id)
        {
            var auction = await _context.Auctions.FirstOrDefaultAsync(a => a.Id == id);
            if (auction == null) return NotFound();
            auction.Status = Status.ReserveNotMet;
            await _context.SaveChangesAsync();
            await _publishEndpoint.Publish(new Contracts.AuctionStatusChanged
            {
                AuctionId = auction.Id.ToString(),
                Status = auction.Status.ToString(),
                ChangedBy = "admin"
            });
            return NoContent();
        }
    }
}
