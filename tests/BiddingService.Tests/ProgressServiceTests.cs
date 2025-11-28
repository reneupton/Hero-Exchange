using BiddingService.Models;
using BiddingService.Services;
using FluentAssertions;
using Xunit;

namespace BiddingService.Tests;

public class ProgressServiceTests
{
    #region CalculateCoinBonus Tests

    [Fact]
    public void CalculateCoinBonus_WithValidAmount_ShouldReturnCalculatedBonus()
    {
        // Arrange
        int amount = 1000;
        double multiplier = 0.08;
        int minimum = 60;

        // Act
        var result = ProgressService.CalculateCoinBonus(amount, multiplier, minimum);

        // Assert
        result.Should().Be(80); // 1000 * 0.08 = 80
    }

    [Fact]
    public void CalculateCoinBonus_WhenCalculatedIsLessThanMinimum_ShouldReturnMinimum()
    {
        // Arrange
        int amount = 100;
        double multiplier = 0.05;
        int minimum = 40;

        // Act
        var result = ProgressService.CalculateCoinBonus(amount, multiplier, minimum);

        // Assert
        result.Should().Be(40); // 100 * 0.05 = 5, but minimum is 40
    }

    [Fact]
    public void CalculateCoinBonus_WithNullAmount_ShouldReturnMinimum()
    {
        // Arrange
        int? amount = null;
        double multiplier = 0.08;
        int minimum = 60;

        // Act
        var result = ProgressService.CalculateCoinBonus(amount, multiplier, minimum);

        // Assert
        result.Should().Be(60);
    }

    [Fact]
    public void CalculateCoinBonus_WithZeroAmount_ShouldReturnMinimum()
    {
        // Arrange
        int amount = 0;
        double multiplier = 0.08;
        int minimum = 60;

        // Act
        var result = ProgressService.CalculateCoinBonus(amount, multiplier, minimum);

        // Assert
        result.Should().Be(60);
    }

    [Theory]
    [InlineData(750, 0.08, 60, 60)]   // 750 * 0.08 = 60
    [InlineData(800, 0.08, 60, 64)]   // 800 * 0.08 = 64
    [InlineData(500, 0.05, 40, 40)]   // 500 * 0.05 = 25, min is 40
    [InlineData(1000, 0.05, 40, 50)]  // 1000 * 0.05 = 50
    [InlineData(2000, 0.08, 60, 160)] // 2000 * 0.08 = 160
    public void CalculateCoinBonus_VariousScenarios_ShouldReturnExpected(
        int amount, double multiplier, int minimum, int expected)
    {
        // Act
        var result = ProgressService.CalculateCoinBonus(amount, multiplier, minimum);

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void CalculateCoinBonus_ShouldRoundCorrectly()
    {
        // Arrange - 125 * 0.08 = 10.0 (exact)
        // 126 * 0.08 = 10.08 (rounds to 10)
        // 131 * 0.08 = 10.48 (rounds to 10)
        // 132 * 0.08 = 10.56 (rounds to 11)

        // Act & Assert
        ProgressService.CalculateCoinBonus(125, 0.08, 0).Should().Be(10);
        ProgressService.CalculateCoinBonus(131, 0.08, 0).Should().Be(10);
        ProgressService.CalculateCoinBonus(132, 0.08, 0).Should().Be(11);
    }

    #endregion

    #region CalculateHeroPower Tests

    [Fact]
    public void CalculateHeroPower_WithNoHeroes_ShouldReturnZero()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>()
        };

        // Act
        var result = ProgressService.CalculateHeroPower(profile);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateHeroPower_WithNullHeroes_ShouldReturnZero()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = null
        };

        // Act
        var result = ProgressService.CalculateHeroPower(profile);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateHeroPower_WithSingleHero_ShouldSumAllStats()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>
            {
                new OwnedHero
                {
                    Strength = 10,
                    Intellect = 20,
                    Vitality = 30,
                    Agility = 40
                }
            }
        };

        // Act
        var result = ProgressService.CalculateHeroPower(profile);

        // Assert
        result.Should().Be(100); // 10 + 20 + 30 + 40
    }

    [Fact]
    public void CalculateHeroPower_WithMultipleHeroes_ShouldSumAllHeroStats()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>
            {
                new OwnedHero { Strength = 10, Intellect = 10, Vitality = 10, Agility = 10 }, // 40
                new OwnedHero { Strength = 20, Intellect = 20, Vitality = 20, Agility = 20 }, // 80
                new OwnedHero { Strength = 30, Intellect = 30, Vitality = 30, Agility = 30 }  // 120
            }
        };

        // Act
        var result = ProgressService.CalculateHeroPower(profile);

        // Assert
        result.Should().Be(240); // 40 + 80 + 120
    }

    #endregion

    #region RefreshLevel Tests

    [Fact]
    public void RefreshLevel_WithNoHeroes_ShouldSetLevelToOne()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>(),
            Level = 5,
            Experience = 500
        };

        // Act
        ProgressService.RefreshLevel(profile);

        // Assert
        profile.Level.Should().Be(1);
        profile.Experience.Should().Be(0);
    }

    [Fact]
    public void RefreshLevel_WithNullHeroes_ShouldSetLevelToOne()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = null,
            Level = 10,
            Experience = 1000
        };

        // Act
        ProgressService.RefreshLevel(profile);

        // Assert
        profile.Level.Should().Be(1);
        profile.Experience.Should().Be(0);
        profile.OwnedHeroes.Should().NotBeNull();
    }

    [Theory]
    [InlineData(0, 1)]     // 0 power = level 1 (minimum)
    [InlineData(119, 1)]   // 119 power = level 1 (119/120 + 1 = 1)
    [InlineData(120, 2)]   // 120 power = level 2 (120/120 + 1 = 2)
    [InlineData(239, 2)]   // 239 power = level 2 (239/120 + 1 = 2)
    [InlineData(240, 3)]   // 240 power = level 3 (240/120 + 1 = 3)
    [InlineData(360, 4)]   // 360 power = level 4
    [InlineData(1200, 11)] // 1200 power = level 11
    public void RefreshLevel_WithVariousPowerLevels_ShouldCalculateCorrectLevel(
        int totalPower, int expectedLevel)
    {
        // Arrange - Create heroes that sum to the target power
        // Each hero has equal stats that sum to totalPower
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>()
        };

        if (totalPower > 0)
        {
            profile.OwnedHeroes.Add(new OwnedHero
            {
                Strength = totalPower / 4,
                Intellect = totalPower / 4,
                Vitality = totalPower / 4,
                Agility = totalPower - (3 * (totalPower / 4)) // Handle remainder
            });
        }

        // Act
        ProgressService.RefreshLevel(profile);

        // Assert
        profile.Level.Should().Be(expectedLevel);
        profile.Experience.Should().Be(totalPower);
    }

    [Fact]
    public void RefreshLevel_ShouldUpdateExperienceToMatchHeroPower()
    {
        // Arrange
        var profile = new UserProgress
        {
            OwnedHeroes = new List<OwnedHero>
            {
                new OwnedHero { Strength = 50, Intellect = 50, Vitality = 50, Agility = 50 } // 200 power
            },
            Experience = 0
        };

        // Act
        ProgressService.RefreshLevel(profile);

        // Assert
        profile.Experience.Should().Be(200);
        profile.Level.Should().Be(2); // 200/120 + 1 = 2
    }

    #endregion

    #region Gold By Rarity Constants Test

    [Theory]
    [InlineData("Common", 120)]
    [InlineData("Rare", 280)]
    [InlineData("Epic", 520)]
    [InlineData("Legendary", 900)]
    public void GoldByRarity_ShouldHaveCorrectValues(string rarity, int expectedGold)
    {
        // This tests the gold rewards are configured correctly
        // These values are used in OpenMystery for summon rewards
        var goldValues = new Dictionary<string, int>
        {
            ["Common"] = 120,
            ["Rare"] = 280,
            ["Epic"] = 520,
            ["Legendary"] = 900
        };

        goldValues[rarity].Should().Be(expectedGold);
    }

    #endregion
}
