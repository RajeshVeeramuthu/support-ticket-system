using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.DTOs;
using SupportTicket.Api.Models;

namespace SupportTicket.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = UserRoles.Admin)]
public class AdminUsersController(
    AppDbContext db,
    IPasswordHasher<AppUser> passwordHasher
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StaffUserResponse>>> GetUsers()
    {
        var users = await db.Users
            .OrderBy(user => user.Role)
            .ThenBy(user => user.FullName)
            .Select(user => new StaffUserResponse(
                user.Id,
                user.FullName,
                user.Email,
                user.Role,
                user.IsActive,
                user.CreatedAt
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    public async Task<ActionResult<StaffUserResponse>> CreateStaffUser(
        CreateStaffUserRequest request)
    {
        var role = request.Role.Trim().ToUpperInvariant();
        if (role != UserRoles.Agent && role != UserRoles.Admin)
        {
            return BadRequest(new
            {
                message = "Staff role must be AGENT or ADMIN."
            });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return Conflict(new
            {
                message = "Email is already registered."
            });
        }

        var user = new AppUser
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Role = role,
            IsActive = true
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var response = new StaffUserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.IsActive,
            user.CreatedAt
        );

        return Ok(response);
    }
}
