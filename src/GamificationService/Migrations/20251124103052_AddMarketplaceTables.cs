using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamificationService.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketplaceTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketplaceBids",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ItemId = table.Column<string>(type: "text", nullable: false),
                    BidderId = table.Column<string>(type: "text", nullable: false),
                    BidderUsername = table.Column<string>(type: "text", nullable: false),
                    BidAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceBids", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MarketplaceItems",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    BuyNowPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartingBidPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    CurrentBidPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    CurrentBidderId = table.Column<string>(type: "text", nullable: true),
                    Emoji = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Rarity = table.Column<string>(type: "text", nullable: false),
                    Condition = table.Column<string>(type: "text", nullable: false),
                    SellerId = table.Column<string>(type: "text", nullable: false),
                    SellerUsername = table.Column<string>(type: "text", nullable: false),
                    SellerLevel = table.Column<int>(type: "integer", nullable: false),
                    Views = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SoldAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BuyerId = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserInventory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ItemId = table.Column<string>(type: "text", nullable: false),
                    ItemName = table.Column<string>(type: "text", nullable: false),
                    Emoji = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: true),
                    Rarity = table.Column<string>(type: "text", nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AcquiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsListed = table.Column<bool>(type: "boolean", nullable: false),
                    ListingId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInventory", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceBids_BidderId",
                table: "MarketplaceBids",
                column: "BidderId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceBids_CreatedAt",
                table: "MarketplaceBids",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceBids_ItemId",
                table: "MarketplaceBids",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceItems_Category",
                table: "MarketplaceItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceItems_ExpiresAt",
                table: "MarketplaceItems",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceItems_SellerId",
                table: "MarketplaceItems",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceItems_Status",
                table: "MarketplaceItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserInventory_ItemId",
                table: "UserInventory",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserInventory_UserId",
                table: "UserInventory",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketplaceBids");

            migrationBuilder.DropTable(
                name: "MarketplaceItems");

            migrationBuilder.DropTable(
                name: "UserInventory");
        }
    }
}
