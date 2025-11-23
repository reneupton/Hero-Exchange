namespace Contracts;

public enum ItemRarity
{
    Common = 0,
    Uncommon = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4
}

public static class ItemRarityHelper
{
    public static string GetRarityColor(ItemRarity rarity)
    {
        return rarity switch
        {
            ItemRarity.Common => "#9CA3AF",      // Gray
            ItemRarity.Uncommon => "#10B981",    // Green
            ItemRarity.Rare => "#3B82F6",        // Blue
            ItemRarity.Epic => "#A855F7",        // Purple
            ItemRarity.Legendary => "#F97316",   // Orange
            _ => "#9CA3AF"
        };
    }

    public static string GetRarityName(ItemRarity rarity)
    {
        return rarity.ToString();
    }

    public static double GetRarityDropRate(ItemRarity rarity)
    {
        return rarity switch
        {
            ItemRarity.Common => 0.70,      // 70%
            ItemRarity.Uncommon => 0.20,    // 20%
            ItemRarity.Rare => 0.08,        // 8%
            ItemRarity.Epic => 0.015,       // 1.5%
            ItemRarity.Legendary => 0.005,  // 0.5%
            _ => 0.70
        };
    }
}
