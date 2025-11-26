using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Consumers;

public class UserAvatarUpdatedConsumer : IConsumer<UserAvatarUpdated>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public UserAvatarUpdatedConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<UserAvatarUpdated> context)
    {
        Console.WriteLine("---> user avatar updated message received");
        await _hubContext.Clients.All.SendAsync("UserAvatarUpdated", context.Message);
    }
}
