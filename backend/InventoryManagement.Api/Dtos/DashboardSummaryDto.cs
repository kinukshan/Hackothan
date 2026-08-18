using System.Collections.Generic;

namespace InventoryManagement.Api.Dtos
{
    public class DashboardSummaryDto
    {
        public int TotalProducts { get; set; }
        public decimal TotalStockValue { get; set; }
        public int LowStockCount { get; set; }
        public IEnumerable<ProductDto> LowStockProducts { get; set; } = new List<ProductDto>();
        public IEnumerable<StockTransactionDto> RecentTransactions { get; set; } = new List<StockTransactionDto>();
    }
}
