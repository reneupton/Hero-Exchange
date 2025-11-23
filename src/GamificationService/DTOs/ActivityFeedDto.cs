namespace GamificationService.DTOs;

public class ActivityFeedDto
{
    public Guid Id { get; set; }
    public string Type { get; set; }
    public string UserId { get; set; }
    public string Username { get; set; }
    public string Message { get; set; }
    public string Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}
