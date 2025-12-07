using BiddingService.Models;

namespace BiddingService.Services;

/// <summary>
/// Central catalogue of hero variants with rarity-scaled stats for seeding and rewards.
/// </summary>
public static class HeroCatalog
{
    private static readonly Dictionary<string, HeroBase> heroes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["veyla"] = new HeroBase("veyla", "Veyla the Shadow Lich", "Necromancer", 42, 95, 68, 54, "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png"),
        ["elyra"] = new HeroBase("elyra", "Elyra Nocturne", "Oracle", 34, 88, 60, 58, "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png"),
        ["morr"] = new HeroBase("morr", "Morr Wispblade", "Reaper", 68, 64, 58, 72, "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png"),
        ["sigrun"] = new HeroBase("sigrun", "Sigrun Dawnbreak", "Valkyrie", 90, 48, 82, 70, "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png"),
        ["caelys"] = new HeroBase("caelys", "Caelys Ember-Crusader", "Warrior", 82, 32, 78, 52, "/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png"),
        ["torhild"] = new HeroBase("torhild", "Torhild Embercore", "Guardian", 88, 28, 92, 28, "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png"),
        ["frostech"] = new HeroBase("frostech", "Frostech Ward", "Guardian", 74, 35, 86, 32, "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png"),
        ["grum"] = new HeroBase("grum", "Grum Ironhorn", "Berserker", 96, 18, 88, 44, "/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png"),
        ["astrael"] = new HeroBase("astrael", "Astrael Fallen", "Reaper", 76, 74, 72, 66, "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angel_1/card/frame_0.png"),
        ["dresh"] = new HeroBase("dresh", "Dresh Wildarrow", "Ranger", 58, 24, 52, 68, "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png"),
    };

    private static readonly Dictionary<string, double> rarityScale = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Common"] = 0.7,
        ["Rare"] = 1.0,
        ["Epic"] = 1.25,
        ["Legendary"] = 1.5
    };

    public static IReadOnlyList<string> Rarities => rarityScale.Keys.ToList();

    /// <summary>
    /// All variants across heroes and rarities.
    /// </summary>
    public static IReadOnlyList<OwnedHero> AllVariants { get; } = BuildAllVariants();

    /// <summary>
    /// Returns a specific variant by hero id and rarity; null if invalid.
    /// </summary>
    public static OwnedHero? GetVariant(string heroId, string rarity)
    {
        var match = AllVariants.FirstOrDefault(v =>
            v.HeroId.Equals(heroId, StringComparison.OrdinalIgnoreCase) &&
            v.Rarity.Equals(rarity, StringComparison.OrdinalIgnoreCase));
        return match == null ? null : CloneVariant(match);
    }

    /// <summary>
    /// Returns a random variant of the given rarity.
    /// </summary>
    public static OwnedHero GetRandomVariant(Random rng, string rarity)
    {
        var pool = AllVariants.Where(v => v.Rarity.Equals(rarity, StringComparison.OrdinalIgnoreCase)).ToList();
        if (!pool.Any())
        {
            pool = AllVariants.Where(v => v.Rarity.Equals("Common", StringComparison.OrdinalIgnoreCase)).ToList();
        }
        return CloneVariant(pool[rng.Next(pool.Count)]);
    }

    /// <summary>
    /// Returns common variants for starter packs.
    /// </summary>
    public static List<OwnedHero> CommonHeroes() =>
        AllVariants.Where(v => v.Rarity.Equals("Common", StringComparison.OrdinalIgnoreCase))
            .Select(CloneVariant)
            .ToList();

    private static OwnedHero CloneVariant(OwnedHero v) => new()
    {
        HeroId = v.HeroId,
        VariantId = v.VariantId,
        Name = v.Name,
        Discipline = v.Discipline,
        Rarity = v.Rarity,
        Strength = v.Strength,
        Intellect = v.Intellect,
        Vitality = v.Vitality,
        Agility = v.Agility,
        CardImage = v.CardImage,
        AcquiredAt = DateTime.UtcNow
    };

    private static List<OwnedHero> BuildAllVariants()
    {
        var list = new List<OwnedHero>();
        foreach (var hero in heroes.Values)
        {
            foreach (var rarity in rarityScale.Keys)
            {
                var scale = rarityScale[rarity];
                list.Add(new OwnedHero
                {
                    HeroId = hero.Id,
                    VariantId = $"{hero.Id}-{rarity.ToLower()}",
                    Name = hero.Name,
                    Discipline = hero.Discipline,
                    Rarity = rarity,
                    Strength = ScaleStat(hero.Strength, scale),
                    Intellect = ScaleStat(hero.Intellect, scale),
                    Vitality = ScaleStat(hero.Vitality, scale),
                    Agility = ScaleStat(hero.Agility, scale),
                    CardImage = hero.CardImage,
                    AcquiredAt = DateTime.UtcNow
                });
            }
        }

        return list;
    }

    private static int ScaleStat(int stat, double multiplier) =>
        (int)Math.Round(stat * multiplier, MidpointRounding.AwayFromZero);

    private record HeroBase(string Id, string Name, string Discipline, int Strength, int Intellect, int Vitality, int Agility, string CardImage);
}
