using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    public class HealthController : ApiControllerBase
    {
        [HttpGet("/health")]
        public IActionResult Get() => Ok(new { status = "Healthy" });
    }
}