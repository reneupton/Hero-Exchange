namespace GamificationService.Entities;

public class UserInventory
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string ItemId { get; set; }
    public string ItemName { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string Rarity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime AcquiredAt { get; set; }
    public string Source { get; set; } // "Purchase", "MysteryBox", "Achievement", etc.
}
