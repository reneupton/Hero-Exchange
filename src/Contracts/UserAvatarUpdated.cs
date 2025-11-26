namespace Contracts;

public class UserAvatarUpdated
{
    public string Username { get; set; }
    public string AvatarUrl { get; set; }
    public string UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
