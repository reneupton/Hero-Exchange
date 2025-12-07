using AuctionService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Data;

public class DbInitialiser
{
    // Rarity weights matching the backend (Common: 65%, Rare: 22%, Epic: 10%, Legendary: 3%)
    private static readonly (string Rarity, int Weight)[] RarityWeights =
    {
        ("Common", 65),
        ("Rare", 22),
        ("Epic", 10),
        ("Legendary", 3)
    };

    // Stat multipliers by rarity
    private static readonly Dictionary<string, double> RarityScale = new()
    {
        { "Common", 0.7 },
        { "Rare", 1.0 },
        { "Epic", 1.25 },
        { "Legendary", 1.5 }
    };

    private static string PickWeightedRarity(Random random)
    {
        var total = RarityWeights.Sum(r => r.Weight);
        var roll = random.Next(1, total + 1);
        var cumulative = 0;
        foreach (var (rarity, weight) in RarityWeights)
        {
            cumulative += weight;
            if (roll <= cumulative)
                return rarity;
        }
        return "Common";
    }

    private static string ScaleStats(int str, int intel, int vit, int agi, string rarity)
    {
        var scale = RarityScale.GetValueOrDefault(rarity, 1.0);
        var scaledStr = (int)Math.Round(str * scale);
        var scaledInt = (int)Math.Round(intel * scale);
        var scaledVit = (int)Math.Round(vit * scale);
        var scaledAgi = (int)Math.Round(agi * scale);
        return $"STR {scaledStr} | INT {scaledInt} | VIT {scaledVit} | AGI {scaledAgi}";
    }

    public static void InitDb(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        SeedData(scope.ServiceProvider.GetService<AuctionDbContext>());
    }

    private static void SeedData(AuctionDbContext context)
    {
        context.Database.Migrate();

        if (context.Auctions.Any())
        {
            Console.WriteLine("Data already exists");
            return;
        }

        // Hero archetypes with base stats (before rarity scaling)
        var archetypes = new (string Title, string Brand, int Str, int Int, int Vit, int Agi, string Colorway, string Specs, string ImageUrl)[]
        {
            ("Veyla the Shadow Lich", "Necromancer", 42, 95, 68, 54, "Arcane", "Master of shadow flames and soul drain.", "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png"),
            ("Elyra Nocturne", "Oracle", 34, 88, 60, 58, "Umbral", "Seer of eclipses, whispers prophecies.", "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png"),
            ("Morr Wispblade", "Reaper", 68, 64, 58, 72, "Wraith", "Edge of dusk; silent executioner.", "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png"),
            ("Sigrun Dawnbreak", "Valkyrie", 90, 48, 82, 70, "Sunsteel", "Skyrider who guards fallen champions.", "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png"),
            ("Caelys Ember-Crusader", "Warrior", 82, 32, 78, 52, "Emberbone", "Frontline bastion wielding holy fire.", "/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png"),
            ("Torhild Embercore", "Guardian", 88, 28, 92, 28, "Magma", "Living bulwark of stone and flame.", "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png"),
            ("Frostech Ward", "Guardian", 74, 35, 86, 32, "Frost", "Icebound sentinel, anchors the line.", "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png"),
            ("Grum Ironhorn", "Berserker", 96, 18, 88, 44, "Bronze", "Stampeding minotaur, unstoppable charge.", "/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png"),
            ("Astrael Fallen", "Reaper", 76, 74, 72, 66, "Celestial", "Winged revenant with twilight scythe.", "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angel_1/card/frame_0.png"),
            ("Dresh Wildarrow", "Ranger", 58, 24, 52, 68, "Verdant", "Quickdraw hunter of the wild clans.", "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png")
        };

        var sellers = new[] { "alice", "bob", "tom", "nova", "echo", "pixel", "blade", "ember" };
        var random = new Random(99);

        var auctions = new List<Auction>();

        for (var i = 0; i < 70; i++)
        {
            var archetype = archetypes[i % archetypes.Length];
            var rarity = PickWeightedRarity(random);
            var seller = sellers[random.Next(sellers.Length)];
            var reserve = random.Next(80, 1500);
            var endDate = DateTime.UtcNow.AddDays(random.Next(-5, 45));
            var status = endDate <= DateTime.UtcNow
                ? (random.NextDouble() > 0.4 ? Status.Finished : Status.ReserveNotMet)
                : Status.Live;

            auctions.Add(new Auction
            {
                Id = Guid.NewGuid(),
                Status = status,
                ReservePrice = reserve,
                Seller = seller,
                AuctionEnd = endDate,
                Item = new Item
                {
                    Title = $"{archetype.Title} #{i + 1:00}",
                    Brand = archetype.Brand,
                    Category = rarity,
                    Variant = ScaleStats(archetype.Str, archetype.Int, archetype.Vit, archetype.Agi, rarity),
                    Condition = "Hero",
                    Colorway = archetype.Colorway,
                    ReleaseYear = 2025 - (i % 3 == 0 ? 1 : 0),
                    Specs = archetype.Specs,
                    ImageUrl = archetype.ImageUrl
                }
            });
        }

        context.AddRange(auctions);
        context.SaveChanges();
    }
}
