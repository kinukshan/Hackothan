using InventoryManagement.Api.Data;
using InventoryManagement.Api.Dtos;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ApiControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] string? sortDir = "desc")
        {
            if (!string.IsNullOrWhiteSpace(sortBy) && !IsValidSort(sortBy))
            {
                return BadRequest(new { message = "sortBy must be one of name, sku, price, quantityInStock, createdAt, categoryId." });
            }

            if (!string.IsNullOrWhiteSpace(sortDir) && !sortDir.Equals("asc", StringComparison.OrdinalIgnoreCase) && !sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "sortDir must be either asc or desc." });
            }

            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim();
                query = query.Where(p =>
                    p.Name.Contains(searchTerm) ||
                    p.Sku.Contains(searchTerm));
            }

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            query = ApplySorting(query, sortBy ?? "createdAt", sortDir ?? "desc");

            var products = await query
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Sku = p.Sku,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name,
                    Price = p.Price,
                    QuantityInStock = p.QuantityInStock,
                    ReorderLevel = p.ReorderLevel,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Product with id {id} was not found." });
            }

            return Ok(MapToDto(product));
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> Create([FromBody] ProductCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed.", errors = ModelState });
            }

            if (dto.Price < 0)
            {
                return BadRequest(new { message = "Price must be greater than or equal to 0." });
            }

            if (dto.QuantityInStock < 0)
            {
                return BadRequest(new { message = "Quantity in stock must be greater than or equal to 0." });
            }

            if (dto.ReorderLevel < 0)
            {
                return BadRequest(new { message = "Reorder level must be greater than or equal to 0." });
            }

            if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            {
                return BadRequest(new { message = $"Category with id {dto.CategoryId} was not found." });
            }

            var normalizedSku = dto.Sku.Trim();
            if (await _context.Products.AnyAsync(p => p.Sku.ToLower() == normalizedSku.ToLower()))
            {
                return BadRequest(new { message = $"Product SKU '{normalizedSku}' already exists." });
            }

            var product = new Product
            {
                Name = dto.Name.Trim(),
                Sku = normalizedSku,
                CategoryId = dto.CategoryId,
                Price = dto.Price,
                QuantityInStock = dto.QuantityInStock,
                ReorderLevel = dto.ReorderLevel,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var createdProduct = await _context.Products
                .Include(p => p.Category)
                .FirstAsync(p => p.Id == product.Id);

            return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, MapToDto(createdProduct));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed.", errors = ModelState });
            }

            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Product with id {id} was not found." });
            }

            if (dto.Price < 0)
            {
                return BadRequest(new { message = "Price must be greater than or equal to 0." });
            }

            if (dto.QuantityInStock < 0)
            {
                return BadRequest(new { message = "Quantity in stock must be greater than or equal to 0." });
            }

            if (dto.ReorderLevel < 0)
            {
                return BadRequest(new { message = "Reorder level must be greater than or equal to 0." });
            }

            if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            {
                return BadRequest(new { message = $"Category with id {dto.CategoryId} was not found." });
            }

            var normalizedSku = dto.Sku.Trim();
            var duplicateSkuExists = await _context.Products
                .AnyAsync(p => p.Id != id && p.Sku.ToLower() == normalizedSku.ToLower());

            if (duplicateSkuExists)
            {
                return BadRequest(new { message = $"Product SKU '{normalizedSku}' already exists." });
            }

            product.Name = dto.Name.Trim();
            product.Sku = normalizedSku;
            product.CategoryId = dto.CategoryId;
            product.Price = dto.Price;
            product.QuantityInStock = dto.QuantityInStock;
            product.ReorderLevel = dto.ReorderLevel;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(product));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"Product with id {id} was not found." });
            }

            var hasTransactions = await _context.StockTransactions.AnyAsync(t => t.ProductId == id);
            if (hasTransactions)
            {
                return BadRequest(new { message = "Cannot delete product because it has associated stock transactions." });
            }

            try
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest(new { message = "Cannot delete product because it is referenced by other records." });
            }

            return NoContent();
        }

        private static ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Sku = product.Sku,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                Price = product.Price,
                QuantityInStock = product.QuantityInStock,
                ReorderLevel = product.ReorderLevel,
                CreatedAt = product.CreatedAt
            };
        }

        private static IQueryable<Product> ApplySorting(IQueryable<Product> query, string sortBy, string sortDir)
        {
            var isDescending = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);

            return sortBy.ToLowerInvariant() switch
            {
                "name" => isDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
                "sku" => isDescending ? query.OrderByDescending(p => p.Sku) : query.OrderBy(p => p.Sku),
                "price" => isDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
                "quantityinstock" => isDescending ? query.OrderByDescending(p => p.QuantityInStock) : query.OrderBy(p => p.QuantityInStock),
                "createdat" => isDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
                "categoryid" => isDescending ? query.OrderByDescending(p => p.CategoryId) : query.OrderBy(p => p.CategoryId),
                _ => isDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
            };
        }

        private static bool IsValidSort(string sortBy)
        {
            return sortBy.Equals("name", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("sku", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("price", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("quantityInStock", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("createdAt", StringComparison.OrdinalIgnoreCase)
                || sortBy.Equals("categoryId", StringComparison.OrdinalIgnoreCase);
        }
    }
}
