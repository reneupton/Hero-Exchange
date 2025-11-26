namespace Contracts;

public class AuctionStatusChanged
{
    public string AuctionId { get; set; }
    public string Status { get; set; }
    public string ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
