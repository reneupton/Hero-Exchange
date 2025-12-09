// SignalR hub for broadcasting real-time auction/bid notifications to clients.
using Microsoft.AspNetCore.SignalR;

namespace NotificationService;

public class NotificationHub : Hub
{
    private static int _connectionCount = 0;
    private static readonly object _lock = new();

    public static int ConnectionCount
    {
        get { lock (_lock) return _connectionCount; }
    }

    public override Task OnConnectedAsync()
    {
        lock (_lock) _connectionCount++;
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        lock (_lock) _connectionCount = Math.Max(0, _connectionCount - 1);
        return base.OnDisconnectedAsync(exception);
    }
}
