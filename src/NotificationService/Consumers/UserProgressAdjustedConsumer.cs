using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Consumers;

public class UserProgressAdjustedConsumer : IConsumer<UserProgressAdjusted>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public UserProgressAdjustedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<UserProgressAdjusted> context)
    {
        Console.WriteLine("---> user progress adjusted message received");
        await _hubContext.Clients.All.SendAsync("UserProgressAdjusted", context.Message);
    }
}
