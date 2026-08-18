using System;
using System.ComponentModel.DataAnnotations;
using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Dtos
{
    public class StockTransactionCreateDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }
    }

    public class StockTransactionDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class StockTransactionResponseDto
    {
        public ProductDto Product { get; set; } = null!;
        public StockTransactionDto Transaction { get; set; } = null!;
    }
}
