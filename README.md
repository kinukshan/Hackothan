Inventory Management System - Project Skeleton

Overview
--------
This repository contains a skeleton for a small Inventory Management System built for a hackathon. It includes:
- backend/InventoryManagement.Api — ASP.NET Core Web API (.NET 8) with EF Core (Npgsql)
- frontend/inventory-client — React + Vite (JavaScript) with React Router

Quick start (one-time setup)
----------------------------
Prerequisites:
- .NET 8 SDK
- Node.js (16+ recommended) and npm
- PostgreSQL (local or remote)

1) Backend

cd backend/InventoryManagement.Api
# restore & build
dotnet restore
dotnet build

# To run (development):
# Option A: set env var for connection string
export ConnectionStrings__DefaultConnection="Host=localhost;Database=inventory_db;Username=postgres;Password=postgres"
dotnet run

# Swagger will be available at: http://localhost:5000/swagger (port may vary; see console output)

Notes:
- App reads DefaultConnection from appsettings.json and will fallback to the environment variable ConnectionStrings__DefaultConnection if present.
- EF Core is configured with the Npgsql provider. Migrations are not created in this skeleton — create them when ready:
  dotnet ef migrations add InitialCreate -p InventoryManagement.Api -s InventoryManagement.Api
  dotnet ef database update

2) Frontend

cd frontend/inventory-client
npm install
npm run dev

# The dev server runs on http://localhost:5173 by default. The frontend expects the API to run at the URL set by VITE_API_URL (see .env.example).

Team task split
---------------
(Replace with names and tasks)
- Backend: API routes, EF models, migrations
- Frontend: Pages, API integration, styling
- DevOps: DB setup, CI / deployment

Files & Structure
-----------------
- /backend/InventoryManagement.Api: ASP.NET Core Web API project
- /frontend/inventory-client: Vite React app

Contact
-------
This assistant: AI assistant using Copilot CLI runtime in VS Code
