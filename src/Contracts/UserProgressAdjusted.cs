namespace Contracts;

public class UserProgressAdjusted
{
    public string Username { get; set; }
    public int? BalanceDelta { get; set; }
    public int? XpDelta { get; set; }
    public int? Level { get; set; }
    public string Reason { get; set; }
    public string UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
