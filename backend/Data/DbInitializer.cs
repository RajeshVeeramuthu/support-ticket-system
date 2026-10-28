using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<AppUser>>();

        await db.Database.MigrateAsync();

        var accounts = new[]
        {
            new
            {
                Name = "System Admin",
                Email = configuration["SeedAccounts:AdminEmail"],
                Password = configuration["SeedAccounts:AdminPassword"],
                Role = UserRoles.Admin
            },
            new
            {
                Name = "Support Agent",
                Email = configuration["SeedAccounts:AgentEmail"],
                Password = configuration["SeedAccounts:AgentPassword"],
                Role = UserRoles.Agent
            }
        };

        foreach (var account in accounts)
        {
            if (string.IsNullOrWhiteSpace(account.Email) ||
                string.IsNullOrWhiteSpace(account.Password))
            {
                continue;
            }

            var email = account.Email.Trim().ToLowerInvariant();

            if (await db.Users.AnyAsync(u => u.Email == email))
                continue;

            var user = new AppUser
            {
                FullName = account.Name,
                Email = email,
                Role = account.Role,
                IsActive = true
            };

            user.PasswordHash = hasher.HashPassword(
                user, account.Password);

            db.Users.Add(user);
        }

        await db.SaveChangesAsync();
    }
}