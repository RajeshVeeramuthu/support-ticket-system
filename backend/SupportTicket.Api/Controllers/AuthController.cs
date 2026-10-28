using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicket.Api.Data;
using SupportTicket.Api.DTOs;
using SupportTicket.Api.Models;
using SupportTicket.Api.Services;

namespace SupportTicket.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db,
    IPasswordHasher<AppUser> passwordHasher,
    JwtService jwtService
) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var emailAlreadyExists = await db.Users
            .AnyAsync(u => u.Email == email);

        if (emailAlreadyExists)
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
            Role = UserRoles.User,
            IsActive = true
        };

        user.PasswordHash = passwordHasher.HashPassword(
            user,
            request.Password
        );

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var response = new AuthResponse(
            jwtService.GenerateToken(user),
            new UserResponse(
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            )
        );

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await db.Users
            .SingleOrDefaultAsync(u => u.Email == email);

        if (user is null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var verification = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var response = new AuthResponse(
            jwtService.GenerateToken(user),
            new UserResponse(
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            )
        );

        return Ok(response);
    }
}