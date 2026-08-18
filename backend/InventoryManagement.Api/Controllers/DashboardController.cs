using InventoryManagement.Api.Data;
using InventoryManagement.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ApiControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalStockValue = await _context.Products
                .SumAsync(p => p.Price * p.QuantityInStock);

            var lowStockProductsQuery = _context.Products
                .Include(p => p.Category)
                .Where(p => p.QuantityInStock <= p.ReorderLevel);

            var lowStockCount = await lowStockProductsQuery.CountAsync();
            var lowStockProducts = await lowStockProductsQuery
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Sku = p.Sku,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    Price = p.Price,
                    QuantityInStock = p.QuantityInStock,
                    ReorderLevel = p.ReorderLevel,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            var recentTransactions = await _context.StockTransactions
                .Include(t => t.Product)
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new StockTransactionDto
                {
                    Id = t.Id,
                    ProductId = t.ProductId,
                    ProductName = t.Product != null ? t.Product.Name : string.Empty,
                    Type = t.Type.ToString(),
                    Quantity = t.Quantity,
                    Note = t.Note,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            var summary = new DashboardSummaryDto
            {
                TotalProducts = totalProducts,
                TotalStockValue = totalStockValue,
                LowStockCount = lowStockCount,
                LowStockProducts = lowStockProducts,
                RecentTransactions = recentTransactions
            };

            return Ok(summary);
        }
    }
}
