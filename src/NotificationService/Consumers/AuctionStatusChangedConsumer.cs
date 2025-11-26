using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Consumers;

public class AuctionStatusChangedConsumer : IConsumer<AuctionStatusChanged>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public AuctionStatusChangedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<AuctionStatusChanged> context)
    {
        Console.WriteLine("---> auction status changed message received");
        await _hubContext.Clients.All.SendAsync("AuctionStatusChanged", context.Message);
    }
}
