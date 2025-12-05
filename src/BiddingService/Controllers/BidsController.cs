// Handles bid placement and retrieval for a single auction.
// Uses MongoDB.Entities for persistence and publishes bid events to the bus.
using AutoMapper;
using BiddingService.Models;
using BiddingService.Services;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Entities;

namespace BiddingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidsController : ControllerBase
    {
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly GrpcAuctionClient grpcAuctionClient;
        private readonly ProgressService progressService;


        private IMapper _mapper { get; }


        /// <summary>
        /// Creates a controller capable of placing bids, mapping DTOs, publishing events, and awarding progress.
        /// </summary>
        /// <param name="mapper">Automapper instance for model to DTO conversion.</param>
        /// <param name="publishEndpoint">MassTransit publish endpoint for emitting bid events.</param>
        /// <param name="grpcAuctionClient">gRPC client to resolve auctions that are not locally cached.</param>
        /// <param name="progressService">Service for updating user progress based on bid activity.</param>
        public BidsController(IMapper mapper, IPublishEndpoint publishEndpoint, GrpcAuctionClient grpcAuctionClient, ProgressService progressService)
        {
            _mapper = mapper;
            _publishEndpoint = publishEndpoint;
            this.grpcAuctionClient = grpcAuctionClient;
            this.progressService = progressService;

        }

        [Authorize]
        [HttpPost]
        /// <summary>
        /// Places a bid on an auction, validates eligibility and timing, persists the bid, and raises a domain event.
        /// </summary>
        /// <param name="auctionId">Auction identifier the bid targets.</param>
        /// <param name="amount">Bid amount in in-game currency.</param>
        /// <returns>Created bid as a DTO or a validation error.</returns>
        public async Task<ActionResult<BidDto>> PlaceBid(string auctionId, int amount)
        {

            var auction = await DB.Find<Auction>().OneAsync(auctionId);

            if (auction == null)
            {
                auction = grpcAuctionClient.GetAuction(auctionId);

                if (auction == null) return BadRequest("Cannot accept bids on this auction at this time");
            }

            if (auction.Finished || auction.AuctionEnd <= DateTime.UtcNow)
            {
                return BadRequest("Auction has ended");
            }

            if (auction.Seller == User.Identity.Name)
            {
                return BadRequest("You cannot bid on your own auction");
            }

            var bid = new Bid
            {
                Amount = amount,
                AuctionId = auctionId,
                Bidder = User.Identity.Name
            };

            var highBid = await DB.Find<Bid>()
                    .Match(a => a.AuctionId == auctionId)
                    .Sort(b => b.Descending(x => x.Amount))
                    .ExecuteFirstAsync();
            // If this is the highest bid so far (or the first), mark as accepted. Otherwise, mark as too low.
            if ((highBid != null && amount > highBid.Amount) || highBid == null)
            {
                bid.BidStatus = amount > auction.ReservePrice
                    ? BidStatus.Accepted
                    : BidStatus.AcceptedBelowReserve;
            }
            else if (highBid != null && bid.Amount <= highBid.Amount)
            {
                bid.BidStatus = BidStatus.TooLow;
            }

            await DB.SaveAsync(bid);

            await _publishEndpoint.Publish(_mapper.Map<BidPlaced>(bid));
            await progressService.AwardBidAsync(User.Identity.Name, amount, auctionId);

            return Ok(_mapper.Map<BidDto>(bid));
        }

        [HttpGet("{auctionId}")]
        /// <summary>
        /// Returns all bids for a given auction ordered by bid time descending.
        /// </summary>
        /// <param name="auctionId">Auction identifier.</param>
        /// <returns>List of bid DTOs.</returns>
        public async Task<ActionResult<List<BidDto>>> GetBidsForAuction(string auctionId)
        {
            var bids = await DB.Find<Bid>()
            .Match(a => a.AuctionId == auctionId)
            .Sort(b => b.Descending(a => a.BidTime))
            .ExecuteAsync();

            return bids.Select(_mapper.Map<BidDto>).ToList();
        }
    }

}
