using System.Net;
using InventoryManagement.Api.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace InventoryManagement.Api.Middlewares
{
    // Global exception handler middleware that returns consistent JSON error responses
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var err = new ErrorResponse
            {
                Message = "An unexpected error occurred.",
                Details = exception.Message,
                TraceId = context.TraceIdentifier
            };

            var json = JsonSerializer.Serialize(err);
            return context.Response.WriteAsync(json);
        }
    }
}