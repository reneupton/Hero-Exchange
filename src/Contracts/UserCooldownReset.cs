namespace Contracts;

public class UserCooldownReset
{
    public string Username { get; set; }
    public string UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
