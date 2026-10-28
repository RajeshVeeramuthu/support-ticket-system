using System.ComponentModel.DataAnnotations;

namespace SupportTicket.Api.DTOs;

public record RegisterRequest(
    [Required, StringLength(100, MinimumLength = 1)] string FullName,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password
);

public record CreateStaffUserRequest(
    [Required, StringLength(100, MinimumLength = 1)] string FullName,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(100)] string Password,
    [Required] string Role
);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required] string Password
);

public record UserResponse(
    int Id,
    string FullName,
    string Email,
    string Role
);

public record AuthResponse(
    string Token,
    UserResponse User
);

public record StaffUserResponse(
    int Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt
);