using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Consumers;

public class UserCooldownResetConsumer : IConsumer<UserCooldownReset>
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public UserCooldownResetConsumer(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Consume(ConsumeContext<UserCooldownReset> context)
    {
        Console.WriteLine("---> user cooldown reset message received");
        await _hubContext.Clients.All.SendAsync("UserCooldownReset", context.Message);
    }
}
