using InventoryManagement.Api.Middlewares;
using Microsoft.AspNetCore.Builder;

namespace InventoryManagement.Api.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseJsonExceptionHandler(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionMiddleware>();
        }
    }
}