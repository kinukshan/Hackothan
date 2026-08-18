using InventoryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<StockTransaction> StockTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Sku)
                .HasColumnName("SKU");

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Sku)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Electronics", Description = "Gadgets and digital accessories.", CreatedAt = new DateTime(2025, 1, 5, 9, 0, 0, DateTimeKind.Utc) },
                new Category { Id = 2, Name = "Office Supplies", Description = "Desk and productivity essentials.", CreatedAt = new DateTime(2025, 1, 6, 9, 0, 0, DateTimeKind.Utc) },
                new Category { Id = 3, Name = "Home & Living", Description = "Everyday household items.", CreatedAt = new DateTime(2025, 1, 7, 9, 0, 0, DateTimeKind.Utc) },
                new Category { Id = 4, Name = "Apparel", Description = "Clothing and accessories.", CreatedAt = new DateTime(2025, 1, 8, 9, 0, 0, DateTimeKind.Utc) }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Wireless Mouse", Sku = "WM-001", CategoryId = 1, Price = 24.99m, QuantityInStock = 35, ReorderLevel = 5, CreatedAt = new DateTime(2025, 1, 10, 9, 30, 0, DateTimeKind.Utc) },
                new Product { Id = 2, Name = "Mechanical Keyboard", Sku = "MK-002", CategoryId = 1, Price = 79.99m, QuantityInStock = 18, ReorderLevel = 6, CreatedAt = new DateTime(2025, 1, 12, 14, 0, 0, DateTimeKind.Utc) },
                new Product { Id = 3, Name = "4K Monitor", Sku = "MON-003", CategoryId = 1, Price = 329.99m, QuantityInStock = 9, ReorderLevel = 4, CreatedAt = new DateTime(2025, 1, 14, 11, 15, 0, DateTimeKind.Utc) },
                new Product { Id = 4, Name = "Notebook Set", Sku = "NB-004", CategoryId = 2, Price = 12.50m, QuantityInStock = 62, ReorderLevel = 10, CreatedAt = new DateTime(2025, 1, 16, 8, 45, 0, DateTimeKind.Utc) },
                new Product { Id = 5, Name = "Desk Organizer", Sku = "DO-005", CategoryId = 2, Price = 18.00m, QuantityInStock = 27, ReorderLevel = 7, CreatedAt = new DateTime(2025, 1, 17, 13, 0, 0, DateTimeKind.Utc) },
                new Product { Id = 6, Name = "Ergonomic Chair", Sku = "EC-006", CategoryId = 2, Price = 185.75m, QuantityInStock = 12, ReorderLevel = 3, CreatedAt = new DateTime(2025, 1, 18, 10, 20, 0, DateTimeKind.Utc) },
                new Product { Id = 7, Name = "Ceramic Vase", Sku = "CV-007", CategoryId = 3, Price = 34.99m, QuantityInStock = 21, ReorderLevel = 5, CreatedAt = new DateTime(2025, 2, 1, 10, 0, 0, DateTimeKind.Utc) },
                new Product { Id = 8, Name = "Linen Throw Blanket", Sku = "LB-008", CategoryId = 3, Price = 42.00m, QuantityInStock = 16, ReorderLevel = 6, CreatedAt = new DateTime(2025, 2, 2, 15, 30, 0, DateTimeKind.Utc) },
                new Product { Id = 9, Name = "Wall Clock", Sku = "WC-009", CategoryId = 3, Price = 29.50m, QuantityInStock = 24, ReorderLevel = 5, CreatedAt = new DateTime(2025, 2, 3, 9, 45, 0, DateTimeKind.Utc) },
                new Product { Id = 10, Name = "Cotton T-Shirt", Sku = "TS-010", CategoryId = 4, Price = 19.99m, QuantityInStock = 41, ReorderLevel = 8, CreatedAt = new DateTime(2025, 2, 5, 12, 10, 0, DateTimeKind.Utc) },
                new Product { Id = 11, Name = "Denim Jacket", Sku = "DJ-011", CategoryId = 4, Price = 89.00m, QuantityInStock = 14, ReorderLevel = 4, CreatedAt = new DateTime(2025, 2, 7, 9, 0, 0, DateTimeKind.Utc) },
                new Product { Id = 12, Name = "Leather Wallet", Sku = "LW-012", CategoryId = 4, Price = 49.95m, QuantityInStock = 22, ReorderLevel = 5, CreatedAt = new DateTime(2025, 2, 8, 11, 20, 0, DateTimeKind.Utc) }
            );
        }
    }
}