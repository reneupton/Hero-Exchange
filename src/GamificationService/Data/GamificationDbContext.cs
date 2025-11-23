using GamificationService.Entities;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace GamificationService.Data;

public class GamificationDbContext : DbContext
{
    public GamificationDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<UserWallet> UserWallets { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<UserGamification> UserGamifications { get; set; }
    public DbSet<Quest> Quests { get; set; }
    public DbSet<QuestProgress> QuestProgress { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<ActivityFeed> ActivityFeeds { get; set; }
    public DbSet<MysteryBox> MysteryBoxes { get; set; }
    public DbSet<MysteryBoxOpening> MysteryBoxOpenings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Add MassTransit outbox tables
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();

        // UserWallet configuration
        modelBuilder.Entity<UserWallet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.FlogBalance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FlogStaked).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalEarned).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalSpent).HasColumnType("decimal(18,2)");
        });

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BuyerId);
            entity.HasIndex(e => e.SellerId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Fee).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.UserWallet)
                .WithMany(w => w.Transactions)
                .HasForeignKey(e => e.UserWalletId);
        });

        // UserGamification configuration
        modelBuilder.Entity<UserGamification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.Level);
            entity.HasIndex(e => e.XP);
        });

        // Quest configuration
        modelBuilder.Entity<Quest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.QuestId).IsUnique();
            entity.HasIndex(e => e.Type);
        });

        // QuestProgress configuration
        modelBuilder.Entity<QuestProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.QuestId });

            entity.HasOne(e => e.Quest)
                .WithMany()
                .HasForeignKey(e => e.QuestId);

            entity.HasOne(e => e.UserGamification)
                .WithMany(u => u.QuestProgress)
                .HasForeignKey(e => e.UserGamificationId);
        });

        // Achievement configuration
        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AchievementId).IsUnique();
            entity.HasIndex(e => e.Category);
        });

        // UserAchievement configuration
        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.AchievementId }).IsUnique();

            entity.HasOne(e => e.Achievement)
                .WithMany()
                .HasForeignKey(e => e.AchievementId);

            entity.HasOne(e => e.UserGamification)
                .WithMany(u => u.Achievements)
                .HasForeignKey(e => e.UserGamificationId);
        });

        // ActivityFeed configuration
        modelBuilder.Entity<ActivityFeed>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.UserId);
        });

        // MysteryBox configuration
        modelBuilder.Entity<MysteryBox>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BoxId).IsUnique();
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
        });

        // MysteryBoxOpening configuration
        modelBuilder.Entity<MysteryBoxOpening>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.OpenedAt);
            entity.Property(e => e.FlogSpent).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FlogReceived).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.MysteryBox)
                .WithMany()
                .HasForeignKey(e => e.MysteryBoxId);
        });
    }
}
