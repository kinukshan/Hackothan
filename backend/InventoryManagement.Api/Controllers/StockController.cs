using InventoryManagement.Api.Data;
using InventoryManagement.Api.Dtos;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ApiControllerBase
    {
        private readonly AppDbContext _context;

        public StockController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("transactions")]
        public async Task<ActionResult<StockTransactionResponseDto>> CreateTransaction([FromBody] StockTransactionCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed.", errors = ModelState });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Acquire the row lock first, standalone
                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT 1 FROM \"Products\" WHERE \"Id\" = {0} FOR UPDATE", dto.ProductId);

                // Then load the tracked entity normally — already locked within this transaction
                var product = await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

                if (product == null)
                {
                    return NotFound(new { message = $"Product with id {dto.ProductId} was not found." });
                }

                if (dto.Type == TransactionType.Out)
                {
                    if (product.QuantityInStock < dto.Quantity)
                    {
                        return BadRequest(new { message = "insufficient stock" });
                    }
                    product.QuantityInStock -= dto.Quantity;
                }
                else if (dto.Type == TransactionType.In)
                {
                    product.QuantityInStock += dto.Quantity;
                }
                else
                {
                    // Unreachable: Model binder rejects values not present in the TransactionType enum beforehand.
                    return BadRequest(new { message = "Invalid transaction type." });
                }

                var stockTransaction = new StockTransaction
                {
                    ProductId = dto.ProductId,
                    Type = dto.Type,
                    Quantity = dto.Quantity,
                    Note = dto.Note?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.StockTransactions.Add(stockTransaction);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = new StockTransactionResponseDto
                {
                    Product = new ProductDto
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
                    },
                    Transaction = new StockTransactionDto
                    {
                        Id = stockTransaction.Id,
                        ProductId = stockTransaction.ProductId,
                        ProductName = product.Name,
                        Type = stockTransaction.Type.ToString(),
                        Quantity = stockTransaction.Quantity,
                        Note = stockTransaction.Note,
                        CreatedAt = stockTransaction.CreatedAt
                    }
                };

                return Ok(response);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<StockTransactionDto>>> GetTransactions([FromQuery] int limit = 10)
        {
            if (limit <= 0)
            {
                return BadRequest(new { message = "Limit must be greater than 0." });
            }

            if (limit > 100)
            {
                limit = 100;
            }

            var transactions = await _context.StockTransactions
                .Include(t => t.Product)
                .OrderByDescending(t => t.CreatedAt)
                .Take(limit)
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

            return Ok(transactions);
        }
    }
}
