namespace GamificationService.Entities;

public static class DemoSettings
{
    // Starting balances and bonuses
    public const decimal STARTING_BALANCE = 1000m;
    public const decimal DAILY_LOGIN_BONUS = 50m;
    public const decimal LISTING_REWARD = 10m;
    public const decimal PURCHASE_XP_REWARD = 50;
    public const decimal SALE_XP_REWARD = 100;
    public const decimal PERFECT_RATING_BONUS = 100m;

    // Marketplace fees
    public const decimal MARKETPLACE_FEE_PERCENTAGE = 0.05m; // 5%

    // Fake exchange rates for display only
    public const decimal FLOG_TO_GBP = 0.88m;
    public const decimal FLOG_TO_USD = 1.10m;
    public const decimal FLOG_TO_EUR = 1.02m;

    // Quest rewards
    public const int DAILY_QUEST_FLOG_MIN = 50;
    public const int DAILY_QUEST_FLOG_MAX = 200;
    public const int DAILY_QUEST_XP_MIN = 25;
    public const int DAILY_QUEST_XP_MAX = 100;

    // Achievement rewards
    public const int COMMON_ACHIEVEMENT_FLOG = 100;
    public const int RARE_ACHIEVEMENT_FLOG = 250;
    public const int EPIC_ACHIEVEMENT_FLOG = 500;
    public const int LEGENDARY_ACHIEVEMENT_FLOG = 1000;

    // Mystery box prices
    public const decimal BRONZE_BOX_PRICE = 100m;
    public const decimal SILVER_BOX_PRICE = 250m;
    public const decimal GOLD_BOX_PRICE = 500m;

    // Level system
    public const int MAX_LEVEL = 50;
    public const int BASE_XP_FOR_LEVEL = 100;
    public const int XP_MULTIPLIER_PER_LEVEL = 50;
}
