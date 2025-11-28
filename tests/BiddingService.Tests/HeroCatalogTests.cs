using BiddingService.Services;
using FluentAssertions;
using Xunit;

namespace BiddingService.Tests;

public class HeroCatalogTests
{
    [Fact]
    public void Rarities_ShouldContainAllFourRarities()
    {
        // Arrange & Act
        var rarities = HeroCatalog.Rarities;

        // Assert
        rarities.Should().HaveCount(4);
        rarities.Should().Contain("Common");
        rarities.Should().Contain("Rare");
        rarities.Should().Contain("Epic");
        rarities.Should().Contain("Legendary");
    }

    [Fact]
    public void AllVariants_ShouldReturnAllHeroVariants()
    {
        // Arrange & Act
        var variants = HeroCatalog.AllVariants;

        // Assert
        // 10 heroes * 4 rarities = 40 variants
        variants.Should().HaveCount(40);
    }

    [Theory]
    [InlineData("veyla", "Veyla the Shadow Lich", "Necromancer")]
    [InlineData("elyra", "Elyra Nocturne", "Oracle")]
    [InlineData("morr", "Morr Wispblade", "Reaper")]
    [InlineData("sigrun", "Sigrun Dawnbreak", "Valkyrie")]
    [InlineData("caelys", "Caelys Ember-Crusader", "Warrior")]
    [InlineData("torhild", "Torhild Embercore", "Guardian")]
    [InlineData("grum", "Grum Ironhorn", "Berserker")]
    [InlineData("dresh", "Dresh Wildarrow", "Ranger")]
    public void GetVariant_ShouldReturnCorrectHero(string heroId, string expectedName, string expectedDiscipline)
    {
        // Arrange & Act
        var variant = HeroCatalog.GetVariant(heroId, "Rare");

        // Assert
        variant.Should().NotBeNull();
        variant!.Name.Should().Be(expectedName);
        variant.Discipline.Should().Be(expectedDiscipline);
        variant.HeroId.Should().Be(heroId);
    }

    [Theory]
    [InlineData("Common", 0.7)]
    [InlineData("Rare", 1.0)]
    [InlineData("Epic", 1.25)]
    [InlineData("Legendary", 1.5)]
    public void GetVariant_ShouldScaleStatsByRarity(string rarity, double expectedMultiplier)
    {
        // Arrange
        // Veyla has base stats: 42 STR, 95 INT, 68 VIT, 54 AGI
        var baseStrength = 42;
        var expectedStrength = (int)Math.Round(baseStrength * expectedMultiplier, MidpointRounding.AwayFromZero);

        // Act
        var variant = HeroCatalog.GetVariant("veyla", rarity);

        // Assert
        variant.Should().NotBeNull();
        variant!.Rarity.Should().Be(rarity);
        variant.Strength.Should().Be(expectedStrength);
    }

    [Fact]
    public void GetVariant_WithInvalidHeroId_ShouldReturnNull()
    {
        // Arrange & Act
        var variant = HeroCatalog.GetVariant("nonexistent", "Rare");

        // Assert
        variant.Should().BeNull();
    }

    [Fact]
    public void GetVariant_WithInvalidRarity_ShouldReturnNull()
    {
        // Arrange & Act
        var variant = HeroCatalog.GetVariant("veyla", "Mythic");

        // Assert
        variant.Should().BeNull();
    }

    [Fact]
    public void GetVariant_ShouldBeCaseInsensitive()
    {
        // Arrange & Act
        var variant1 = HeroCatalog.GetVariant("VEYLA", "LEGENDARY");
        var variant2 = HeroCatalog.GetVariant("Veyla", "Legendary");
        var variant3 = HeroCatalog.GetVariant("veyla", "legendary");

        // Assert
        variant1.Should().NotBeNull();
        variant2.Should().NotBeNull();
        variant3.Should().NotBeNull();

        variant1!.VariantId.Should().Be(variant2!.VariantId);
        variant2.VariantId.Should().Be(variant3!.VariantId);
    }

    [Fact]
    public void GetVariant_ShouldReturnCorrectVariantId()
    {
        // Arrange & Act
        var variant = HeroCatalog.GetVariant("grum", "Epic");

        // Assert
        variant.Should().NotBeNull();
        variant!.VariantId.Should().Be("grum-epic");
    }

    [Theory]
    [InlineData("Common")]
    [InlineData("Rare")]
    [InlineData("Epic")]
    [InlineData("Legendary")]
    public void GetRandomVariant_ShouldReturnVariantWithCorrectRarity(string rarity)
    {
        // Arrange
        var rng = new Random(42); // Fixed seed for reproducibility

        // Act
        var variant = HeroCatalog.GetRandomVariant(rng, rarity);

        // Assert
        variant.Should().NotBeNull();
        variant.Rarity.Should().Be(rarity);
    }

    [Fact]
    public void GetRandomVariant_ShouldReturnDifferentHeroesWithDifferentSeeds()
    {
        // Arrange
        var rng1 = new Random(1);
        var rng2 = new Random(999);

        // Act
        var variants1 = Enumerable.Range(0, 10)
            .Select(_ => HeroCatalog.GetRandomVariant(rng1, "Rare"))
            .ToList();

        var variants2 = Enumerable.Range(0, 10)
            .Select(_ => HeroCatalog.GetRandomVariant(rng2, "Rare"))
            .ToList();

        // Assert
        // With different seeds, we should get at least some different results
        var heroIds1 = variants1.Select(v => v.HeroId).ToHashSet();
        var heroIds2 = variants2.Select(v => v.HeroId).ToHashSet();

        // They shouldn't be exactly the same (very unlikely with different seeds)
        (heroIds1.SetEquals(heroIds2) && variants1.SequenceEqual(variants2)).Should().BeFalse();
    }

    [Fact]
    public void AllVariants_ShouldHaveValidCardImagePaths()
    {
        // Arrange & Act
        var variants = HeroCatalog.AllVariants;

        // Assert
        foreach (var variant in variants)
        {
            variant.CardImage.Should().NotBeNullOrEmpty();
            variant.CardImage.Should().StartWith("/pets/");
            variant.CardImage.Should().EndWith(".png");
        }
    }

    [Fact]
    public void AllVariants_ShouldHavePositiveStats()
    {
        // Arrange & Act
        var variants = HeroCatalog.AllVariants;

        // Assert
        foreach (var variant in variants)
        {
            variant.Strength.Should().BeGreaterThan(0);
            variant.Intellect.Should().BeGreaterThan(0);
            variant.Vitality.Should().BeGreaterThan(0);
            variant.Agility.Should().BeGreaterThan(0);
        }
    }

    [Fact]
    public void LegendaryVariants_ShouldHaveHigherStatsThanCommonVariants()
    {
        // Arrange & Act
        var commonVariant = HeroCatalog.GetVariant("veyla", "Common");
        var legendaryVariant = HeroCatalog.GetVariant("veyla", "Legendary");

        // Assert
        commonVariant.Should().NotBeNull();
        legendaryVariant.Should().NotBeNull();

        var commonTotal = commonVariant!.Strength + commonVariant.Intellect +
                          commonVariant.Vitality + commonVariant.Agility;
        var legendaryTotal = legendaryVariant!.Strength + legendaryVariant.Intellect +
                             legendaryVariant.Vitality + legendaryVariant.Agility;

        legendaryTotal.Should().BeGreaterThan(commonTotal);
    }

    [Fact]
    public void AllVariants_ShouldHaveUniqueVariantIds()
    {
        // Arrange & Act
        var variants = HeroCatalog.AllVariants;
        var variantIds = variants.Select(v => v.VariantId).ToList();

        // Assert
        variantIds.Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public void EachHero_ShouldHaveFourRarityVariants()
    {
        // Arrange & Act
        var variants = HeroCatalog.AllVariants;
        var groupedByHero = variants.GroupBy(v => v.HeroId);

        // Assert
        foreach (var group in groupedByHero)
        {
            group.Should().HaveCount(4, $"Hero {group.Key} should have 4 rarity variants");
            group.Select(v => v.Rarity).Should().BeEquivalentTo(HeroCatalog.Rarities);
        }
    }
}
